import { panic } from "near-sdk-js/lib/api";
import { Contract } from "./contract";
import { Listing } from "./listing";
import { restoreOwners } from "./nft_listing";
import { assert, bytes, near } from "near-sdk-js";

const GAS_FOR_ROYALTIES = 115_000_000_000_000;
const GAS_FOR_NFT_TRANSFER = 15_000_000_000_000;

export function internalRemoveListings({
  contract,
  listings,
}: {
  contract: Contract;
  listings: string[];
}) {
  let tokens: Listing[] = [];

  for (let key in listings) {
    let tokenId = listings[key];
    let listing = contract.listings.remove(tokenId) as Listing;
    if (listing == null) panic("No listing");

    let byOwnerId = restoreOwners(contract.byOwnerId.get(listing.owner_id));
    if (byOwnerId == null) panic("No Listing by Owner");
    byOwnerId.remove(tokenId);

    if (byOwnerId.isEmpty()) {
      contract.byOwnerId.remove(listing.owner_id);
    } else {
      contract.byOwnerId.set(listing.owner_id, byOwnerId);
    }

    let byCompanyId = restoreOwners(
      contract.byCompanyId.get(listing.company_id)
    );
    if (byCompanyId == null) panic("No Listing by Company");
    byCompanyId.remove(listing.token_id);

    if (byCompanyId.isEmpty()) {
      contract.byCompanyId.remove(listing.company_id);
    } else {
      contract.byCompanyId.set(listing.company_id, byCompanyId);
    }
    tokens.push(listing);
  }
  return { success: true, sales: tokens };
}

//place an offer on a specific sale. The sale will go through as long as your deposit is greater than or equal to the list price
export function internalOffer({
  contract,
  nftContractId,
  tokenId,
}: {
  contract: Contract;
  nftContractId: string;
  tokenId: string;
}) {
  //get the attached deposit and make sure it's greater than 0
  let deposit = near.attachedDeposit().valueOf();
  assert(deposit > 0, "deposit must be greater than 0");

  // //get the unique sale ID (contract + DELIMITER + token ID)
  // let contractAndTokenId = `${nftContractId}.${tokenId}`;
  // near.log("contractAndTokenId", contractAndTokenId);
  //get the sale object from the unique sale ID. If the sale doesn't exist, panic.
  let listing = contract.listings.get(tokenId) as Listing;
  if (listing == null) {
    near.panic("no sale");
  }

  //get the buyer ID which is the person who called the function and make sure they're not the owner of the sale
  let buyerId = near.predecessorAccountId();
  assert(buyerId != listing.owner_id, "you can't offer on your own sale");

  //get the u128 price of the token (dot 0 converts from U128 to u128)
  let price = BigInt(listing.sale_price);
  //make sure the deposit is greater than the price
  assert(deposit >= price, "deposit must be greater than or equal to price");

  //process the purchase (which will remove the sale, transfer and get the payout from the nft contract, and then distribute royalties)
  processPurchase({
    contract,
    nftContractId,
    tokenId,
    price: deposit.toString(),
    buyerId,
  });
}

//private function used when a sale is purchased.
//this will remove the sale, transfer and get the payout from the nft contract, and then distribute royalties
export function processPurchase({
  contract,
  nftContractId,
  tokenId,
  price,
  buyerId,
}: {
  contract: Contract;
  nftContractId: string;
  tokenId: string;
  price: string;
  buyerId: string;
}) {
  //get the sale object by removing the sale
  let { sales } = internalRemoveListings({ contract, listings: [tokenId] });
  let sale = sales[0];

  //initiate a cross contract call to the nft contract. This will transfer the token to the buyer and return
  //a payout object used for the market to distribute funds to the appropriate accounts.
  const promise = near.promiseBatchCreate(nftContractId);
  near.promiseBatchActionFunctionCall(
    promise,
    "nft_transfer_payout",
    bytes(
      JSON.stringify({
        receiver_id: buyerId, //purchaser (person to transfer the NFT to)
        token_id: tokenId, //token ID to transfer
        approval_id: sale.approval_id, //market contract's approval ID in order to transfer the token on behalf of the owner
        memo: "payout from market", //memo (to include some context)
        /*
                    the price that the token was purchased for. This will be used in conjunction with the royalty percentages
                    for the token in order to determine how much money should go to which account. 
                */
        balance: price,
        max_len_payout: 10, //the maximum amount of accounts the market can payout at once (this is limited by GAS)
      })
    ),
    1, // 1 yoctoNEAR
    GAS_FOR_NFT_TRANSFER
  );

  //after the transfer payout has been initiated, we resolve the promise by calling our own resolve_purchase function.
  //resolve purchase will take the payout object returned from the nft_transfer_payout and actually pay the accounts
  near.promiseThen(
    promise,
    near.currentAccountId(),
    "resolve_purchase",
    bytes(
      JSON.stringify({
        buyer_id: buyerId, //the buyer and price are passed in incase something goes wrong and we need to refund the buyer
        price: price,
      })
    ),
    0, // no deposit
    GAS_FOR_ROYALTIES
  );
  return near.promiseReturn(promise);
}

export function internalResolvePurchase({
  buyerId,
  price,
}: {
  buyerId: string;
  price: string;
}) {
  assert(
    near.currentAccountId() === near.predecessorAccountId(),
    "Only the contract itself can call this method"
  );

  // checking for payout information returned from the nft_transfer_payout method
  let result = near.promiseResult(0);
  let payout = null;
  if (typeof result === "string") {
    //if we set the payout_option to None, that means something went wrong and we should refund the buyer

    try {
      let payoutOption = JSON.parse(result);
      if (
        Object.keys(payoutOption.payout).length > 10 ||
        Object.keys(payoutOption.payout).length < 1
      ) {
        //we'll check if length of the payout object is > 10 or it's empty. In either case, we return None
        throw "Cannot have more than 10 royalties";
        //if the payout object is the correct length, we move forward
      } else {
        //we'll keep track of how much the nft contract wants us to payout. Starting at the full price payed by the buyer
        let remainder = BigInt(price);
        //loop through the payout and subtract the values from the remainder.
        Object.entries(payoutOption.payout).forEach(([key, value], index) => {
          remainder = remainder - BigInt(value as string);
        });

        //Check to see if the NFT contract sent back a faulty payout that requires us to pay more or too little.
        //The remainder will be 0 if the payout summed to the total price. The remainder will be 1 if the royalties
        //we something like 3333 + 3333 + 3333.
        if (remainder == BigInt(0) || remainder == BigInt(1)) {
          //set the payout because nothing went wrong
          payout = payoutOption.payout;
        } else {
          //if the remainder was anything but 1 or 0, we return None
          throw "Payout is not correct";
        }
      }
    } catch (e) {
      near.log(`error parsing payout object ${result}`);
      payout = null;
    }
  }

  //if the payout was null, we refund the buyer for the price they payed and return
  if (payout == null) {
    const promise = near.promiseBatchCreate(buyerId);
    near.promiseBatchActionTransfer(promise, BigInt(price));
    return price;
  }
  // NEAR payouts
  for (let [key, value] of Object.entries(payout)) {
    const promise = near.promiseBatchCreate(key);
    near.promiseBatchActionTransfer(promise, BigInt(value as string));
  }

  //return the price payout out
  return price;
}

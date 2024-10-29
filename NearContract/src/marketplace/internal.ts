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
  tokenIds,
}: {
  contract: Contract;
  nftContractId: string;
  tokenIds: string[];
}) {
  //get the attached deposit and make sure it's greater than 0
  let deposit = near.attachedDeposit().valueOf();
  let prices: bigint[] = [];
  assert(deposit > 0, "deposit must be greater than 0");

  //get the buyer ID which is the person who called the function and make sure they're not the owner of the sale
  let buyerId = near.predecessorAccountId();

  // //get the unique sale ID (contract + DELIMITER + token ID)
  // let contractAndTokenId = `${nftContractId}.${tokenId}`;
  // near.log("contractAndTokenId", contractAndTokenId);
  //get the sale object from the unique sale ID. If the sale doesn't exist, panic.
  for (let key in tokenIds) {
    let listing = contract.listings.get(tokenIds[key]) as Listing;
    if (listing == null) {
      near.panic("no sale");
    }
    assert(buyerId != listing.owner_id, "you can't offer on your own sale");
    //get the u128 price of the token (dot 0 converts from U128 to u128)
    let price = BigInt(listing.sale_price);
    prices.push(price);
  }

  let totalPrice = prices.reduce((a, b) => a + b);
  //make sure the deposit is greater than the price
  assert(
    deposit >= totalPrice,
    "deposit must be greater than or equal to price"
  );
  assert(
    prices.length == tokenIds.length,
    "deposit must be greater than or equal to price"
  );

  //process the purchase (which will remove the sale, transfer and get the payout from the nft contract, and then distribute royalties)
  processPurchase({
    contract,
    nftContractId,
    tokenIds,
    prices: prices.map((p) => p.toString()),
    buyerId,
  });
}

//private function used when a sale is purchased.
//this will remove the sale, transfer and get the payout from the nft contract, and then distribute royalties
export function processPurchase({
  contract,
  nftContractId,
  tokenIds,
  prices,
  buyerId,
}: {
  contract: Contract;
  nftContractId: string;
  tokenIds: string[];
  prices: string[];
  buyerId: string;
}) {
  // get the sales array by removing the listings
  let { sales } = internalRemoveListings({ contract, listings: tokenIds });

  // loop through each sale to initiate the transfer and payout
  const promises = sales.map((sale, index) => {
    const tokenId = tokenIds[index];
    const price = prices[index];

    // initiate a cross-contract call for each token transfer
    const promise = near.promiseBatchCreate(nftContractId);
    near.promiseBatchActionFunctionCall(
      promise,
      "nft_transfer_payout",
      bytes(
        JSON.stringify({
          receiver_id: buyerId,
          token_id: tokenId,
          approval_id: sale.approval_id,
          memo: "payout from market",
          balance: price,
          max_len_payout: 10,
        })
      ),
      1, // 1 yoctoNEAR
      GAS_FOR_NFT_TRANSFER
    );

    // resolve purchase for each token transfer
    near.promiseThen(
      promise,
      near.currentAccountId(),
      "resolve_purchase",
      bytes(
        JSON.stringify({
          buyer_id: buyerId,
          price: price,
        })
      ),
      0, // no deposit
      GAS_FOR_ROYALTIES
    );

    return promise;
  });

  // return the promise for the batch of all token purchases
  return near.promiseReturn(promises[promises.length - 1]);
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

  // check for payout information returned from nft_transfer_payout
  let result = near.promiseResult(0);
  let payout = null;

  if (typeof result === "string") {
    try {
      let payoutOption = JSON.parse(result);
      if (
        Object.keys(payoutOption.payout).length > 10 ||
        Object.keys(payoutOption.payout).length < 1
      ) {
        throw "Cannot have more than 10 royalties";
      } else {
        let remainder = BigInt(price);
        Object.entries(payoutOption.payout).forEach(([key, value]) => {
          remainder = remainder - BigInt(value as string);
        });

        if (remainder === BigInt(0) || remainder === BigInt(1)) {
          payout = payoutOption.payout;
        } else {
          throw "Payout is not correct";
        }
      }
    } catch (e) {
      near.log(`error parsing payout object ${result}`);
      payout = null;
    }
  }

  if (payout == null) {
    const promise = near.promiseBatchCreate(buyerId);
    near.promiseBatchActionTransfer(promise, BigInt(price));
    return price;
  }

  // execute NEAR payouts
  for (let [key, value] of Object.entries(payout)) {
    const promise = near.promiseBatchCreate(key);
    near.promiseBatchActionTransfer(promise, BigInt(value as string));
  }

  return price;
}

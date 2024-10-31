import { UnorderedSet, Vector, assert, near } from "near-sdk-js";
import { Contract } from "./nftcontract";
import { Token } from "./metadata";
import { NFT_METADATA_SPEC, NFT_STANDARD_NAME } from "./mint";

export function restoreOwners(collection) {
  if (!collection || typeof collection !== "object" || !collection.prefix) {
    return null;
  }
  return UnorderedSet.deserialize(collection as UnorderedSet);
}

// Burn function to remove an NFT from circulation
export function internalBurnToken({
  contract,
  token_ids,
  owner_id,
}: {
  contract: Contract;
  token_ids: string[];
  owner_id: string;
}) {
  token_ids.forEach((token_id) => {
    // Check if the token exists in tokensById
    const token = contract.tokensById.get(token_id) as Token;
    if (!token) {
      throw new Error("Token does not exist.");
    }

    // Ensure that the caller is the token owner or the contract owner
    if (token.owner_id !== owner_id && owner_id !== contract.owner_id) {
      throw new Error(
        "Only the token owner or contract owner can burn contract token."
      );
    }

    // Remove the token from tokensById
    contract.tokensById.remove(token_id);

    // Remove the token metadata
    contract.tokenMetadataById.remove(token_id);

    // Update the tokensPerOwner map
    let ownerTokens = restoreOwners(
      contract.tokensPerOwner.get(token.owner_id)
    );
    if (ownerTokens == null) {
      near.panic("No Tokens found for owner");
    }
    ownerTokens.remove(token_id);
    if (ownerTokens.isEmpty()) {
      contract.tokensPerOwner.remove(owner_id);
    } else {
      contract.tokensPerOwner.set(token.owner_id, ownerTokens);
    }
    // Log the burn event (optional)
    near.log(`Token ${token_id} burned by owner ${owner_id}`);
  });
}

export function internalAddTokenToOwner(
  contract: Contract,
  accountId: string,
  tokenId: string
) {
  // Ensure consistency in how you create new UnorderedSets
  let tokenSet = restoreOwners(contract.tokensPerOwner.get(accountId));
  // if (tokenSet) {
  //   const updatedTokens = tokenSet.concat(tokenId);
  //   contract.tokensPerOwner.set(accountId, updatedTokens);
  // }

  if (!tokenSet) {
    tokenSet = new UnorderedSet("tokensPerOwner" + accountId.toString());
  }

  // Insert the token ID into the set
  tokenSet.set(tokenId);

  // Save the set back to the contract storage
  contract.tokensPerOwner.set(accountId, tokenSet);
}

//remove a token from an owner (internal method and can't be called directly via CLI).
export function internalRemoveTokenFromOwner(
  contract: Contract,
  accountId: string,
  tokenId: string
) {
  //we get the set of tokens that the owner has
  let tokenSet = restoreOwners(contract.tokensPerOwner.get(accountId));
  //if there is no set of tokens for the owner, we panic with the following message:
  if (tokenSet == null) {
    near.panic("Token should be owned by the sender");
  }

  //we remove the the token_id from the set of tokens
  tokenSet.remove(tokenId);

  //if the token set is now empty, we remove the owner from the tokens_per_owner collection
  if (tokenSet.isEmpty()) {
    contract.tokensPerOwner.remove(accountId);
  } else {
    //if the token set is not empty, we simply insert it back for the account ID.
    contract.tokensPerOwner.set(accountId, tokenSet);
  }
}

//transfers the NFT to the receiver_id (internal method and can't be called directly via CLI).
export function internalTransfer(
  contract: Contract,
  senderId: string,
  receiverId: string,
  tokenId: string,
  approvalId: number,
  memo: string
): Token {
  //get the token object by passing in the token_id
  let token = contract.tokensById.get(tokenId) as Token;
  if (token == null) {
    near.panic("no token found");
  }

  //if the sender doesn't equal the owner, we check if the sender is in the approval list
  if (senderId != token.owner_id) {
    //if the token's approved account IDs doesn't contain the sender, we panic
    if (!token.approved_account_ids.hasOwnProperty(senderId)) {
      near.panic(`Unauthorized for ${senderId}`);
    }

    // If they included an approval_id, check if the sender's actual approval_id is the same as the one included
    if (approvalId != null) {
      //get the actual approval ID
      let actualApprovalId = token.approved_account_ids[senderId];
      //if the sender isn't in the map, we panic
      if (actualApprovalId == null) {
        near.panic("Sender is not approved account");
      }

      //make sure that the actual approval ID is the same as the one provided
      assert(
        actualApprovalId == approvalId,
        `The actual approval_id ${actualApprovalId} is different from the given approval_id ${approvalId}`
      );
    }
  }

  //we make sure that the sender isn't sending the token to themselves
  assert(
    token.owner_id != receiverId,
    "The token owner and the receiver should be different"
  );

  //we remove the token from it's current owner's set
  internalRemoveTokenFromOwner(contract, token.owner_id, tokenId);
  //we then add the token to the receiver_id's set
  internalAddTokenToOwner(contract, receiverId, tokenId);

  //we create a new token struct
  let newToken = new Token({
    ownerId: receiverId,
    //reset the approval account IDs
    approvedAccountIds: { "marketplace.yusufdimari.testnet": 1 },
    nextApprovalId: token.next_approval_id,
    //we copy over the royalties from the previous token
    royalty: token.royalty,
  });

  //insert that new token into the tokens_by_id, replacing the old entry
  contract.tokensById.set(tokenId, newToken);

  //if there was some memo attached, we log it.
  if (memo != null) {
    near.log(`Memo: ${memo}`);
  }

  // Default the authorized ID to be None for the logs.
  let authorizedId;

  //if the approval ID was provided, set the authorized ID equal to the sender
  if (approvalId != null) {
    authorizedId = senderId;
  }

  // Construct the transfer log as per the events standard.
  let nftTransferLog = {
    // Standard name ("nep171").
    standard: NFT_STANDARD_NAME,
    // Version of the standard ("nft-1.0.0").
    version: NFT_METADATA_SPEC,
    // The data related with the event stored in a vector.
    event: "nft_transfer",
    data: [
      {
        // The optional authorized account ID to transfer the token on behalf of the old owner.
        authorized_id: authorizedId,
        // The old owner's account ID.
        old_owner_id: token.owner_id,
        // The account ID of the new owner of the token.
        new_owner_id: receiverId,
        // A vector containing the token IDs as strings.
        token_ids: [tokenId],
        // An optional memo to include.
        memo,
      },
    ],
  };

  // Log the serialized json.
  near.log(JSON.stringify(nftTransferLog));

  //return the previous token object that was transferred.
  return token;
}

//transfers the token to the receiver ID and returns the payout object that should be payed given the passed in balance.
export function internalNftTransferPayout({
  contract,
  receiverId,
  tokenId,
  approvalId,
  memo,
  balance,
  maxLenPayout,
}: {
  contract: Contract;
  receiverId: string;
  tokenId: string;
  approvalId: number;
  memo: string;
  balance: bigint;
  maxLenPayout: number;
}): { payout: { [key: string]: string } } {
  //assert that the user attached 1 yocto NEAR for security reasons
  assertOneYocto();
  //get the sender ID
  let senderId = near.predecessorAccountId();
  //transfer the token to the passed in receiver and get the previous token object back
  let previousToken: Token = internalTransfer(
    contract,
    senderId,
    receiverId,
    tokenId,
    approvalId,
    memo
  );

  //refund the previous token owner for the storage used up by the previous approved account IDs
  refundApprovedAccountIds(
    previousToken.owner_id,
    previousToken.approved_account_ids
  );

  //get the owner of the token
  let ownerId = previousToken.owner_id;
  //keep track of the total perpetual royalties
  let totalPerpetual = 0;
  //keep track of the payout object to send back
  let payoutObj: { [key: string]: string } = {};
  //get the royalty object from token
  let royalty = previousToken.royalty;

  //make sure we're not paying out to too many people (GAS limits this)
  assert(
    Object.keys(royalty).length <= maxLenPayout,
    "Market cannot payout to that many receivers"
  );

  //go through each key and value in the royalty object
  Object.entries(royalty).forEach(([key, value], index) => {
    //only insert into the payout if the key isn't the token owner (we add their payout at the end)
    if (key != ownerId) {
      payoutObj[key] = royaltyToPayout(value, balance);
      totalPerpetual += value;
    }
  });

  // payout to previous owner who gets 100% - total perpetual royalties
  payoutObj[ownerId] = royaltyToPayout(10000 - totalPerpetual, balance);

  //return the payout object
  return {
    payout: payoutObj,
  };
}

export function assertOneYocto() {
  assert(
    near.attachedDeposit().toString() === "1",
    "Requires attached deposit of exactly 1 yoctoNEAR"
  );
}

//convert the royalty percentage and amount to pay into a payout (U128)
export function royaltyToPayout(
  royaltyPercentage: number,
  amountToPay: bigint
): string {
  return (
    (BigInt(royaltyPercentage) * BigInt(amountToPay)) /
    BigInt(10000)
  ).toString();
}

//refund the storage taken up by passed in approved account IDs and send the funds to the passed in account ID.
export function refundApprovedAccountIdsIter(
  accountId: string,
  approvedAccountIds: string[]
) {
  //get the storage total by going through and summing all the bytes for each approved account IDs
  let storageReleased = approvedAccountIds
    .map((e) => bytesForApprovedAccountId(e))
    .reduce((partialSum, a) => partialSum + a, 0);
  let amountToTransfer =
    BigInt(storageReleased) * near.storageByteCost().valueOf();

  // Send the money to the beneficiary (TODO: don't use batch actions)
  const promise = near.promiseBatchCreate(accountId);
  near.promiseBatchActionTransfer(promise, amountToTransfer);
}

//refund a map of approved account IDs and send the funds to the passed in account ID
export function refundApprovedAccountIds(
  accountId: string,
  approvedAccountIds: { [key: string]: number }
) {
  //call the refundApprovedAccountIdsIter with the approved account IDs as keys
  refundApprovedAccountIdsIter(accountId, Object.keys(approvedAccountIds));
}

//calculate how many bytes the account ID is taking up
export function bytesForApprovedAccountId(accountId: string): number {
  // The extra 4 bytes are coming from Borsh serialization to store the length of the string.
  return accountId.length + 4 + 8;
}

export function refundDeposit(storageUsed: bigint) {
  //get how much it would cost to store the information
  let requiredCost = storageUsed * near.storageByteCost().valueOf();
  //get the attached deposit
  let attachedDeposit = near.attachedDeposit().valueOf();

  //make sure that the attached deposit is greater than or equal to the required cost
  assert(
    requiredCost <= attachedDeposit,
    `Must attach ${requiredCost} yoctoNEAR to cover storage`
  );

  //get the refund amount from the attached deposit - required cost
  let refund = attachedDeposit - requiredCost;
  near.log(`Refunding ${refund} yoctoNEAR`);

  //if the refund is greater than 1 yocto NEAR, we refund the predecessor that amount
  if (refund > 1) {
    // Send the money to the beneficiary (TODO: don't use batch actions)
    const promise = near.promiseBatchCreate(near.predecessorAccountId());
    near.promiseBatchActionTransfer(promise, refund);
  }
}

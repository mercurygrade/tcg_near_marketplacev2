import { UnorderedSet, Vector, assert, near } from "near-sdk-js";
import { Contract } from "./MyContract";
import { Token } from "./metadata";

// export function restoreOwners(collection) {
//   if (collection == null) {
//     return null;
//   }
//   // Create a new UnorderedSet with the same storage prefix

//       static deserialize(data) {
//         let set = new UnorderedSet(data.prefix);
//         // reconstruct UnorderedSet
//         set.length = data.length;
//         // reconstruct Vector
//         let elementsPrefix = data.prefix + "e";
//         set.elements = new Vector(elementsPrefix);
//         set.elements.length = data.elements.length;
//         return set;
//     }
//   // return new UnorderedSet<string>(collection);
// }
export function restoreOwners(collection) {
  if (!collection || typeof collection !== "object" || !collection.prefix) {
    return null;
  }
  return UnorderedSet.deserialize(collection as UnorderedSet);
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
    near.log(`Creating new UnorderedSet for account: ${accountId}`);
    tokenSet = new UnorderedSet("tokensPerOwner" + accountId.toString());
  }

  // Insert the token ID into the set
  tokenSet.set(tokenId);

  // Save the set back to the contract storage
  contract.tokensPerOwner.set(accountId, tokenSet);
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

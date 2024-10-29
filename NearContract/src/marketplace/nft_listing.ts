import { UnorderedSet, assert, near } from "near-sdk-js";
import { Contract } from "./contract";
import { Listing } from "./listing";

export const list_nft = ({
  contract,
  token_id,
  owner_id,
  approval_id,
  company_id,
  sale_price,
}: {
  contract: Contract;
  token_id: string;
  owner_id: string;
  approval_id: number;
  company_id: string;
  sale_price: string;
}) => {
  const signerId = near.signerAccountId();
  const contractId = near.predecessorAccountId();

  //make sure the signer isnt the predecessor
  // assert(
  //   signerId != contractId,
  //   "this function can only be called via a cross-contract call"
  // );
  assert(owner_id == signerId, "Only the owner can approve this transaction");

  let listing = new Listing({
    approval_id,
    company_id,
    owner_id,
    sale_price,
    token_id,
  });

  let alreadyExist = contract.listings.get(token_id);
  assert(!alreadyExist, "Token already listed in Marketplace");
  //add the token to the marketplace listing
  contract.listings.set(token_id, listing);

  //add the token to the company listing
  let byCompanyId = restoreOwners(contract.byCompanyId.get(company_id));
  if (!byCompanyId) {
    byCompanyId = new UnorderedSet("byCompanyId" + company_id.toString());
  }
  byCompanyId.set(token_id);
  contract.byCompanyId.set(company_id, byCompanyId);

  //add the token to the owner listing
  let byOwnerId = restoreOwners(contract.byOwnerId.get(owner_id));
  if (!byOwnerId) {
    byOwnerId = new UnorderedSet("byOwnerId" + owner_id.toString());
  }
  byOwnerId.set(token_id);
  contract.byOwnerId.set(owner_id, byOwnerId);

  return {
    success: true,
  };
};

export function restoreOwners(collection) {
  if (!collection || typeof collection !== "object" || !collection.prefix) {
    return null;
  }
  return UnorderedSet.deserialize(collection as UnorderedSet);
}

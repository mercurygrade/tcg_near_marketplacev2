import { Contract } from "./contract";
import { restoreOwners } from "./nft_listing";

export class Listing {
  token_id: string;
  owner_id: string;
  approval_id: number;
  company_id: string;
  sale_price: string;
  constructor({
    token_id,
    owner_id,
    approval_id,
    company_id,
    sale_price,
  }: {
    token_id: string;
    owner_id: string;
    approval_id: number;
    company_id: string;
    sale_price: string;
  }) {
    this.token_id = token_id;
    this.owner_id = owner_id;
    this.approval_id = approval_id;
    this.company_id = company_id;
    this.sale_price = sale_price;
  }
}

export const get_listings = ({
  contract,
}: {
  contract: Contract;
}): Listing[] => {
  const listings: Listing[] = [];

  let keys = contract.listings.keys;
  for (let key of keys.toArray()) {
    const listing = contract.listings.get(key as string);
    if (listing) {
      listings.push(listing as Listing);
    }
  }

  return listings;
};

export const get_listings_by_company = ({
  contract,
  company_id,
}: {
  contract: Contract;
  company_id: string;
}) => {
  const listings = Array.from(
    restoreOwners(contract.byCompanyId.get(company_id)) || []
  );
  return listings;
};

export const get_listings_by_owner = ({
  contract,
  owner_id,
}: {
  contract: Contract;
  owner_id: string;
}) => {
  const listings = Array.from(
    restoreOwners(contract.byOwnerId.get(owner_id)) || []
  );
  return listings;
};

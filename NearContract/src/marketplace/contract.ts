import {
  LookupMap,
  NearBindgen,
  NearContract,
  UnorderedMap,
  call,
  near,
  view,
} from "near-sdk-js";
import { list_nft } from "./nft_listing";
import {
  get_listings,
  get_listings_by_company,
  get_listings_by_owner,
} from "./listing";

//@ts-ignore
@NearBindgen
export class Contract extends NearContract {
  ownerId: string;
  listings: UnorderedMap;
  byOwnerId: LookupMap;
  byCompanyId: LookupMap;
  storageDeposits: LookupMap;

  constructor({ owner_id }: { owner_id: string }) {
    super();
    this.ownerId = owner_id;
    this.listings = new UnorderedMap("listings");
    this.byOwnerId = new LookupMap("byOwnerId");
    this.byCompanyId = new LookupMap("byCompanyId");
    this.storageDeposits = new LookupMap("storageDeposits");
  }

  default() {
    return new Contract({ owner_id: "" });
  }

  //@ts-ignore
  @call
  //list the nft for sale in marketPlace
  nft_list({ token_id, owner_id, approval_id, company_id, sale_price }) {
    return list_nft({
      contract: this,
      token_id,
      owner_id,
      approval_id,
      company_id,
      sale_price,
    });
  }

  //@ts-ignore
  @view
  get_all_listings() {
    return get_listings({ contract: this });
  }
  //@ts-ignore
  @view
  get_company_listings({ company_id }) {
    return get_listings_by_company({ contract: this, company_id });
  }
  //@ts-ignore
  @view
  get_owner_listings({ owner_id }) {
    return get_listings_by_owner({ contract: this, owner_id });
  }
}

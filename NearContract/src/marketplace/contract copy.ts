// import {
//   LookupMap,
//   NearBindgen,
//   NearContract,
//   UnorderedMap,
//   call,
//   near,
//   view,
// } from "near-sdk-js";
// import { list_nft } from "./nft_listing";
// import { get_listings } from "./listing";

// //@ts-ignore
// @NearBindgen
// export class Contract extends NearContract {
//   ownerId: string;
//   listings: UnorderedMap;
//   byOwnerId: LookupMap;
//   byCompanyId: LookupMap;
//   storageDeposits: LookupMap;

//   constructor({ owner_id }: { owner_id: string }) {
//     super();
//     this.ownerId = owner_id;
//     this.listings = new UnorderedMap("listings");
//     this.byOwnerId = new LookupMap("byOwnerId");
//     this.byCompanyId = new LookupMap("byCompanyId");
//     this.storageDeposits = new LookupMap("storageDeposits");
//   }

//   default() {
//     return new Contract({ owner_id: "" });
//   }

//   //@ts-ignore
//   @call
//   //list the nft for sale in marketPlace
//   nft_list({ token_id, owner_id, approval_id, company_id, sale_price }) {
//     near.log("Listing NFT to marketplace");
//     try {
//       return list_nft({
//         contract: this,
//         token_id,
//         owner_id,
//         approval_id,
//         company_id,
//         sale_price,
//       });
//     } catch (error) {
//       near.log("error", error);
//     }
//   }

//   //@ts-ignore
//   @view
//   get_all_listings() {
//     return get_listings({ contract: this });
//   }
// }

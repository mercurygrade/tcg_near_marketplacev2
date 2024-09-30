import {
  LookupMap,
  NearBindgen,
  NearContract,
  UnorderedMap,
  call,
  near,
  view,
} from "near-sdk-js";
import { NFTContractMetadata, Token, TokenMetadata } from "./metadata";
import { mintNFT, getOwnerTokens } from "./mint";

@NearBindgen
export class Contract extends NearContract {
  owner_id: string;
  tokensPerOwner: LookupMap;
  tokensById: LookupMap;
  tokenMetadataById: UnorderedMap;
  metadata: NFTContractMetadata;

  constructor({
    owner_id,
    metadata = {
      spec: "nft-1.0.0",
      name: "NFT Tutorial Contract",
      symbol: "GOTEAM",
    },
  }) {
    super();
    this.metadata = metadata;
    this.owner_id = owner_id;
    this.tokensPerOwner = new LookupMap("tokensPerOwner");
    this.tokensById = new LookupMap("tokensById");
    this.tokenMetadataById = new UnorderedMap("tokensMetadataById");
  }

  default() {
    return new Contract({ owner_id: "" });
  }

  @call
  nft_mint({ token_id, metadata, receiver_id, perpetual_royalties }) {
    return mintNFT({
      contract: this,
      receiverId: receiver_id,
      tokenId: token_id,
      metadata,
      perpetual_royalties,
    });
  }

  @view
  nft_tokens_for_owner({ account_id, from_index, limit }) {
    try {
      near.log(`Viewing Tokens`);
      return getOwnerTokens({
        contract: this,
        accountId: account_id,
        fromIndex: from_index,
        limit,
      });
    } catch (error) {
      near.log(`Error occurred: ${error.message}`);
      return [];
    }
  }
}

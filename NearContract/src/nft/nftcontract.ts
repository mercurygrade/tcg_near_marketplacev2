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
import { mintNFT, getOwnerTokens, getTokens, getTokenBatch } from "./mint";
import { internalBurnToken, internalNftTransferPayout } from "./internal";

//@ts-ignore
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
  //@ts-ignore
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

  //@ts-ignore
  @call
  nft_burn({ owner_id, token_ids }) {
    return internalBurnToken({ contract: this, owner_id, token_ids });
  }

  //@ts-ignore
  @view
  nft_tokens_for_owner({ account_id, from_index, limit }) {
    try {
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

  //@ts-ignore
  @view
  nft_tokens({ from_index, limit }) {
    try {
      return getTokens({ contract: this, fromIndex: from_index, limit });
    } catch (error) {
      near.log(`Contract Error occurred: ${error.message}`);
      return [];
    }
  }

  //@ts-ignore
  @view
  get_token_batch({ token_ids, from_index, limit }) {
    try {
      return getTokenBatch({
        contract: this,
        limit,
        token_ids,
        fromIndex: from_index,
      });
    } catch (error) {
      near.log(`Contract Error occurred: ${error.message}`);
      return [];
    }
  }

  //for Transfer of Tokens
  //@ts-ignore
  @call
  //transfers the token to the receiver ID and returns the payout object that should be payed given the passed in balance.
  nft_transfer_payout({
    receiver_id,
    token_id,
    approval_id,
    memo,
    balance,
    max_len_payout,
  }) {
    return internalNftTransferPayout({
      contract: this,
      receiverId: receiver_id,
      tokenId: token_id,
      approvalId: approval_id,
      memo: memo,
      balance: balance,
      maxLenPayout: max_len_payout,
    });
  }
}

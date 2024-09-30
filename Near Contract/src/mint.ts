import { storageUsage } from "near-sdk-js/lib/api";
import { Contract } from "./MyContract";
import { JsonToken, Token, TokenMetadata } from "./metadata";
import { UnorderedSet, assert, near } from "near-sdk-js";
import {
  internalAddTokenToOwner,
  refundDeposit,
  restoreOwners,
} from "./internal";

export const NFT_METADATA_SPEC = "nft-1.0.0";

/// This is the name of the NFT standard we're using
export const NFT_STANDARD_NAME = "nep171";

export function mintNFT({
  contract,
  receiverId,
  tokenId,
  metadata,
  perpetual_royalties,
}: {
  contract: Contract;
  receiverId: string;
  tokenId: string;
  metadata: TokenMetadata;
  perpetual_royalties: { [accountId: string]: number };
}) {
  let initialStorageUsage = storageUsage();
  let royalty: { [accountId: string]: number } = {};

  if (perpetual_royalties != null) {
    assert(
      Object.keys(perpetual_royalties).length < 7,
      "Cannot add more than 6 perpetual royalty amounts"
    );
    Object.entries(perpetual_royalties).forEach(([account, amount], index) => {
      royalty[account] = amount;
    });
  }

  let token = new Token({
    ownerId: receiverId,
    royalty,
    nextApprovalId: 0,
    approvedAccountIds: {},
  });

  assert(!contract.tokensById.containsKey(tokenId), "Token already exist");
  contract.tokensById.set(tokenId, token);
  contract.tokenMetadataById.set(tokenId, metadata);

  internalAddTokenToOwner(contract, receiverId, tokenId);

  let nftMintLog = {
    // Standard name ("nep171").
    standard: NFT_STANDARD_NAME,
    // Version of the standard ("nft-1.0.0").
    version: NFT_METADATA_SPEC,
    // The data related with the event stored in a vector.
    event: "nft_mint",
    data: [
      {
        // Owner of the token.
        owner_id: token.owner_id,
        // Vector of token IDs that were minted.
        token_ids: [tokenId],
      },
    ],
  };
  near.log(`EVENT_JSON:${JSON.stringify(nftMintLog)}`);

  //calculate the required storage which was the used - initial TODO
  let requiredStorageInBytes =
    storageUsage().valueOf() - initialStorageUsage.valueOf();

  //refund any excess storage if the user attached too much. Panic if they didn't attach enough to cover the required.
  refundDeposit(requiredStorageInBytes);
}

export function getToken({
  contract,
  tokenId,
}: {
  contract: Contract;
  tokenId: string;
}) {
  let token = contract.tokensById.get(tokenId) as Token;
  if (token == null) return null;
  let metadata = contract.tokenMetadataById.get(tokenId) as TokenMetadata;
  let jsToken = new JsonToken({
    metadata: metadata,
    ownerId: token.owner_id,
    approvedAccountIds: token.approved_account_ids,
    royalty: token.royalty,
    tokenId: tokenId,
  });
  return jsToken;
}

export function getOwnerTokens({
  contract,
  accountId,
  fromIndex,
  limit,
}: {
  contract: Contract;
  accountId: string;
  fromIndex?: string;
  limit?: string;
}): JsonToken[] {
  let tokenSet = restoreOwners(contract.tokensPerOwner.get(accountId));

  if (tokenSet == null) {
    return [];
  }
  let start = fromIndex ? parseInt(fromIndex) : 0;
  let max = limit ? parseInt(limit) : 50;
  let keys = tokenSet.toArray();
  let tokens: JsonToken[] = [];
  for (let i = start; i < max; i++) {
    if (i >= keys.length) {
      break;
    }
    let token = getToken({ contract, tokenId: keys[i] }) as JsonToken;
    tokens.push(token);
  }
  return tokens;
}

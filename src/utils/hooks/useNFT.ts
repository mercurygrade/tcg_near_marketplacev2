import { NFT } from "@/@types";
import React, { useState } from "react";
import { gql, GraphQLClient } from "graphql-request";
import useWallet from "./useWallet";

export default function useNFT() {
  const [NFTs, setNfts] = useState<NFT[]>([]);
  const { activeAccountId } = useWallet();

  const getNFTs = async (): Promise<NFT[]> => {
    const query = gql`
      query FetchNFTs($ownerId: String!) {
        mb_views_nft_tokens(where: { owner: { _eq: $ownerId } }) {
          metadata_id
          title
          media
        }
      }
    `;

    if (!activeAccountId) return [];
    console.log("getting nfts");
    const endpoint = "https://interop-testnet.hasura.app/v1/graphql";
    const client = new GraphQLClient(endpoint);

    try {
      const { mb_views_nft_tokens }: { mb_views_nft_tokens: NFT[] } =
        await client.request(query, {
          ownerId: activeAccountId,
        });
      setNfts(mb_views_nft_tokens);
      console.log("mb_views_nft_tokens", mb_views_nft_tokens);
      return mb_views_nft_tokens;
    } catch (error) {
      alert("failed to fetch NFTs");
      console.log(error);
    }
    return [];
  };

  return { NFTs, getNFTs, activeAccountId };
}

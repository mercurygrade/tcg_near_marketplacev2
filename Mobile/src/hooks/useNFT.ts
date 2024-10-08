import { useState } from "react";

import { urls } from "../utils";
import { request } from "../api/useApi";
import { useAppContext } from "../provider/Appprovider";

export default function useNFT() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, setNFTs, setUser } = useAppContext();

  const getNFTs = async () => {
    //verify that user has a wallet
    if (!user.isWalletConnected) return;
    setIsLoading(true);
    try {
      const { data } = await request.get(
        urls.app.nft.url + user.walletUsername
      );
      setNFTs(data.data);
      return data;
    } catch (error) {
      console.error(error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  const mintNFT = async () => {
    setIsLoading(true);

    //NFT data
    const fdata = {
      receiver_id: user.walletUsername,
      metadata: {
        title: "TCG-Token",
        description: "Carpool NFT",
        copies: 1,
      },
    };
    try {
      const { data } = await request.post(urls.app.nft.mint, fdata);
      console.log(data);

      //if success, get all user NFTs
      if (data) await getNFTs();
      return data;
    } catch (error) {
      console.error(error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  //generate an image of a forest using AI
  const generateImage = async () => {
    setIsLoading(true);
    try {
      const { data } = await request.get(urls.app.nft.generateImage);
      console.log("data", data);
    } catch (error) {
      console.error(error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, getNFTs, mintNFT };
}

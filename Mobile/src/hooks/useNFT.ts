import { useState } from "react";

import { urls } from "../utils";
import { addParamToUrl, request } from "../api/useApi";
import { useAppContext } from "../provider/Appprovider";
//@ts-ignore
import { TRIP } from "@env";

export default function useNFT() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, setNFTs, setUser } = useAppContext();
  const wallet_id = user.near_wallet.account_id;

  const getNFTs = async () => {
    //verify that user has a wallet
    if (!wallet_id) return;
    setIsLoading(true);
    try {
      const { data } = await request.get(
        addParamToUrl(urls.app.nft.url, { account_id: wallet_id })
      );
      if (data.success) {
        setNFTs(data.payload);
      }
      return data;
    } catch (error) {
      console.error(error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  const mintNFT = async () => {
    if (!wallet_id || !TRIP) return;
    const trip = JSON.parse(TRIP);

    setIsLoading(true);
    try {
      const { data } = await request.post(urls.app.nft.mint, trip);

      //if success, get all user NFTs
      if (data) await getNFTs();
      console.log(data);
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

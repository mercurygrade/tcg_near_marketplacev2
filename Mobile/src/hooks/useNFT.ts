import { useState } from "react";

import { urls } from "../utils";
import { addParamToUrl, request } from "../api/useApi";
import { useAppContext } from "../provider/Appprovider";

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
    if (!wallet_id) return;
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

const trip = {
  validTrip: false,
  status: "picked-up",
  id: "u1poB3dlZ2asShmQlq9u5wE2OUB3",
  corporate: "7Dbgl5Ja0KEjUgwzQkTD",
  credits: 11.4,
  co2Amount: 1.7476648399669303,
  name: "Joana",
  wallet_id: "test1.yusufdimari.testnet",
  seat: 4,
  avatar:
    "https://storage.googleapis.com/thecarbongames.appspot.com/compressed_avatars%2Ffemale_shirt_white_Avatarz_white_050.png",
  location: {
    coordinates: {
      latitude: 38.769107,
      longitude: -9.346284,
    },
    geohash: "eycke3dnrv",
    address:
      "Núcleo Empres. Abrunheira, Zona Poente - Pav. 7, 2635-634 Rio de Mouro, Portugal",
  },
  username: null,
};

import { useState } from "react";

import { urls } from "../utils";
import { request } from "../api/useApi";
import { useAppContext } from "../provider/Appprovider";

export default function useNFT() {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
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
    return generateImage();
    setIsLoading(true);
    try {
      const { data } = await request.post(urls.app.nft.mint, {
        receiver_id: user.walletUsername,
        metadata: {
          title: "TCG-Token",
          description: "Carpool NFT",
          media:
            "https://bafybeidl4hjbpdr6u6xvlrizwxbrfcyqurzvcnn5xoilmcqbxfbdwrmp5m.ipfs.dweb.link/",
          copies: 1,
        },
      });
      console.log(data);
      if (data) await getNFTs();
      return data;
    } catch (error) {
      console.error(error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async () => {
    try {
      const { data } = await request.get(urls.app.nft.generateImage);
      console.log("data", data);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  // const saveNFTImage = async () => {
  //   setIsLoading(true);
  //   try {
  //     const res = await axios.get(
  //       "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //       { responseType: "blob" }
  //     );
  //     return console.log(res.data);
  //     const fdata = new FormData();
  //     fdata.append("image", res.data.data, "nft-image.jpg");
  //     const { data } = await axios.post(BASE_URL + "/file", fdata, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  //     console.log(data);
  //     setImage(data.imageUrl);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return { isLoading, image, getNFTs, mintNFT };
}

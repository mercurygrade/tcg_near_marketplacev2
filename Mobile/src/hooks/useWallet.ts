import { useState } from "react";
import { Alert, Linking } from "react-native";
import * as Clipboard from "expo-clipboard";

import { urls } from "../utils";
import { addParamToUrl, request } from "../api/useApi";
import { useAppContext } from "../provider/Appprovider";

export default function useWallet() {
  const { user, setUser } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const wallet_id = user.near_wallet?.account_id;

  const onSeedPhraseCopied = (seedPhrase: string) => {
    if (typeof seedPhrase != "string") return;
    Clipboard.setStringAsync(seedPhrase);
    console.log(seedPhrase, "copied to Clipboard");
  };

  //creaete a new Wallet for the user
  const connectToWallet = async () => {
    //check if User already has a wallet
    if (wallet_id)
      return Alert.alert(
        "Already Connected",
        "This User already has a wallet connected"
      );
    if (!user.uid) return Alert.alert("Error", "Invalid User");

    //ensure a username for the wallet has been provided
    setIsLoading(true);

    try {
      const { data } = await request.post(
        addParamToUrl(urls.app.wallet.signIn, { uid: user.uid })
      );
      if (data.error) {
        console.error(data.error);
        Alert.alert("Error", "An Error occured");
        return false;
      }
      if (data.url) {
        Linking.openURL(data.url);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    connectToWallet,
    isLoading,
  };
}

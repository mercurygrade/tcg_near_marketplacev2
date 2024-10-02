import { useState } from "react";
import { Alert } from "react-native";
import * as Clipboard from "expo-clipboard";

import { urls } from "../utils";
import { request } from "../api/useApi";
import { useAppContext } from "../provider/Appprovider";

export default function useWallet() {
  const { user, setUser } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const onSeedPhraseCopied = (seedPhrase: string) => {
    if (typeof seedPhrase != "string") return;
    Clipboard.setStringAsync(seedPhrase);
    console.log(seedPhrase, "copied to Clipboard");
  };

  //creaete a new Wallet for the user
  const connectToWallet = async (username: string) => {
    //check if User already has a wallet
    if (user.isWalletConnected)
      return Alert.alert(
        "Already Connected",
        "This User already has a wallet connected"
      );

    //ensure a username for the wallet has been provided
    if (!username) return Alert.alert("Error", "Username not provided");
    setIsLoading(true);

    try {
      const { data } = await request.post(
        urls.app.wallet.create
          .replace("{{username}}", username)
          .replace("{{userId}}", user.uid)
      );
      if (data.error) {
        Alert.alert("Error", data.message);
        return false;
      }

      setUser(data.data.user);
      Alert.alert(
        "Wallet Created",
        `Your SeedPhrase will only be displayed once, please keep it securely:\n '${data.data.seedPhrase}'`,
        [
          {
            text: "Copy to Clipboard",
            onPress: () => onSeedPhraseCopied(data.data.seedPhrase),
          },
        ]
      );
      console.log(data.data);
      return data.data.final_execution_status == "EXECUTED";
    } catch (error) {
      console.error(error.response.data);
      Alert.alert("Error", error.response.data.error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    connectToWallet,
    isLoading,
  };
}

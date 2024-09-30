import { useState } from "react";
import { Alert } from "react-native";

import { urls } from "../utils";
import { request } from "../api/useApi";
import { useAppContext } from "../provider/Appprovider";

export default function useWallet() {
  const { user, setUser } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

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
      Alert.alert("Success", "Wallet Created");
      setUser(data.data.user);
      return data.data.data.final_execution_status == "EXECUTED";
    } catch (error) {
      console.error(error.response.data);
      Alert.alert("Error", error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    connectToWallet,
    isLoading,
  };
}

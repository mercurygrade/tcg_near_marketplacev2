import React, { useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView, Alert } from "react-native";
import * as Linking from "expo-linking";

import { useNFT } from "../../../hooks";
import { screens } from "../../../utils";
import { NFTCard, Button } from "../../../components";
import { useAppContext } from "../../../provider/Appprovider";
import { FlatList } from "react-native-gesture-handler";

export default function Home({ navigation }) {
  const { user, NFTs } = useAppContext();
  const { navigate } = navigation;
  const { mintNFT, getNFTs, isLoading } = useNFT();

  useEffect(() => {
    // getNFTs();
  }, [user]);

  const openNearWallet = async () => {
    // const nearWalletUrl =
    //   "nearwallet://authenticate?redirect=exp://172.20.10.3:8081/nearwallet";
    const herewalleturi = "herewallet://app";
    const walletUrl = "https://h4n.app/TRX_SHA1_IN_BASE64_URL_SAFE";
    const transactionHash = "YOUR_BASE64_ENCODED_TRANSACTION"; // Replace with your transaction hash

    const isSupported = true;
    const contractId = "social.near"; // The contract ID you want to use
    const callbackUrl = "exp://172.20.10.3:8081/"; // Your app's deep link or Expo URL

    // Construct the Here Wallet URL
    const hereWalletUrl = `herewallet://sign-in?contractId=${contractId}&callbackUrl=${callbackUrl}`;

    try {
      if (isSupported) {
        const res = await Linking.openURL(hereWalletUrl);
        console.log("res", res);
      } else {
        Alert.alert("Error", "Cannot open URL");
        console.log(isSupported);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = () => {
    //check if the user has a wallet connected to the account
    user.near_wallet.account_id
      ? mintNFT()
      : navigate(screens.app.wallet.create);
  };

  const buttonTitle = user.near_wallet.account_id
    ? "Simulate Trip Completed"
    : "Connect to Wallet";
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text>Full Name: {user.full_name}</Text>
        <Text>Email Address: {user.email}</Text>
        <Text>Wallet Username: {user.near_wallet.account_id}</Text>
        {/* {user.near_wallet.account_id && (
          <>
            <Text style={styles.title}>Minted NFTs</Text>
            <FlatList
              style={{ flexGrow: 0 }}
              data={NFTs}
              contentContainerStyle={styles.nftList}
              renderItem={({ item }) => (
                <NFTCard nft={item} key={item.token_id} />
              )}
            />
          </>
        )} */}
      </View>
      <Button title={buttonTitle} onPress={onSubmit} isLoading={isLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center" },
  container: { flex: 1, justifyContent: "center", padding: 10, gap: 10 },
  title: { fontWeight: "bold" },
  nftList: {
    flexDirection: "row",
    // flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
});

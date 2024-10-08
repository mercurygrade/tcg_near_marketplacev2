import React, { useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";

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
    getNFTs();
  }, []);

  const onSubmit = () =>
    //check if the user has a wallet connected to the account
    user.isWalletConnected ? mintNFT() : navigate(screens.app.wallet.create);

  const buttonTitle = user.isWalletConnected
    ? "Simulate Trip Completed"
    : "Connect to Wallet";
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text>Full Name: {user.displayName}</Text>
        <Text>Email Address: {user.email}</Text>
        <Text>Wallet Username: {user.walletUsername}</Text>
        {user.isWalletConnected && (
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
        )}
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

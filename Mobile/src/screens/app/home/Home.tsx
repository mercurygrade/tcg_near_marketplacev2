import React, { useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";

import { useNFT } from "../../../hooks";
import { screens } from "../../../utils";
import { NFT } from "../../../types/types";
import { NFTCard, Button } from "../../../components";
import { useAppContext } from "../../../provider/Appprovider";

export default function Home({ navigation }) {
  const { user, NFTs } = useAppContext();
  const { navigate } = navigation;
  const { mintNFT, getNFTs, isLoading } = useNFT();

  //get users NFTs
  useEffect(() => {
    getNFTs();
  }, []);

  const onSubmit = () =>
    //check if the user has a wallet connected to the account
    user.isWalletConnected ? mintNFT() : navigate(screens.app.wallet.create);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text>Wallet Username: {user.displayName}</Text>
        <Text>Email Address: {user.email}</Text>
        {user.isWalletConnected && (
          <>
            <Text style={styles.title}>Minted NFTs</Text>
            <View style={styles.nftList}>
              {NFTs?.map((nft: NFT) => (
                <NFTCard nft={nft} key={nft.token_id} />
              ))}
            </View>
          </>
        )}
      </View>

      <Button
        title={
          user.isWalletConnected
            ? "Simulate Trip Completed"
            : "Connect to Wallet"
        }
        onPress={onSubmit}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center" },
  container: { flex: 1, justifyContent: "center", padding: 10, gap: 10 },
  title: { fontWeight: "bold" },
  nftList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
});

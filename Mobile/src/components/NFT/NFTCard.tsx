import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { NFT } from "../../types/types";

export default function NFTCard({ nft }: { nft: NFT }) {
  return (
    <View key={nft.token_id} style={styles.card}>
      <Image source={{ uri: nft.metadata.media }} style={styles.image} />
      <View style={styles.metadata}>
        <Text style={styles.title}>{nft.metadata.title}</Text>
        {/* <Text>{nft.metadata.description}</Text> */}
        <Text style={{ textAlign: "center" }}>
          {parseFloat(nft.metadata?.co2Amount?.toFixed(2))}kg Carbon
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    // height: 200,
    width: 150,
    backgroundColor: "#00A6FB",
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 100,
  },
  metadata: {
    padding: 10,
  },
  title: {
    textAlign: "center",
    fontWeight: "500",
  },
});

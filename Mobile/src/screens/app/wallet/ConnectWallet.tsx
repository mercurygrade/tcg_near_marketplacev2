import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, View, Text } from "react-native";

import { useWallet } from "../../../hooks";
import { Button } from "../../../components";

export default function ConnectWallet({ navigation }) {
  const { goBack } = navigation;
  const [username, setUsername] = useState("");
  const { connectToWallet, isLoading } = useWallet();

  useEffect(() => {
    connectToWallet();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.closeButton} onPress={goBack}>
        Cancel
      </Text>
      {/* <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="Wallet Username"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={(t) => setUsername(t.trim())}
        />
      </View> */}

      <Button
        title="Done"
        isLoading={isLoading}
        // onPress={onSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    padding: 20,
    backgroundColor: "gray",
  },
  inputContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  inputField: {
    width: "100%",
    backgroundColor: "white",
    padding: 20,
    minHeight: 50,
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    left: 30,
    top: 60,
    fontSize: 20,
    fontWeight: "500",
    color: "white",
  },
});

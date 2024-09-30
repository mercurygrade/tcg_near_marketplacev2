import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import React from "react";
import { TextInput } from "react-native-gesture-handler";

import Button from "../../components/Button";
import AuthHandler from "../../handlers/auth/AuthHandler";

export default function SignIn() {
  const { fdata, isLoading, visible, onSubmit, setVisible, handleTextChange } =
    AuthHandler();
  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <View style={styles.screen}>
        <Text style={styles.title}>
          {!visible ? "Please Login" : "Create Account"}
        </Text>
        {visible && (
          <TextInput
            style={styles.inputField}
            placeholder="Full Name"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(t) => handleTextChange(t, "fullName")}
          />
        )}
        <TextInput
          style={styles.inputField}
          placeholder="Email"
          autoCapitalize="none"
          autoCorrect={false}
          value={fdata.email}
          onChangeText={(t) => handleTextChange(t, "email")}
        />
        <TextInput
          style={styles.inputField}
          placeholder="Password"
          autoCapitalize="none"
          autoCorrect={false}
          value={fdata.password}
          secureTextEntry
          onChangeText={(t) => handleTextChange(t, "password")}
        />
        <TouchableOpacity onPress={() => setVisible(!visible)}>
          <Text style={styles.visible}>
            {visible ? "Already have an account? Login" : "Create Account?"}
          </Text>
        </TouchableOpacity>
        <Button
          title={!visible ? "Login" : "Create Account?"}
          onPress={onSubmit}
          isLoading={isLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  inputField: {
    width: "100%",
    backgroundColor: "white",
    padding: 20,
    minHeight: 50,
    borderRadius: 10,
  },
  visible: {
    textAlign: "left",
    color: "#00A6FB",
  },
});

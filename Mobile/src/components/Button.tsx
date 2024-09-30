import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import React from "react";

interface Ibutton extends TouchableOpacityProps {
  style?: ViewStyle;
  title?: string;
  isLoading?: boolean;
  [key: string]: any;
}

export default function Button({
  style,
  title = "Submit",
  isLoading = false,
  ...otherProps
}: Ibutton) {
  return (
    <TouchableOpacity
      style={{
        ...styles.button,
        ...style,
        backgroundColor: isLoading ? "#003554" : "#00A6FB",
      }}
      activeOpacity={0.7}
      {...otherProps}
    >
      {isLoading ? (
        <ActivityIndicator color={"white"} />
      ) : (
        <Text style={styles.buttonTitle}>{title}</Text>
      )}
      <Modal visible={isLoading} transparent />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00A6FB",
    width: "90%",
    padding: 10,
    height: 50,
    borderRadius: 12,
  },
  buttonTitle: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
});

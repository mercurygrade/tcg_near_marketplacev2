import { WebView } from "react-native-webview";
import { Modal, SafeAreaView, StyleSheet } from "react-native";

export default function AppWebView({ isvisible = false, uri }) {
  return (
    <Modal visible={isvisible} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <WebView
          style={styles.container}
          source={{ uri: uri }}
          onNavigationStateChange={(navState) => {
            // Handle redirection back to your app after successful wallet authentication
            console.log(navState);
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import Appprovider from "./src/provider/Appprovider";
import RootNavigator from "./src/routes/RootNavigator";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { Alert } from "react-native";

export default function App() {
  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      const { queryParams, path } = Linking.parse(url);
      Alert.alert(
        "Deep link activated",
        `Path:${path}, 'Query Params:${queryParams}`
      );
    };
    //listen for deep links
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return subscription.remove();
  }, []);
  return (
    <Appprovider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </Appprovider>
  );
}

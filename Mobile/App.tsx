import "react-native-gesture-handler";
import * as Linking from "expo-linking";
import { NavigationContainer } from "@react-navigation/native";
import Appprovider from "./src/provider/Appprovider";
import RootNavigator from "./src/routes/RootNavigator";

export default function App() {
  const config = {
    screens: {
      Home: "home",
    },
  };
  const linking = {
    prefixes: [Linking.createURL("/")],
    config,
  };

  return (
    <Appprovider>
      <NavigationContainer linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </Appprovider>
  );
}

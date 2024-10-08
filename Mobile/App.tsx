import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import Appprovider from "./src/provider/Appprovider";
import RootNavigator from "./src/routes/RootNavigator";

export default function App() {
  return (
    <Appprovider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </Appprovider>
  );
}

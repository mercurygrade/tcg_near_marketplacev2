import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAppContext } from "../provider/Appprovider";
import Home from "../screens/app/home/Home";
import SignIn from "../screens/auth/SignIn";
import { screens } from "../utils";
import ConnectWallet from "../screens/app/wallet/ConnectWallet";

export default function RootNavigator() {
  const { user } = useAppContext();
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen component={Home} name={screens.app.home} />
          <Stack.Screen
            component={ConnectWallet}
            name={screens.app.wallet.create}
          />
        </>
      ) : (
        <Stack.Screen component={SignIn} name="SignIn" />
      )}
    </Stack.Navigator>
  );
}

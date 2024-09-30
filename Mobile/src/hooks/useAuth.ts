import { useState } from "react";
import { Alert } from "react-native";
import { getAuth, signInWithEmailAndPassword, User } from "firebase/auth";

import { urls } from "../utils";
import { request, app } from "../api/useApi";
import { useAppContext } from "../provider/Appprovider";

interface fdata {
  email: string;
  password: string;
}

export default function useAuth() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setUser, user } = useAppContext();
  const auth = getAuth(app);

  const login = async (fdata: fdata) => {
    setIsLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(
        auth,
        fdata.email,
        fdata.password
      );
      const { data } = await request.get(urls.app.profile.url + user.uid);
      Alert.alert("Success", "Logged In");
      setUser(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  //create a new user
  const signUp = async (fdata: fdata): Promise<User> => {
    setIsLoading(true);
    try {
      const { data } = await request.post(urls.auth.new, fdata);
      setUser(data.payload.user);
      return data;
    } catch (error) {
      console.error(error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async () => {};

  return { login, signUp, uploadImage, isLoading };
}

import { useState } from "react";
import { Alert } from "react-native";
import { User } from "firebase/auth";

import { urls } from "../utils";
import { request, addParamToUrl } from "../api/useApi";
import { useAppContext } from "../provider/Appprovider";

interface fdata {
  email: string;
  password: string;
}

export default function useAuth() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setUser, user } = useAppContext();

  const login = async ({ email, password }: fdata) => {
    setIsLoading(true);
    try {
      const { data } = await request.post(
        addParamToUrl(urls.auth.login, { email, password })
      );
      if (data.success) {
        const { data: res } = await request.get(
          addParamToUrl(urls.app.profile.url, { id: data.payload.uid })
        );
        Alert.alert("Success", "Logged In");
        setUser({ uid: data.payload.uid, ...res.user });
      }
    } catch (error) {
      console.error(error.response.data);
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

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../firebaseConfig.json";
import axios from "axios";
//@ts-ignore
import { BASE_URL } from "@env";

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const request = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer thecarbongroup-access-token`,
  },
});

export const addParamToUrl = (
  url: string,
  params: Record<string, string | number> | string
) => {
  let updatedUrl = url;
  if (typeof params == "string") {
    updatedUrl.includes("?")
      ? (updatedUrl += `&${[params]}=${params}`)
      : (updatedUrl += `?${[params]}=${params}`);
    return updatedUrl;
  }
  for (const key in params) {
    updatedUrl.includes("?")
      ? (updatedUrl += `&${key}=${params[key]}`)
      : (updatedUrl += `?${key}=${params[key]}`);
  }
  return updatedUrl;
};

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../firebaseConfig.json";
import axios from "axios";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const BASE_URL = `https://server-yebr4izakq-uc.a.run.app`;
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

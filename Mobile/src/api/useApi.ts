// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../firebaseConfig.json";
import axios from "axios";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const URL = true ? "10.206.78.116" : "172.20.10.3";
export const HOME_NETWORK = "10.206.78.116";
export const PORT = "5005";
export const BASE_URL = `http://${URL}:${PORT}/TrustID/v1`;
// export const BASE_URL = process.env.BASE_URL;

export const request = axios.create({ baseURL: BASE_URL });

import cors from "cors";
require("dotenv").config();
import express, { Request, Response } from "express";

import { profile, nft, account, wallet, image } from "./routes/";

var admin = require("firebase-admin");
const config = require("../credentials.json");

const PORT = process.env.PORT || 5005;
const BASE_URL = "/TrustID/v1";
const app = express();

admin.initializeApp({
  credential: admin.credential.cert(config),
});
app.use(cors());
app.use(express.json());
app.use(BASE_URL + "/uploads", express.static("uploads"));

app.get("/health", (req: Request, res: Response) => {
  res.send("App up and running");
});

app.listen(PORT, () => {
  console.log("Listening on Port ", PORT);
});

app.use(BASE_URL + "/nft", nft);
app.use(BASE_URL + "/auth", account);
app.use(BASE_URL + "/profile", profile);
app.use(BASE_URL + "/wallet", wallet);
app.use(BASE_URL + "/generate", image);

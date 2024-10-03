import { Contract, connect, keyStores } from "near-api-js";
const path = require("path");
const homedir = require("os").homedir();

const CREDENTIALS_DIR = ".near-credentials";
export const CONTRACT_NAME = process.env.CONTRACT_NAME;

const credentialsPath = path.join(homedir, CREDENTIALS_DIR);

const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

//config to initialize connection to Near network
const config = {
  keyStore,
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
};
export async function initNear() {
  //initialize connection to Near network
  const near = await connect({ ...config, keyStore });
  if (!CONTRACT_NAME) throw new Error("No Contract Name provided");
  const account = await near.account(CONTRACT_NAME);
  return { near, account, CONTRACT_NAME };
}

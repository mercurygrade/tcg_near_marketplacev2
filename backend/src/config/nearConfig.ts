import { connect, keyStores } from "near-api-js";
const path = require("path");
const homedir = require("os").homedir();

const CREDENTIALS_DIR = ".near-credentials";
export const CONTRACT_NAME = "yusufdimari2.testnet";

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
  const account = await near.account(CONTRACT_NAME);
  return { near, account };
}

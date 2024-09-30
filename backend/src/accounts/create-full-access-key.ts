import { KeyPair, keyStores, connect } from "near-api-js";
const path = require("path");
const homedir = require("os").homedir();

const CREDENTIALS_DIR = ".near-credentials";
const ACCOUNT_ID = "yusufdimari.testnet";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

const config = {
  keyStore,
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
};

export async function createFullAccessKey(accountId: string) {
  const keyPair = KeyPair.fromRandom("ed25519");
  const publicKey = keyPair.getPublicKey().toString();
  const near = await connect(config);
  const account = await near.account(accountId);
  await keyStore.setKey(config.networkId, ACCOUNT_ID, keyPair);
  await account.addKey(publicKey);
}

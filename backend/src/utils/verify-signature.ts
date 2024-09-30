import { keyStores } from "near-api-js";
const path = require("path");
const homedir = require("os").homedir();

const ACCOUNT_ID = "yusufdimari.testnet";
const CREDENTIALS_DIR = ".near-credentials";

const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

exports.config = {
  keyStore,
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
};

// verifySignature(ACCOUNT_ID);

export async function verifySignature(account_id: string = ACCOUNT_ID) {
  const keyPair = await exports.config.keyStore.getKey(
    exports.config.networkId,
    account_id
  );
  const msg = Buffer.from("hi");

  const { signature } = keyPair.sign(msg);

  const isValid = keyPair.verify(msg, signature);

  console.log("Signature Valid?:", isValid);

  return isValid;
}

exports.verifySignature = verifySignature;

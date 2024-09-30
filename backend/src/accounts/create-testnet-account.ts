import { connect, KeyPair, keyStores, utils } from "near-api-js";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
const path = require("path");
const homedir = require("os").homedir();

const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);
const HELP = `Please run this script in the following format:

    node create-testnet-account.js CREATOR_ACCOUNT.testnet NEW_ACCOUNT.testnet AMOUNT
`;

const config = {
  keyStore,
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
};

if (process.argv.length !== 5) {
  console.info(HELP);
  process.exit(1);
}

// createAccount(process.argv[2], process.argv[3], process.argv[4]);

export async function createAccount(
  newAccountId: string,
  amount: string = "0"
) {
  const near = await connect({ ...config, keyStore });
  const creatorAccount = await near.account("yusufdimari.testnet");
  const keyPair = KeyPair.fromRandom("ed25519");
  const publicKey = keyPair.getPublicKey().toString();
  await keyStore.setKey(config.networkId, newAccountId, keyPair);

  let res: {
    data: FinalExecutionOutcome | null;
    error: Error | string | null;
  } = {
    data: null,
    error: null,
  };
  try {
    const response = await creatorAccount.functionCall({
      contractId: "testnet",
      methodName: "create_account",
      args: {
        new_account_id: newAccountId + ".testnet",
        new_public_key: publicKey,
      },
      gas: BigInt("300000000000000"),
      attachedDeposit: BigInt(utils.format.parseNearAmount(amount) || 0),
    });
    if (response) {
      const error = extractErrorMessage(response);
      res = { data: response, error };
    }
  } catch (error: any) {
    res.error = error;
  }
  return res;
}

function extractErrorMessage(response: any) {
  // Iterate through the receipts to check for errors
  for (const receipt of response.receipts_outcome) {
    if (receipt.outcome.status && receipt.outcome.status.Failure) {
      const error = receipt.outcome.status.Failure.ActionError.kind;
      // Return the error message if available
      if (error.AccountAlreadyExists) {
        return `Username already taken: ${error.AccountAlreadyExists.account_id.replace(
          ".testnet",
          ""
        )}`;
      }
      // Handle other potential error types here if needed
      return `Error occurred: ${JSON.stringify(error)}`;
    }
  }

  return null;
}

import anyTest from "ava";
import { Worker } from "near-workspaces";
import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first"); // temp fix for node >v17

/**
 *  @typedef {import('near-workspaces').NearAccount} NearAccount
 *  @type {import('ava').TestFn<{worker: Worker, accounts: Record<string, NearAccount>}>}
 */
const test = anyTest;

test.beforeEach(async (t) => {
  // Create sandbox
  const worker = (t.context.worker = await Worker.init());

  // Deploy contract
  const root = worker.rootAccount;
  const contract = await root.createSubAccount("test-account");

  // Get wasm file path from package.json test script in folder above
  await contract.deploy(process.argv[2]);

  // Save state for test runs, it is unique for each test
  t.context.accounts = { root, contract };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error);
  });
});

// test("Creates a DID", async (t) => {
//   const { contract } = t.context.accounts;
//   // const didDocument = await contract.view("getDID", {
//   //   id: "yusufdimari.testnet",
//   // });
//   // t.is(didDocument, "DID Document" || null);
//   const publicKey = "example-public-key";
//   const serviceEndpoint = "https://example.com";

//   const didDocument = await contract.call("createDID", {
//     publicKey,
//     serviceEndpoint,
//   });

//   t.is(didDocument.id, "test-account.test.near");
//   t.is(didDocument.publicKey, publicKey);
//   t.is(didDocument.serviceEndpoint, serviceEndpoint);
// });
test("Get Tokens", async (t) => {
  const { contract } = t.context.accounts;
  // const didDocument = await contract.view("getDID", {
  //   id: "yusufdimari.testnet",
  // });
  // t.is(didDocument, "DID Document" || null);

  const nft = await contract.view("nft_tokens_for_owner", {
    account_id: "yusufdimari2.testnet",
  });

  t.log(nft);
  // t.is(didDocument.publicKey, publicKey);
  // t.is(didDocument.serviceEndpoint, serviceEndpoint);
});

// test('changes the greeting', async (t) => {
//   const { root, contract } = t.context.accounts;
//   await root.call(contract, 'set_greeting', { greeting: 'Howdy' });
//   const greeting = await contract.view('get_greeting', {});
//   t.is(greeting, 'Howdy');
// });

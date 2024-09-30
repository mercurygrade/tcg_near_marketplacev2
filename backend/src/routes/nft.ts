import { CONTRACT_NAME, initNear } from "config/nearConfig";
import { Router, Request, Response } from "express";
import { mintNFT } from "handlers/nft";
import { Contract as NearContract } from "near-api-js";

const router = Router();

interface Contract extends NearContract {
  nft_mint(data: NFT): Promise<NFT>;
  nft_tokens_for_owner({ account_id }: { account_id: string }): Promise<NFT[]>;
}

interface NFT {
  token_id: string;
  metadata: object;
  receiver_id: string;
  perpetual_royalties: { [key: string]: number };
}

router.post("/", async (req: Request, res: Response) => {
  console.log("request received at ", req.url);
  const { account } = await initNear();
  const { data }: { data: NFT } = req.body;
  const contract = new NearContract(account, CONTRACT_NAME, {
    viewMethods: ["getDID"],
    changeMethods: ["nft_mint"],
    useLocalViewExecution: false,
  }) as Contract;

  // Call the contract method and handle the response
  try {
    const result = await contract.nft_mint({
      ...data,
      token_id: account.accountId + "-tcg-team-token",
      receiver_id: account.accountId,
      perpetual_royalties: {
        "yusufdimari.testnet": 500, // 5% royalties
      },
    } as NFT);
    return res.status(200).json({ success: true, data: result });
  } catch (contractError) {
    console.error("Error adding a new NFT:", contractError);
    return res.status(500).json({
      success: false,
      message: "Error adding a DID to the contract",
      error: contractError,
    });
  }
});

router.post("/mint", mintNFT);

router.get("/", async (req: Request, res: Response) => {
  console.log("request received", req.url);
  const { id } = req.query;
  const account_id = id?.toString() + ".testnet";
  const { account } = await initNear();
  const contract = new NearContract(account, CONTRACT_NAME, {
    viewMethods: ["nft_tokens_for_owner"],
    changeMethods: ["nft_mint"],
    useLocalViewExecution: false,
  }) as Contract;
  // Call the contract method and handle the response
  try {
    const result = await contract.nft_tokens_for_owner({
      account_id: account_id,
    });
    console.log("success", result);
    return res.status(200).json({ success: true, data: result });
  } catch (contractError) {
    console.error("Error getting NFT:", contractError);
    return res.status(500).json({
      success: false,
      message: "Error getting NFT",
      error: contractError,
    });
  }
});

export default router;

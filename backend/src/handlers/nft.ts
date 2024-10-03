import { initNear } from "config/nearConfig";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

interface NFT {
  token_id: string;
  metadata: object;
  receiver_id: string;
  perpetual_royalties: { [key: string]: number };
}

export const mintNFT = async (req: Request, res: Response) => {
  const { account, CONTRACT_NAME } = await initNear();
  const data: NFT = req.body;
  const depositAmount = "1000000000000000000000000";
  const tokenID = uuidv4();

  //upload image to Akord decentralized Storage
  // const image = await uploadImage();
  // const imageUrl = image.data.tx.gatewayUrls[0];

  //data to send to mint NFT
  const dataTosend = {
    token_id: tokenID + "-tcg-team-token",
    receiver_id: data.receiver_id + ".testnet",
    metadata: {
      ...data.metadata,
      media: "https://akrd.net/GiB3bVUdr-80GQUTJdsiPNNF8L7mq6DmhRmE5IIpywA",
    },
    // perpetual_royalties: {
    //   "yusufdimari1.testnet": 500, // 5% royalties
    // },
  };

  // Call the contract method and handle the response
  try {
    const result = await account.functionCall({
      contractId: CONTRACT_NAME,
      methodName: "nft_mint",
      args: dataTosend,
      gas: BigInt("300000000000000"), // Adjust the gas limit as needed
      attachedDeposit: BigInt(depositAmount), // Attach the deposit here
    });

    // Handle success response
    res.json({ success: true, payload: result });
  } catch (contractError: any) {
    console.error("Error adding a new NFT:", contractError);
    return res.status(500).json({
      success: false,
      message: "Error adding a new NFT",
      error: contractError.message,
    });
  }
};

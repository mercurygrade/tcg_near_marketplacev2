import { initNear } from "config/nearConfig";
import { client } from "config/openAiConfig";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { uploadImage } from "./files";

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

  const imageUrl = await generateImage();
  if (!imageUrl) return;

  //upload image to Akord decentralized Storage
  const image = await uploadImage(imageUrl);
  if (!image) return;
  const storedImageUrl = image.data.tx.gatewayUrls[0];

  //data to send to mint NFT
  const dataTosend = {
    token_id: tokenID + "-tcg-team-token",
    receiver_id: data.receiver_id + ".testnet",
    metadata: {
      ...data.metadata,
      // media: "https://akrd.net/GiB3bVUdr-80GQUTJdsiPNNF8L7mq6DmhRmE5IIpywA",
      media: storedImageUrl,
    },
    // perpetual_royalties: {
    //   "yusufdimari1.testnet": 500, // 5% royalties
    // },
  };

  // Call the contract method and handle the response
  try {
    console.log("minting the NFT");
    const result = await account.functionCall({
      contractId: CONTRACT_NAME,
      methodName: "nft_mint",
      args: dataTosend,
      gas: BigInt("300000000000000"), // Adjust the gas limit as needed
      attachedDeposit: BigInt(depositAmount), // Attach the deposit here
    });

    // Handle success response
    res.json({ success: true, payload: result });
    console.log("NFT minted successfully \n", result);
  } catch (contractError: any) {
    console.error("Error adding a new NFT:", contractError);
    return res.status(500).json({
      success: false,
      message: "Error adding a new NFT",
      error: contractError.message,
    });
  }
};

const generateImage = async () => {
  console.log("generating Image using openAI");
  const response = await client.images.generate({
    prompt: "A picture of a forest in Nigeria",
    model: "dall-e-2",
    style: "natural",
    quality: "standard",
    response_format: "url",
    size: "256x256",
  });
  if (response.data) return response.data[0].url;
  throw new Error("could not generate image from OpenAI");
};

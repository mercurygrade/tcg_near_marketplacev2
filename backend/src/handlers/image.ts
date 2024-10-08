import { client } from "config/openAiConfig";
import { Request, Response } from "express";

export const generateImage = async (req: Request, res: Response) => {
  console.log("request received", req.url);
  try {
    console.log("Tring to genarate a new Image");
    const response = await client.images.generate({
      prompt: "A picture of a green and rich forest",
      model: "dall-e-2",
      style: "natural",
      quality: "standard",
      response_format: "url",
      size: "256x256",
    });
    if (!response.data) throw new Error("Could not generate image");
    console.log("Image Generation", response);
    res.json({
      success: response.created > 0,
      message: "Image successfully generated",
      data: response.data,
    });
    return response.data[0];
  } catch (error: any) {
    console.error("Failed to genarate a new Image", error);
    res.status(400).json({
      success: false,
      error: error?.error,
      message: error.error.message,
    });
  }
};

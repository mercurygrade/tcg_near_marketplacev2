import { client } from "config/openAiConfig";
import { Router, Request, Response } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  console.log("request received", req.url);
  try {
    console.log("Tring to genarate a new Image");
    const response = await client.images.generate({
      prompt: "A picture of a forest in Nigeria",
      model: "dall-e-2",
      style: "natural",
      quality: "standard",
      response_format: "url",
      size: "256x256",
    });
    console.log(response);
    res.json({
      success: response.created > 0,
      message: "Image successfully generated",
      data: response.data,
    });
  } catch (error: any) {
    console.error("Failed to genarate a new Image", error);
    res.status(400).json({
      success: false,
      error: error?.error,
      message: error.error.message,
    });
  }
});

export default router;

import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  const API_KEY = "";
  const fileData = "";
  try {
    const response = await fetch("", {
      method: "POST",
      body: fileData,
      headers: {
        Accept: "application/json",
        "Api-Key": API_KEY,
        "Content-Type": "image/jpeg",
      },
    });
    const result = response.json();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.json({ error: error, success: false });
  }
});

export default router;

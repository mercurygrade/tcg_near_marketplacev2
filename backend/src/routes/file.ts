import { Router } from "express";
import { getImagefromUrl, uploadImage } from "handlers/files";
import multer from "multer";
import path from "path";
const fs = require("fs");

const router = Router();
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});
const middleWare = multer({ storage: storage });

//to get an Image from the client side
router.post("/", middleWare.single("image"), (req, res) => {
  console.log(req.file);
  const imageUrl = `/uploads/${req.file?.filename}`; // Adjust this based on your setup

  res.json({
    success: true,
    imageUrl, // Send the image URL back to the client
  });
});

router.post("/arweave", async (req, res) => {
  const { url } = req.query;
  try {
    const { data, error } = await uploadImage(url);
    if (!error) return res.json({ success: true, data: data });
    return res.json({ success: false, error });
  } catch (error) {
    res.json({
      success: false,
      error: error,
    });
  }
});

export default router;

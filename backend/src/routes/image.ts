import { Router } from "express";
import { generateImage } from "handlers/image";

const router = Router();

router.get("/", generateImage);

export default router;

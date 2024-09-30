import { Router } from "express";
import { createWallet } from "handlers/wallet";

const router = Router();

router.post("/", createWallet);

export default router;

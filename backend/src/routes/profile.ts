import { Router } from "express";
import { getUserCredentials, updateUserInfo } from "handlers/accounts";

const router = Router();
router.get("/", getUserCredentials);
router.put("/", updateUserInfo);

export default router;

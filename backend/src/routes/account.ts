import { WalletConnection } from "near-api-js";
import { initNear } from "../config/nearConfig";
import { Router } from "express";
import { createAccount, getUserCredentials, login } from "handlers/accounts";

const router = Router();
router.post("/create-account", createAccount);

router.post("/login", login);

// router.post("/login", async (req: Request, res: Response) => {
//   console.log("Trying to Login");
//   const { account, near } = await initNear();
//   try {
//     const wallet = new WalletConnection(near, "trustID");
//     const response = await wallet.requestSignIn({ keyType: "ed25519" });
//     res.status(200).json({
//       success: true,
//       payload: response,
//     });
//   } catch (error) {
//     console.log("Error", error);
//     res.status(500).json({
//       success: false,
//       error: error,
//     });
//   }
// });
export default router;

import { createAccount } from "accounts/create-testnet-account";
import { admin } from "accounts/initAccount";
import { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

export const createWallet = async (req: Request, res: Response) => {
  const { uid, username } = req.query;
  let walletAddress = null;
  try {
    if (!username || !uid)
      return res.json({ success: false, message: "No username provided" });
    const { data, error } = await createAccount(username.toString(), "0");
    if (data?.response?.final_execution_status != "EXECUTED" || error) {
      return res.status(400).json({
        success: false,
        message: "Error creating account",
        error: error,
      });
    }
    const docRef = await admin.firestore().collection("users").doc(uid);
    const user = await getAuth().getUser(uid.toString());
    const updatedDoc = {
      isWalletConnected: true,
      walletUsername: username,
    };
    let doc = await docRef.get();
    if (doc.exists) {
      await docRef.update(updatedDoc);
    } else {
      await docRef.set(updatedDoc);
    }
    doc = await docRef.get();

    res.json({
      success: true,
      data: {
        user: { ...user, ...doc.data() },
        ...data.response,
        seedPhrase: data.seedPhrase,
      },
    });
    walletAddress = username;
  } catch (error: any) {
    const errorMessage =
      error.kind?.kind?.FunctionCallError.ExecutionError ||
      error.message ||
      error;
    console.error("couldd not create account", errorMessage);
    res.json({
      success: false,
      message: "An Error Occured",
      error: errorMessage,
    });
  }
  return walletAddress;
};

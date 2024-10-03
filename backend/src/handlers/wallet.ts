import { createAccount } from "accounts/create-testnet-account";
import { admin } from "accounts/initAccount";
import { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

export const createWallet = async (req: Request, res: Response) => {
  const { uid, username } = req.query;
  let walletAddress = null;
  try {
    //ensure both username and profileId are provided
    if (!username || !uid)
      return res.json({ success: false, message: "No username provided" });
    const { data, error } = await createAccount(username.toString(), "0");
    console.log("Create Wallet Response", data, "error", error);

    //handle errors if wallet creation fails
    if (!data || error) {
      return res.status(400).json({
        success: false,
        message: "Error creating account",
        error: error,
      });
    }

    //update the user collection in firebase
    const docRef = await admin.firestore().collection("users").doc(uid);
    const user = await getAuth().getUser(uid.toString());
    const updatedDoc = {
      isWalletConnected: true,
      walletUsername: username,
    };
    let doc = await docRef.get();

    //check if the doc exists
    if (doc.exists) {
      await docRef.update(updatedDoc);
    } else {
      await docRef.set(updatedDoc);
    }

    //get the updated user doc
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
    console.error("couldd not create account", error);
    res.json({
      success: false,
      message: "An Error Occured",
      error: error,
    });
  }
  return walletAddress;
};

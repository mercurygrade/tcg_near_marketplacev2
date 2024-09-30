import { createUserAccount, admin } from "accounts/initAccount";
import { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

interface Account {
  amount?: string;
  email: string;
  password: string;
  fullName: string;
}

export const createAccount = async (req: Request, res: Response) => {
  const { email, password, fullName }: Account = req.body;
  try {
    const user = await createUserAccount({
      email: email,
      password: password,
      displayName: fullName,
    });

    const userRef = admin.firestore().collection("users").doc(user.uid);
    const userData = {
      email: user.email,
      fullName: fullName,
      isWalletConnected: false,
    };

    await userRef.set(userData);

    res.status(200).json({
      success: true,
      payload: {
        user: user,
      },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: "Error creating account",
      error: error,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log("request received", req.baseUrl, "body", req.body);
  const { email, password } = req.body;

  try {
    const user = await getAuth().getUserByEmail(email);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      error: error,
    });
  }
};

export const getUserCredentials = async (req: Request, res: Response) => {
  const { uid } = req.query;
  if (typeof uid !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }
  try {
    const userr = await getAuth().getUser(uid);
    const userRef = admin.firestore().collection("users").doc(uid);
    const user = await userRef.get();
    const userData = user.data();
    res.json({
      success: true,
      data: { ...userData, ...userr },
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      error: error,
    });
  }
};

export const updateUserInfo = async (req: Request, res: Response) => {
  const { uid } = req.query; // Ensure `uid` is a string
  if (typeof uid !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  try {
    const user = await getAuth().getUser(uid);

    // Reference to the user document
    const userRef = admin.firestore().collection("users").doc(uid);

    // Data to update
    const userData = {
      isWalletConnected: false,
    };

    // Update the user data
    await userRef.update(userData);

    // Fetch the updated user data
    const updatedUserDoc = await userRef.get();
    const updatedUserData = updatedUserDoc.data();

    res.status(200).json({
      success: true,
      data: { ...updatedUserData, ...user },
    });
  } catch (error: any) {
    console.error("Error updating user info:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user info",
      error: error.message, // Return a more user-friendly error message
    });
  }
};

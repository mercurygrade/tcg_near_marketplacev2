export const admin = require("firebase-admin");

export const createUserAccount = async (fdata: {
  email: string;
  password: string;
  displayName: string;
}) => {
  try {
    const user = await admin.auth().createUser({
      email: fdata.email,
      password: fdata.password,
      displayName: fdata.displayName,
    });
    return user;
  } catch (error: any) {
    throw new Error(error);
  }
};

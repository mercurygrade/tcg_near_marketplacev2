import React, { createContext, useContext, useState } from "react";
import { User } from "firebase/auth";
import { NFT } from "../types/types";

const AppContext = createContext(null);
export default function Appprovider({ children }) {
  const [user, setUser] = useState<User>();
  const [NFTs, setNFTs] = useState<NFT[]>([]);
  return (
    <AppContext.Provider value={{ user, setUser, NFTs, setNFTs }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) return;
  return context;
};

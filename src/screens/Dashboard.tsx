"use client";
import Items from "@/components/Items";

import { useEffect, useState } from "react";
import { NFT } from "@/@types";
import PriceConverter from "@/components/PriceConverter";
import useNFT from "@/utils/hooks/useNFT";

export default function Dashboard() {
  const [selected, setSelected] = useState<NFT[]>([]);
  const { NFTs, getNFTs, activeAccountId } = useNFT();

  useEffect(() => {
    console.log("active account", activeAccountId);
    if (activeAccountId) {
      getNFTs();
      console.log("NFTs", NFTs);
    }
  }, [activeAccountId]);

  return (
    <div className="flex-grow flex flex-col gap-5 p-10 ">
      <p className="font-bold">Marketplace</p>
      <PriceConverter selected={selected} />
      <p className="font-bold">NFTs</p>
      <Items setSelected={setSelected} data={NFTs} />
    </div>
  );
}

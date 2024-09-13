"use client";
import Button from "components/components/Button";
import Header from "components/components/Header";
import Items from "components/components/Items";

import Exchange from "../assets/svg/exchange.svg";

import { TbGasStation } from "react-icons/tb";
import { FaMoneyBills } from "react-icons/fa6";
import { Metadata } from "next";
import Image from "next/image";
import { useState } from "react";
import { NFT } from "components/@types";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function Dashboard() {
  const [selected, setSelected] = useState<NFT[]>([]);
  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <div className="gap-5">
      <Header />
      <div className="flex flex-col p-10 gap-5">
        <p className="font-bold">Marketplace</p>
        <div className="flex flex-col bg-grey p-6 rounded-md gap-4">
          <p className="text-primary text-2xl font-semibold">
            Contribute to sustainability by insetting carbon emissions
          </p>
          <div className="flex gap-5">
            <div className="flex gap-5 bg-white p-3 rounded w-fit">
              <div className="flex items-center gap-2 w-full">
                <TbGasStation color="grey" />
                <input
                  type="text"
                  placeholder="Emission to Offset"
                  className="bg-transparent outline-none w-full placeholder-gray-500 text-gray-700"
                />
              </div>

              <Image
                src={Exchange}
                alt="Exchange icon"
                height={30}
                width={30}
                style={{
                  backgroundColor: "#b9e8da",
                  padding: 5,
                  borderRadius: 10,
                }}
              />
              <div className="flex items-center gap-2 w-full">
                <FaMoneyBills color={"grey"} />
                <input
                  placeholder="Price in USD"
                  className="bg-transparent outline-none w-full placeholder-gray-500 text-gray-700"
                />
              </div>
            </div>
            <Button title="Purchase" />
          </div>
          <div className="flex place-content-end bg-[#b9e8da] p-3">
            <p className="text-primary font-semibold">
              {selected.length} selected= {selected.length * 0.5}kg
            </p>
          </div>
        </div>
        <p className="font-bold">NFTs</p>
        <Items setSelected={setSelected} data={[]} />
      </div>
    </div>
  );
}

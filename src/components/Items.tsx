"use client";
import React from "react";
import { VscVerifiedFilled } from "react-icons/vsc";
import { IoLocationOutline } from "react-icons/io5";
import { GiPathDistance } from "react-icons/gi";

import colors from "@/constants/colors";
import CheckboxBlank from "./CheckboxBlank";
import { NFT } from "@/@types";
import Button from "./Button";
import useWallet from "@/utils/hooks/useWallet";
import useNFT from "@/utils/hooks/useNFT";

interface ItemsProps {
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  data: NFT[];
}

export default function Items({ data = [], setSelected }: ItemsProps) {
  const { isConnected, connectToWallet } = useWallet();
  const { getNFTs } = useNFT();
  return (
    <div className="flex-grow flex flex-col">
      {data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full max-w-full box-border">
          {data.map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg overflow-hidden flex-grow"
            >
              <div className="relative">
                <CheckboxBlank
                  className="absolute top-2 right-2"
                  itemx={item}
                  setSelected={setSelected}
                />
                <img
                  src={item.media}
                  alt="tree image"
                  className="w-full h-50 object-fill"
                />
              </div>
              <div
                className="p-4 bg-gray-50 text-center"
                style={{ backgroundColor: colors[index % colors.length] }}
              >
                <div className="flex flex-row gap-2 place-items-center">
                  <VscVerifiedFilled />
                  <p className="text-lg font-semibold">0.5kg</p>
                </div>
                <div className="flex flex-row gap-2 place-items-center">
                  <GiPathDistance />
                  <p className="text-sm text-gray-600">6.7 miles</p>
                </div>
                <div className="flex flex-row gap-2 place-items-center">
                  <IoLocationOutline />
                  <p className="text-sm text-gray-600">Lisbon</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-grow flex flex-col justify-center items-center ">
          <p className="text-lg font-semibold">
            {isConnected
              ? "No NFTs found"
              : "Please Connect to your wallet to view NFT's"}
          </p>
          <br />
          <Button
            onClick={!isConnected ? connectToWallet : getNFTs}
            title={isConnected ? "Fetch NFTs" : "Connect to Wallet"}
          />
        </div>
      )}
    </div>
  );
}

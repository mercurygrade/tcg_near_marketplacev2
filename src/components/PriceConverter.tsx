"use client";
import React from "react";
import Button from "./Button";
import Image from "next/image";

import Exchange from "../assets/svg/exchange.svg";

import { TbGasStation } from "react-icons/tb";
import { FaMoneyBills } from "react-icons/fa6";
import { NFT } from "@/@types";

export default function PriceConverter({ selected }: { selected: NFT[] }) {
  return (
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
      <div className="flex place-content-end">
        <p className="text-primary font-semibold bg-[#c4e1d8] p-3 rounded-2xl">
          {selected.length} selected= {selected.length * 0.5}kg
        </p>
      </div>
    </div>
  );
}

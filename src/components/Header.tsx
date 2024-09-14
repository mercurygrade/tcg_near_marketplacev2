"use client";
import React, { useState } from "react";
import navlinks from "@/constants/navlinks";
import Button from "./Button";
import useWallet from "@/utils/hooks/useWallet";

export default function Header() {
  const { connectToWallet, isConnected, disconnect } = useWallet();
  const [active, setActive] = useState<string>("Marketplace");
  const buttonLabel = isConnected ? "Logout" : "Connect to Near Wallet";
  return (
    <div className="flex flex-row justify-between w-screen p-5 gap-5 items-center box-border">
      {/* Title Section */}
      <div className="flex-shrink-0">
        <h4 className="font-semibold text-xl">The Carbon Games</h4>
      </div>

      {/* Navigation */}
      <ul className="flex flex-row justify-evenly flex-grow gap-4">
        {navlinks.map(({ title }, index) => (
          <li
            key={index}
            className={`font-thin text-gray-400 ${
              active == title ? "text-green-600 font-semibold" : ""
            } hover:text-green-600 hover:cursor-pointer`}
          >
            {title}
          </li>
        ))}
      </ul>

      {/* Button */}
      <div className="flex-shrink-0">
        <Button
          onClick={isConnected ? disconnect : connectToWallet}
          title={buttonLabel}
        />
      </div>
    </div>
  );
}

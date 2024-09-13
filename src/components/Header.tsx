"use client";
import React from "react";
import useApi from "components/api/useApi";
import { MbButton } from "mintbase-ui";
import navlinks from "components/constants/navlinks";

export default function Header() {
  const { connect, isConnected } = useApi();
  const buttonLabel = isConnected ? "Logout" : "Connect to Near Wallet";
  return (
    <div className="flex flex-row justify-between w-screen p-2 gap-5">
      <div className="flex">
        <h4 className="font-semibold text-xl">The Carbon Games</h4>
      </div>
      {/* <nav> */}
      <ul className="flex flex-row justify-between ">
        {navlinks.map(({ title }) => (
          <li>{title}</li>
        ))}
      </ul>
      {/* </nav> */}
      <MbButton onClick={connect} label={buttonLabel} />
    </div>
  );
}

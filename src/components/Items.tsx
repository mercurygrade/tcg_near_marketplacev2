import React from "react";
import { VscVerifiedFilled } from "react-icons/vsc";
import { IoLocationOutline } from "react-icons/io5";
import { GiPathDistance } from "react-icons/gi";
import { BiCheckbox } from "react-icons/bi";

import colors from "components/constants/colors";

export default function Items({ data = [] }) {
  const nfts = [
    {
      metadata_id: "nft.examples.testnet:34ac2fc383a22991b626d131c72a6a48",
      title: "GO TEAM",
      media:
        "https://bafybeidl4hjbpdr6u6xvlrizwxbrfcyqurzvcnn5xoilmcqbxfbdwrmp5m.ipfs.dweb.link/",
    },
    {
      metadata_id: "nft.examples.testnet:34ac2fc383a22991b626d131c72a6a48",
      title: "GO TEAM",
      media:
        "https://bafybeidl4hjbpdr6u6xvlrizwxbrfcyqurzvcnn5xoilmcqbxfbdwrmp5m.ipfs.dweb.link/",
    },
    {
      metadata_id: "nft.examples.testnet:34ac2fc383a22991b626d131c72a6a48",
      title: "GO TEAM",
      media:
        "https://bafybeidl4hjbpdr6u6xvlrizwxbrfcyqurzvcnn5xoilmcqbxfbdwrmp5m.ipfs.dweb.link/",
    },
    {
      metadata_id: "nft.examples.testnet:34ac2fc383a22991b626d131c72a6a48",
      title: "GO TEAM",
      media:
        "https://bafybeidl4hjbpdr6u6xvlrizwxbrfcyqurzvcnn5xoilmcqbxfbdwrmp5m.ipfs.dweb.link/",
    },
    {
      metadata_id: "nft.examples.testnet:34ac2fc383a22991b626d131c72a6a48",
      title: "GO TEAM",
      media:
        "https://bafybeidl4hjbpdr6u6xvlrizwxbrfcyqurzvcnn5xoilmcqbxfbdwrmp5m.ipfs.dweb.link/",
    },
    {
      metadata_id: "nft.examples.testnet:34ac2fc383a22991b626d131c72a6a48",
      title: "GO TEAM",
      media:
        "https://bafybeidl4hjbpdr6u6xvlrizwxbrfcyqurzvcnn5xoilmcqbxfbdwrmp5m.ipfs.dweb.link/",
    },
    {
      metadata_id: "nft.examples.testnet:34ac2fc383a22991b626d131c72a6a48",
      title: "GO TEAM",
      media:
        "https://bafybeidl4hjbpdr6u6xvlrizwxbrfcyqurzvcnn5xoilmcqbxfbdwrmp5m.ipfs.dweb.link/",
    },
    {
      metadata_id: "nft.examples.testnet:34ac2fc383a22991b626d131c72a6a48",
      title: "GO TEAM",
      media:
        "https://bafybeidl4hjbpdr6u6xvlrizwxbrfcyqurzvcnn5xoilmcqbxfbdwrmp5m.ipfs.dweb.link/",
    },
  ];

  return (
    <div className="grid grid-cols-6 gap-7">
      {nfts.map(({ media }, index) => (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-52">
          <div className="relative">
            {/* <BiCheckbox className="absolute top-2 right-2 " /> */}
            <img
              src={media}
              alt="tree image"
              className="w-full h-40 object-cover"
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
  );
}

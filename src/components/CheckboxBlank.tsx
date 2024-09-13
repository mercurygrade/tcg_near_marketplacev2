"use client";
import { NFT } from "components/@types";
import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";

type CheckboxBlankProps = {
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  itemx: NFT;
} & React.HtmlHTMLAttributes<HTMLDivElement>;

const CheckboxBlank: React.FC<CheckboxBlankProps> = ({
  className,
  setSelected,
  itemx,
  ...rest
}) => {
  const [checked, setChecked] = useState<boolean>(false);

  const toggleSelected = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setChecked((checked) => !checked);
    if (typeof setSelected == "function") {
      setSelected((selected: NFT[]) => {
        return [itemx, ...selected];
      });
    }
  };

  return (
    <div
      className={`flex place-items-center justify-center w-5 h-5 rounded-md ${
        checked ? "bg-green-800" : "bg-white"
      } hover:bg-green-800 ${className}`}
      {...rest}
      onClick={toggleSelected}
    >
      <div className={`hover:block justify-center items-center`}>
        <FaCheck color={"white"} size={12} />
      </div>
    </div>
  );
};

export default CheckboxBlank;

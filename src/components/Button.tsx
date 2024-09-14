"use client";
import React from "react";

interface ButtonProps {
  onClick?: () => {};
  title: string;
}
export default function Button({ onClick, title = "Submit" }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-primary text-background p-2 rounded min-w-40 hover:bg-green-900"
    >
      {title}
    </button>
  );
}

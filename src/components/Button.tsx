import React from "react";

interface ButtonProps {
  onClick: () => {};
  title: string;
}
export default function Button({ onClick, title = "Submit" }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-foreground text-background p-2 rounded-md "
    >
      {title}
    </button>
  );
}

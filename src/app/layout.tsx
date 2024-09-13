"use client";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { QueryClient, QueryClientProvider } from "react-query";

import "./globals.css";
import { MintbaseWalletContextProvider } from "@mintbase-js/react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const isDev = process.env.NEXT_PUBLIC_ENV === "dev";

export const getCallbackUrl = () => {
  let callbackUrl = "";

  if (typeof window !== "undefined") {
    callbackUrl =
      isDev || window?.location?.host.includes("localhost")
        ? `http://${window?.location.host}`
        : `}`;
  }

  return callbackUrl;
};

const queryClient = new QueryClient();

const MintbaseWalletSetup = {
  contractAddress: "tcg.testnet",
  network: "testnet",
  callbackUrl: getCallbackUrl(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <MintbaseWalletContextProvider {...MintbaseWalletSetup}>
        <html>
          <body>
            <div className="min-h-screen">{children}</div>
          </body>
        </html>
      </MintbaseWalletContextProvider>
    </QueryClientProvider>
    // <html lang="en">
    //   <body
    //     className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    //   >
    //     {children}
    //   </body>
    // </html>
  );
}

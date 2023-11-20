"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useWeb3 } from "@/hooks/useWeb3";
import React from "react";

export type Props = {
  connectToWallet: () => void;
  isConnected: boolean;
  address: string | undefined;
  contract: any | undefined;
  contractFunctions: {
    read: () => Promise<any>;
    requestScore: () => Promise<any>;
  };
  score: number | undefined;
};

const inter = Inter({ subsets: ["latin"] });
export const Web3Context = React.createContext<null | Props>(null);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isConnected,
    connectToWallet,
    address,
    contract,
    contractFunctions,
    score,
  } = useWeb3();
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Context.Provider
          value={{
            isConnected,
            connectToWallet,
            address,
            contract,
            contractFunctions,
            score,
          }}
        >
          <Header />
          <main className="flex-grow flex">{children}</main>
          <Footer />
        </Web3Context.Provider>
      </body>
    </html>
  );
}

import { Web3Context } from "@/app/layout";
import { Button } from "./button";
import React from "react";

export const Header = () => {
  const web3Stuff = React.useContext(Web3Context);
  return (
    <header className="flex w-full content-center justify-center py-5 border-b-[#242424] border-b mb-5">
      <div className="container flex flex-row justify-between content-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="119"
          height="32"
          viewBox="0 0 119 32"
          fill="none"
        >
          <g clipPath="url(#clip0_14_9)">
            <path
              d="M28.0435 0C38.5985 0 45.6222 6.44382 45.6222 16.0064C45.6222 25.5691 38.5985 32.0129 28.0435 32.0129H16.2513V0H28.0435ZM28.0435 26.1232C34.6806 26.1232 39.0753 22.2054 39.0753 15.9936C39.0753 9.78172 34.6806 5.86387 28.0435 5.86387H22.7467V26.1232H28.0435Z"
              fill="white"
            />
            <path
              d="M73.2791 32H48.9601V0H73.176V5.87676H55.4555V13.0938H71.797V18.8675H55.4555V26.1232H73.2662V32H73.2791Z"
              fill="white"
            />
            <path d="M77.3387 32V0H83.8341V32H77.3387Z" fill="white" />
            <path
              d="M118.321 32H110.395L102.998 20.298L95.5876 32H87.6617L98.0233 15.9549L87.6617 0H95.5489L102.998 11.6118L110.447 0H118.334L107.921 15.9549L118.334 32H118.321Z"
              fill="white"
            />
            <path d="M13.5062 0H9.49818V32H13.5062V0Z" fill="white" />
            <path d="M6.76602 0H4.2787V32H6.76602V0Z" fill="white" />
            <path d="M1.53363 0H0V32H1.53363V0Z" fill="white" />
          </g>
          <defs>
            <clipPath id="clip0_14_9">
              <rect width="118.321" height="32" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <Button
          onClick={() => {
            if (!web3Stuff?.isConnected) {
              web3Stuff?.connectToWallet();
            }
          }}
        >
          {web3Stuff?.isConnected
            ? web3Stuff.address?.slice(0, 6) +
              "..." +
              web3Stuff.address?.slice(-4)
            : "Connect Wallet"}
        </Button>
      </div>
    </header>
  );
};

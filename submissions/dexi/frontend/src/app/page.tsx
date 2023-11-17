"use client";

import React, { useEffect } from "react";
import { Props, Web3Context } from "./layout";
import { Button } from "@/components/button";

export default function Home() {
  const web3Stuff = React.useContext(Web3Context);

  return (
    <div className="flex flex-col w-full justify-center content-center flex-wrap">
      {web3Stuff?.isConnected ? <>{Dashboard(web3Stuff)}</> : <TitlePage />}
    </div>
  );
}

const TitlePage = () => (
  <section className="flex w-full justify-center flex-col content-center gap-[38px] h-full">
    <div className="gradient-title tracking-normal">
      Decentralized
      <br /> Account Rating Application
    </div>
    <div className="text-white text-[20px] flex w-full text-center justify-center content-center">
      Learn the credit score of your account to get credit from decentralized
      applications.
    </div>
  </section>
);

const Dashboard = (props: Props) => (
  <section className="flex w-full justify-center flex-col content-center h-full flex-wrap">
    <div className="container flex justify-center content-center flex-col flex-wrap">
      <div>
        {/* Ellipsis for avatar */}
        <div className="flex flex-row items-center justify-center content-center mb-5">
          <div className="bg-[#242424] border border-[#323232] rounded-full w-[70px] h-[70px] flex items-center justify-center content-center">
            <img
              src="https://s3-alpha-sig.figma.com/img/cd03/432e/f8a6f0a31743db5ef5cc0bcd8be557ef?Expires=1701043200&Signature=kKW-sbdjwzjIK9Cr94ob7j7ei26XYRPrFelUk~2YBCt6ieNY1uA4ul7DqD9qnh6ft3dEPACI9puMM2dHdS73~kbWjdH8jMPo7PxX4AlpaDEGp2cR7zuSD-E4HVdq6GfzNJApuUDRhsSLf3ttEpJq5aWFrKPMDdJwzxkFVHU21h6D2rwN7kRCBn3sjWrRwez9r0M~mcgSftuJHkAe1YRmtd~p5J2vBGM5Bu46z3FcHhTSkhccD9t2azsI99sWBY3-VJIYZaCEKT47C7cPbaJA2XuQ52QKyp2U0s~0NCQHu62yU8MMZY5R8K031FTP2r8YdQtfRBQ9uDF9vEQa-EoJQg__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4"
              alt="avatar"
              className="rounded-full w-[70px] h-[70px]"
            />
          </div>
        </div>
      </div>
      <div className="text-[#666672] text-[16px] text-center">
        {props.address}
      </div>
      <div className="flex flex-wrap content-center items-center justify-center">
        <Button
          onClick={async () => {
            await props.contractFunctions.requestScore();
          }}
          className="px-10 mt-5"
        >
          Calculate
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-10 w-full mt-[70px]">
        <Panel
          title="Wallet Credit Rating"
          value={props.score?.toString() || "Fetching"}
          subtitle="+10,46"
        />
        <Panel
          title="Total Debt"
          value="100,46 ETH"
          subtitle="-10,46 ETH"
          isNegative
        />
        <Panel title="Available Rate" value="23,76 ETH" subtitle="+2,74" />
        <Panel
          title="Debt/Limit Ratio"
          value="50,23%"
          subtitle="-3,27%"
          isNegative
        />
      </div>
      <div className="mt-[60px] text-center flex w-full items-center justify-center flex-wrap text-[24px] font-[600] mb-[20px]">
        Rating Detail (Currently Mocked)
      </div>
      <div className="flex flex-col gap-2">
        <DetailCard
          title="Wallet Credit Rating"
          value="335,00"
          subtitle="+10,46"
        />
        <DetailCard title="Swap" value="21,00" subtitle="+2,46" />
        <DetailCard
          title="KYC"
          value="No KYC found"
          subtitle="-100"
          isNegative
        />
      </div>
    </div>
  </section>
);

type Data = {
  title: string;
  value: string;
  subtitle: string;
  isNegative?: boolean;
};

const Panel = ({ title, value, subtitle, isNegative = false }: Data) => (
  <div className="bg-[#161616] border border-[#242424] gap-2 p-10 flex flex-col w-full">
    <div className="text-[#666672] text-[16px] font-[400]">{title}</div>
    <div className="text-white text-[30px]">{value}</div>
    <div
      className={`${
        isNegative ? "text-[#FF003D]" : "text-[#00FF75]"
      } text-[16px]`}
    >
      {subtitle}
    </div>
  </div>
);

const DetailCard = ({ title, value, subtitle, isNegative = false }: Data) => (
  <div className="bg-[#161616] border border-[#242424] gap-2 py-[24px] px-[52px] flex flex-row text-center content-center items-center flex-wrap w-full justify-between">
    <div className="text-white text-[16px] font-[400] w-[200px]">{title}</div>
    <div className="text-white text-[16px] w-[200px]">{value}</div>
    <div
      className={`${
        isNegative ? "text-[#FF003D]" : "text-[#00FF75]"
      } text-[16px] w-[200px]`}
    >
      {subtitle}
    </div>
  </div>
);

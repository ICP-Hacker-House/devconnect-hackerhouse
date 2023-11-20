"use client";

import { ABI, CONTRACT_ADDRESS } from "@/contract";
import { useEffect, useState } from "react";
import Web3 from "web3";

export const useWeb3 = () => {
  const [web3, setWeb3] = useState<undefined | Web3>(undefined);
  const [contract, setContract] = useState<undefined | any>(undefined);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [score, setScore] = useState<number | undefined>(undefined);

  const connectToWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      const web3Instance = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        const accounts = await web3Instance.eth.getAccounts();
        let contract = new web3Instance.eth.Contract(ABI, CONTRACT_ADDRESS);
        contract.handleRevert = true;

        setWeb3(web3Instance);
        setAddress(accounts[0]);
        setContract(contract);
      } catch (error) {
        console.error("Access to MetaMask account denied");
      }
    } else {
      console.error("Please install Metamask extension");
    }
  };

  useEffect(() => {
    let interval = setInterval(async () => {
      if (contract !== undefined) {
        contract.methods
          // @ts-ignore
          .get_score(address)
          .call()
          .then((result: any) => {
            // @ts-ignore
            setScore(result);
          });
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [contract]);

  return {
    web3,
    connectToWallet,
    isConnected: web3 !== undefined,
    address,
    contract,
    contractFunctions: {
      read: async () => {
        if (contract !== undefined) {
          const result = await contract.methods
            // @ts-ignore
            .get_score(address)
            .call();

          setScore(result);
          return result;
        }
      },
      requestScore: async () => {
        if (contract !== undefined) {
          const result = await contract.methods
            // @ts-ignore
            .add_request()
            .send({
              from: address,
              value: web3?.utils.toWei("0.01", "ether"),
            });
          return result;
        }
      },
    },
    score,
  };
};

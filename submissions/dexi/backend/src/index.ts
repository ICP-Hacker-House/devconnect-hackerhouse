import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";
import "dotenv/config";
import { JsonResult, BRIDGES, DEPOSIT, NFTS, SWAP } from "./types";

const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "add_request",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "creditScore",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastUpdatedTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastUpdatedBlock",
            type: "uint256",
          },
        ],
        internalType: "struct WhaleScore.OracleData",
        name: "data",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "apply_request",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "get_last_updated_block",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "get_last_updated_timestamp",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get_oracle",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get_queue",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "get_score",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "get_user_data",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "creditScore",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastUpdatedTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastUpdatedBlock",
            type: "uint256",
          },
        ],
        internalType: "struct WhaleScore.OracleData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as any;

const numberOfAddresses = 3;

let provider = new HDWalletProvider({
  mnemonic: process.env.MNEMONIC,
  numberOfAddresses,
  providerOrUrl: "https://testnet.bitfinity.network",
});

const web3 = new Web3(provider);

let contract = new web3.eth.Contract(
  abi,
  "0xB128f9d63204c6c94E5e3c4dB48aF4cb48f2b1bb"
);
contract.handleRevert = true;

async function main() {
  console.log("Started");
  while (true) {
    try {
      const queue: string[] = await contract.methods.get_queue().call();

      console.log(queue.length + " users in queue");
      if (queue.length > 0) {
        const user = queue[0];
        console.log(user);
        const score = await calculateCreditPoints(user);

        if (score === 0) continue;

        await contract.methods
          .apply_request(
            {
              creditScore: score,
              lastUpdatedTimestamp: Math.floor(Date.now() / 1000),
              lastUpdatedBlock: await web3.eth.getBlockNumber(),
            },
            user,
            1
          )
          .send({
            from: "0xBe74213F721899bdB2a8e58bb83e95d48249630d",
            gas: 1000000,
          });
      }
    } catch (e) {
      console.error(e);
    }

    await new Promise((r) => setTimeout(r, 500));
  }
}

main();

/*
    NFT MINT: COUNT * 20
    WALLET CREATION: MONTH * 10
    SWAP: COUNT * 10
    BRIDGE: COUNT * 50
    TX: COUNT * 5
    RX: COUNT * 10
*/

async function calculateCreditPoints(address: string) {
  let walletTxs: JsonResult | null = await getTxs(address);

  if (!walletTxs || walletTxs.result.length === 0) {
    return 0;
  }

  let creditPoints = 0;

  for (let tx of walletTxs.result) {
    if (NFTS.includes(tx.to)) {
      creditPoints += 20;
    }

    if (SWAP.includes(tx.to)) {
      creditPoints += 10;
    }

    if (BRIDGES.includes(tx.to)) {
      creditPoints += 50;
    }

    if (DEPOSIT.includes(tx.to)) {
      creditPoints += 10;
    }

    if (NFTS.includes(tx.from)) {
      creditPoints += 10;
    }

    if (SWAP.includes(tx.from)) {
      creditPoints += 5;
    }

    if (BRIDGES.includes(tx.from)) {
      creditPoints += 25;
    }

    if (DEPOSIT.includes(tx.from)) {
      creditPoints += 5;
    }
  }

  return creditPoints;
}

async function getTxs(address: string): Promise<JsonResult | null> {
  try {
    let txs = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc`
    );
    let txsJson = await txs.json();
    return txsJson;
  } catch (e) {
    console.error(e);
    return null;
  }
}

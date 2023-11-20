import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";
import "dotenv/config";
import { JsonResult, BRIDGES, DEPOSIT, NFTS, SWAP } from "./types";
import { ABI } from "./abi";

if (
  process.env.MNEMONIC === undefined ||
  process.env.CONTRACT_ADDRESS === undefined ||
  process.env.CONTRACT_OWNER === undefined
) {
  throw new Error(
    "Please set MNEMONIC, CONTRACT_ADDRESS and CONTRACT_OWNER in .env file"
  );
}

const numberOfAddresses = 3;

let provider = new HDWalletProvider({
  mnemonic: process.env.MNEMONIC,
  numberOfAddresses,
  providerOrUrl: "https://testnet.bitfinity.network",
});

const web3 = new Web3(provider);

let contract = new web3.eth.Contract(ABI, process.env.CONTRACT_ADDRESS);
contract.handleRevert = true;

async function main() {
  while (true) {
    try {
      const queue: string[] = await contract.methods.get_queue().call();
      if (queue.length > 0) {
        const user = queue[0];
        console.log(user);
        const score = await calculateCreditPoints(user);

        if (score === 0) continue;
        console.log(score);

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
            from: process.env.CONTRACT_OWNER,
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

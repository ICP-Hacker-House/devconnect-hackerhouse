export interface JsonResult {
  status: string;
  message: string;
  result: Result[];
}

interface Result {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

// The contract addresses should be hardcoded since we cannot know them in advance, but for the sake of simplicity we will hardcode them here.
// These addresses is for like Starkgate etc.

export const NFTS = [
  "0x0e0Fcb520F76f3eAC0Aa764De4B97C53Eb366158".toLowerCase(),
  "0x44e94034AFcE2Dd3CD5Eb62528f239686Fc8f162".toLowerCase(),
];

export const BRIDGES = [
  "0xae0Ee0A63A2cE6BaeEFFE56e7714FB4EFE48D419".toLowerCase(),
  "0xDef1C0ded9bec7F1a1670819833240f027b25EfF".toLowerCase(),
];

export const SWAP = [
  "0xBd3de9a069648c84d27d74d701C9fa3253098B15".toLowerCase(),
];

export const DEPOSIT = [
  "0xC098B2a3Aa256D2140208C3de6543aAEf5cd3A94".toLowerCase(),
];

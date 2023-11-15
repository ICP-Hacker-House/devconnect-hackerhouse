# How to Verify ERC-20 Ownership On-Chain

This article provides an overview of how to develop a decentralized application (dapp) that verifies a user’s ownership of an ERC-20 token on any EVM-compatible chain completely on-chain.

Dapps can call the Ethereum RPC to check a user’s token balance directly in a backend deployed as an [Internet Computer](https://internetcomputer.org/) canister smart contract. 

The Internet Computer enables full-stack dapps to deploy completely on-chain. Internet Computer smart contracts can call an API such as an Ethereum RPC directly. This feature, named [HTTP Outcalls](https://internetcomputer.org/https-outcalls), enables the retrieval of any data on-chain without the need for an equivalent oracle. 

## Use Cases

### Decentralized RPCs

Fetching an RPC on-chain enables **decentralized RPCs**. Dapps can better trust decentralized RPCs whose data is verified through consensus.

### Token Ownership

Verifying a user’s ownership of an ERC-20 token or any Ethereum-based token (ex. NFT) unlocks various dapps features including:

* **Token gating**. A dapp can provide special access to only users who own a specific token including **DAO voting** or Patreon-like style content access. 
* **Token redemptions**. The starter project also stores a timestamp of the ownership verification. Users can check-in for events with NFT or token-based tickets without needing to relinquish ownership of the NFTs or tokens.
* **Rewards or giveaways** based on token ownership. For example, a dapp can giveaway an NFT to any current owners of another NFT collection. 


## Tutorial 

The tutorial adds ERC-20 verification on [IC-ETH-Starter](https://github.com/dfinity/ic-eth-starter), a starter project that already verifies a user’s ownership of ERC721 and ERC1155 NFTs on Ethereum and Goerli and Sepholia testnet chains. 

After connecting their Metamask wallet, users can input the Etherscan or OpenSea link of an NFT that they own. The application will then parse the NFT data from the link and check the Ethereum RPC to confirm if they own the NFT. If confirmed, the app will save and display their wallet address, timestamp of the verification, and NFT metadata, along with a list of other NFT verifications.

Let’s now add ERC-20 token verification! 


### Step 1: Create a New Project

First, let’s create a new project from the [IC-ETH-Starter](https://github.com/dfinity/ic-eth-starter) Github Repository. 


* Navigate to the IC-ETH-Starter repository: [https://github.com/dfinity/ic-eth-starter](https://github.com/dfinity/ic-eth-starter)
* Click on Use this template green button
* Click on Create New Repository


* Github will ask you to save it to specific organization and the new name of the project. You can save it under your personal profile and name it anything (i.e. erc20verification)



* Click on Create Repository. This will generate a new Github repository as the IC-ETH-Starter full project as the first commit.
* You can now clone this project using the command line and make the edits in Steps 2 in the tutorial in your preferred IDE (ex. VS Code). 


### Step 2: Accept ERC20 as a Token Type 


    Please note that we renamed many functions and types with the name NFT to token. Please ensure that your function and type names are consistent. 

Next, you will need to update the establishd token types to handle an ERC20 token type. 

In the `src/services/historyService.ts`, update the TokenType to accept an “erc20”:

```export type TokenType = 'erc721' | 'erc1155' | 'erc20';```

In the `canister/backend/Types.mo`, update the TokenType type to accept an “erc20” as well:

```
public type TokenType = {
      #erc721;
      #erc1155;
      #erc20;
    };
```

Since ERC-20s do not have token Ids, you must adjust the code to not require a token Id, particularly if it is not an ERC20. 

In the `canister/backend/Types.mo`, rename `Nft` module and `Nft` type to `Token` module and Token type. Update the type `Token` to the following (which makes `tokenId` optional):

```
public type Token = {
      owner : Address.Address;
      contract : Address.Address;
      tokenType : TokenType;
      tokenId : ?Nat;
      network : Text;
    };
```
Update the type `Id` in the module `Id` to the following (which makes `tokenId` optional):

```
public type Id = {
        contract : Address.Address;
        tokenId : ?Nat;
        network : Text;
      };
```

Update the `hash` function to the following (which does not append anything to the hash if no `tokenId`):

```
public func hash(n : Id) : Hash.Hash {
        Text.hash(n.network # "/" # n.contract # "/" # (switch (n.tokenId) {case(null) {""}; case(?tokenId) {Nat.toText(tokenId)}}));
      };
```

Your final `canister/backend/Types.mo` should look like this:

```
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import System "lib/System";

module {

  public type CreateSuccess = {
    createTime : System.Time;
  };

  public module Resp {

    public type Login = CreateSuccess;

    public type GetEthWallets = [EthWallet];
    public type ConnectEthWallet = Bool;
  };

  public module Address {
    public type Address = Text;
    public let hash = Text.hash;
    public let equal = Text.equal;
  };

  public module EthWallet {
    public type Address = Address.Address;
    public type SignedPrincipal = Text;
  };

  public module Token {
    public type Token = {
      owner : Address.Address;
      contract : Address.Address;
      tokenType : TokenType;
      tokenId : ?Nat;
      network : Text;
    };
    public type TokenType = {
      #erc721;
      #erc1155;
      #erc20;
    };
    public module Id {
      public type Id = {
        contract : Address.Address;
        tokenId : ?Nat;
        network : Text;
      };
      public func fromNft(n : Token) : Id { n };
      public func hash(n : Id) : Hash.Hash {
        Text.hash(n.network # "/" # n.contract # "/" # (switch (n.tokenId) {case(null) {""}; case(?tokenId) {Nat.toText(tokenId)}}));
      };
      public func equal(n1 : Id, n2 : Id) : Bool {
        n1 == n2;
      };
    };
  };

  public type EthWallet = EthWallet.Address;
  public type SignedPrincipal = EthWallet.SignedPrincipal;

  // Stored in stable memory, for each wallet-principal pair we check:
  public type SignatureCheckSuccess = {
    signedPrincipal : SignedPrincipal;
    checkTime : System.Time;
  };

  public type OwnershipCheckSuccess = {
    checkTime : System.Time;
  };

  public type PublicHistory = [PublicEvent];

  // public events are for public consumption.
  // they are distinct from
  // request/internal/response events in the main canister log.

  public type PublicEvent = {
    #install : { time : System.Time };
    #addNft : AddNftEvent;
  };

  public type AddNftEvent = {
    principal : Principal;
    wallet : EthWallet;
    nft : Token.Token;
    time : System.Time;
  };
};
```


### Step 4: Update functions that call the Ethereum RPC


#### Add the ERC20 ABI

You will need to load the ERC20 ABI similar to how the ERC721 and ERC1155 ABIs were loaded into the project.

Create a new file named `erc20.json` in `canisters/ic_eth/abi` folder. Add the following content to the file and save:

```
[
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_from",
        "type": "address"
      },
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      },
      {
        "name": "_spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
]
```

In `canisters/ic_eth/src/lib.rs`, load the ERC20 ABI where the ERC721 and ERC1155 ABIs are also loaded:

```
thread_local! {
    static ERC_20: Rc<Contract> = Rc::new(include_abi!("../abi/erc20.json"));
    static ERC_721: Rc<Contract> = Rc::new(include_abi!("../abi/erc721.json"));
    static ERC_1155: Rc<Contract> = Rc::new(include_abi!("../abi/erc1155.json"));
}
```

Add a function that checks the balance of an ERC20 token of a user using the ABI. Checking the balance of the ERC20 token of a user is very similar to checking the balance of an ERC1155 NFT.

```
/// Find the balance of an ERC-20 token by calling the Ethereum blockchain.
#[ic_cdk_macros::update]
#[candid_method]
pub async fn erc20_balance_of(
    network: String,
    contract_address: String,
    owner_address: String
) -> u128 {
    let owner_address =
        ethers_core::types::Address::from_str(&owner_address).expect("Invalid owner address");

    let abi = &ERC_20.with(Rc::clone);
    let result = call_contract(
        &network,
        contract_address,
        abi,
        "balanceOf",
        &[
            Token::Address(owner_address.into()),
        ],
    )
    .await;
    match result.get(0) {
        Some(Token::Uint(n)) => n.as_u128(),
        _ => panic!("Unexpected result"),
    }
}
```
Rename the `isNftOwned` to `isTokenOwned` function in `canisters/backend/Core.mo`. Update it to handle checking the balance of an ERC20 token of a user using the new function created above:

```
 func isTokenOwned_(principal : Principal, nft : Types.Token.Token) : async Bool {
      switch (state.hasWalletSignsPrincipal(nft.owner, principal)) {
        case (?_) {
          switch (nft.tokenType) {
            case (#erc721) {
              switch (nft.tokenId) {
                 case (?tokenId) {
                   let owner = await IcEth.erc721_owner_of(nft.network, nft.contract, Nat64.fromNat(tokenId));
                   return owner == nft.owner;
                 };
                 case (null) {
                   throw Error.reject("tokenId is required for erc721");
                 };
              };
            };
            case (#erc1155) {
              switch (nft.tokenId) {
                 case (?tokenId) {
                   let balance = await IcEth.erc1155_balance_of(nft.network, nft.contract, nft.owner, Nat64.fromNat(tokenId));
                   balance > 0;
                 };
                 case (null) {
                   throw Error.reject("tokenId is required for erc721");
                 };
              };
            };
            case (#erc20) {
              let balance = await IcEth.erc20_balance_of(nft.network, nft.contract, nft.owner);
              balance > 0;
            };
          };
        };
        case null {
          false;
        };
      };
    };
```

### Step 5: Update the Frontend

On the frontend, `src/components/WalletArea.tsx` handles the Metamask connection, gets the token metadata from Etherscan and OpenSea link, and verifies token ownership.

```
const parseEtherscanToken = (nftUrl: string) => {
    const groups =
      /^https:\/\/(\w+)\.etherscan\.io\/token\/(\w+)(?:\/(\d+))?/.exec(nftUrl);
    if (!groups) {
      return;
    }
    const [, network, contract, tokenId] = groups;
    return {
      network: network || 'mainnet',
      contract,
      tokenId: tokenId ? Number(tokenId) : null,
    };
  };
```

We’ll need to first adjust the `parseEtherscanToken` function to properly parse an ERC20 Etherscan link of the correct metadata. 

```
const verifyToken = useCallback(() => {
    setNftValid(undefined);
    if (isAddressVerified && tokenInfo) {
      handlePromise(
        (async () => {
          try {
            let nft;

            if (tokenInfo.tokenId) {
              nft = await getAlchemy(
                `eth-${tokenInfo.network}` as any,
              ).nft.getNftMetadata(tokenInfo.contract, tokenInfo.tokenId, {});
              setTokenResult({ nft });
            }

            let token;
            if (
              nft?.tokenType === 'NO_SUPPORTED_NFT_STANDARD' ||
              nft?.tokenType === 'UNKNOWN'
            ) {
              token = await getAlchemy(
                `eth-${tokenInfo.network}` as any,
              ).core.getTokenMetadata(tokenInfo.contract);
              setTokenResult({ token });
            }

            try {
              const tokenType =
                nft?.tokenType === 'ERC1155'
                  ? { erc1155: null }
                  : nft?.tokenType === 'ERC721'
                  ? { erc721: null }
                  : token?.name !== null
                  ? { erc20: null }
                  : undefined;
              if (!tokenType) {
                throw new Error(`Unknown token type: ${nft?.tokenType}`);
              }
              const valid = await getBackend().addNfts([
                {
                  contract: tokenInfo.contract,
                  network: tokenInfo.network,
                  tokenType: tokenType,
                  tokenId: tokenInfo.tokenId ? [BigInt(tokenInfo.tokenId)] : [],
                  owner: address,
                },
              ]);
              setNftValid(valid);
              if (valid) {
                refreshHistory();
              }
            } catch (err) {
              handleError(err, 'Error while verifying NFT ownership!');
              setNftValid(false);
            }
          } catch (err) {
            console.warn(err);
            setTokenResult({ err: String(err) });
          }
        })(),
      );
    }
  }, [address, isAddressVerified, tokenInfo]);
```

We’ll then need to adjust the `verifyNFT` function to get the token name based on the token metadata parsed from the Etherscan link. 

Currently, we call the `getNFTMetadata` function in the Alchemy SDK to get the NFT collection name and token type. 

We will use `getTokenMetadata` function in the Alchemy SDK to get the token name. We will also assume that if getNFTMetadata returns tokenType as ‘UNKNOWN’ or ‘NO_SUPPORTED_NFT_STANDARD’ and getTokenMetadata does return a token name that the token parsed through the Etherscan link provided is an ERC20.

```
const verifyToken = useCallback(() => {
    setNftValid(undefined);
    if (isAddressVerified && tokenInfo) {
      handlePromise(
        (async () => {
          try {
            let nft;

            if (tokenInfo.tokenId) {
              nft = await getAlchemy(
                `eth-${tokenInfo.network}` as any,
              ).nft.getNftMetadata(tokenInfo.contract, tokenInfo.tokenId, {});
              setTokenResult({ nft });
            }

            let token;
            if (
              nft?.tokenType === 'NO_SUPPORTED_NFT_STANDARD' ||
              nft?.tokenType === 'UNKNOWN'
            ) {
              token = await getAlchemy(
                `eth-${tokenInfo.network}` as any,
              ).core.getTokenMetadata(tokenInfo.contract);
              setTokenResult({ token });
            }

            try {
              const tokenType =
                nft?.tokenType === 'ERC1155'
                  ? { erc1155: null }
                  : nft?.tokenType === 'ERC721'
                  ? { erc721: null }
                  : token?.name !== null
                  ? { erc20: null }
                  : undefined;
              if (!tokenType) {
                throw new Error(`Unknown token type: ${nft?.tokenType}`);
              }
              const valid = await getBackend().addNfts([
                {
                  contract: tokenInfo.contract,
                  network: tokenInfo.network,
                  tokenType: tokenType,
                  tokenId: tokenInfo.tokenId ? [BigInt(tokenInfo.tokenId)] : [],
                  owner: address,
                },
              ]);
              setNftValid(valid);
              if (valid) {
                refreshHistory();
              }
            } catch (err) {
              handleError(err, 'Error while verifying NFT ownership!');
              setNftValid(false);
            }
          } catch (err) {
            console.warn(err);
            setTokenResult({ err: String(err) });
          }
        })(),
      );
    }
  }, [address, isAddressVerified, tokenInfo]);
```

This is the new `src/components/WalletArea.tsx` based on the updates above: 

```
import { type Nft, TokenMetadataResponse } from 'alchemy-sdk';
import { useMetaMask } from 'metamask-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaCheckCircle,
  FaCircleNotch,
  FaEthereum,
  FaSignOutAlt,
  FaTimesCircle,
} from 'react-icons/fa';
import { styled } from 'styled-components';
import tw from 'twin.macro';
import { useSessionStorage } from '../hooks/utils/useLocalStorage';
import { useAddressVerified } from '../services/addressService';
import { getAlchemy } from '../services/alchemyService';
import { getBackend } from '../services/backendService';
import { refreshHistory, usePublicNfts } from '../services/historyService';
import useIdentity, { logout } from '../services/userService';
import { handleError, handlePromise } from '../utils/handlers';
import { LoginAreaButton } from './LoginArea';
import NftList from './NftList';

const FormContainer = styled.form`
  input[type='text'],
  input[type='number'],
  textarea {
    ${tw`w-full border-2 p-2 rounded-lg`}
  }
`;

export const WalletAreaButton = tw.div`flex items-center gap-2 px-4 py-2 border-2 text-lg rounded-full cursor-pointer select-none bg-[#fff8] hover:bg-gray-100`;

export default function WalletArea() {
  const user = useIdentity();
  const { status, connect, account, ethereum } = useMetaMask();
  const [nftUrl, setNftUrl] = useSessionStorage('ic-eth.nft-url', '');
  const [tokenResult, setTokenResult] = useState<{
    nft?: Nft;
    token?: TokenMetadataResponse;
    err?: string;
  }>({});
  const [isNftValid, setNftValid] = useState<boolean>();

  const address = (ethereum?.selectedAddress as string | undefined) || '';
  const [isAddressVerified, verifyAddress] = useAddressVerified(
    address,
    ethereum,
  );

  const principalString = user?.client.getIdentity().getPrincipal().toString();
  const nfts = usePublicNfts();
  const ownedNfts =
    nfts?.filter(
      (nft) => nft.principal === principalString || nft.wallet === address,
    ) || [];

  const parseOpenSeaNft = (nftUrl: string) => {
    const groups =
      /^https:\/\/(testnets\.)?opensea\.io\/assets\/(\w+)\/(\w+)\/(\d+)/.exec(
        nftUrl,
      );
    if (!groups) {
      return;
    }
    const [, isTestnets, network, contract, tokenId] = groups;
    return {
      network: isTestnets ? network : 'mainnet',
      contract,
      tokenId: Number(tokenId),
    };
  };

  const parseEtherscanNft = (nftUrl: string) => {
    const groups = /^https:\/\/(\w+)\.etherscan\.io\/nft\/(\w+)\/(\d+)/.exec(
      nftUrl,
    );
    if (!groups) {
      return;
    }
    const [, network, contract, tokenId] = groups;
    return {
      network: network || 'mainnet',
      contract,
      tokenId: Number(tokenId),
    };
  };

  const parseEtherscanToken = (nftUrl: string) => {
    const groups =
      /^https:\/\/(\w+)\.etherscan\.io\/token\/(\w+)(?:\/(\d+))?/.exec(nftUrl);
    if (!groups) {
      return;
    }
    const [, network, contract, tokenId] = groups;
    return {
      network: network || 'mainnet',
      contract,
      tokenId: tokenId ? Number(tokenId) : null,
    };
  };

  const tokenInfo = useMemo(
    () =>
      parseOpenSeaNft(nftUrl) ||
      parseEtherscanNft(nftUrl) ||
      parseEtherscanToken(nftUrl),
    [nftUrl],
  );

  const isCollectionUrl =
    !tokenInfo &&
    (/^https:\/\/(testnets\.)?opensea\.io\/assets\/(\w+)\/(\w+)/.test(nftUrl) ||
      /^https:\/\/(?:(\w+)\.)?etherscan\.io\/nft\/(\w+)/.test(nftUrl) ||
      /^https:\/\/(?:(\w+)\.)?etherscan\.io\/token\/(\w+)/.test(nftUrl));

  const verifyToken = useCallback(() => {
    setNftValid(undefined);
    if (isAddressVerified && tokenInfo) {
      handlePromise(
        (async () => {
          try {
            let nft;

            if (tokenInfo.tokenId) {
              nft = await getAlchemy(
                `eth-${tokenInfo.network}` as any,
              ).nft.getNftMetadata(tokenInfo.contract, tokenInfo.tokenId, {});
              setTokenResult({ nft });
            }

            let token;
            if (
              nft?.tokenType === 'NO_SUPPORTED_NFT_STANDARD' ||
              nft?.tokenType === 'UNKNOWN'
            ) {
              token = await getAlchemy(
                `eth-${tokenInfo.network}` as any,
              ).core.getTokenMetadata(tokenInfo.contract);
              setTokenResult({ token });
            }

            try {
              const tokenType =
                nft?.tokenType === 'ERC1155'
                  ? { erc1155: null }
                  : nft?.tokenType === 'ERC721'
                  ? { erc721: null }
                  : token?.name !== null
                  ? { erc20: null }
                  : undefined;
              if (!tokenType) {
                throw new Error(`Unknown token type: ${nft?.tokenType}`);
              }
              const valid = await getBackend().addNfts([
                {
                  contract: tokenInfo.contract,
                  network: tokenInfo.network,
                  tokenType: tokenType,
                  tokenId: tokenInfo.tokenId ? [BigInt(tokenInfo.tokenId)] : [],
                  owner: address,
                },
              ]);
              setNftValid(valid);
              if (valid) {
                refreshHistory();
              }
            } catch (err) {
              handleError(err, 'Error while verifying NFT ownership!');
              setNftValid(false);
            }
          } catch (err) {
            console.warn(err);
            setTokenResult({ err: String(err) });
          }
        })(),
      );
    }
  }, [address, isAddressVerified, tokenInfo]);

  useEffect(() => verifyToken(), [verifyToken]);

  const getMetaMaskButton = () => {
    if (status === 'notConnected') {
      return (
        <WalletAreaButton onClick={connect}>
          <FaEthereum />
          Connect to MetaMask
        </WalletAreaButton>
      );
    }
    if (status === 'initializing') {
      return <div tw="opacity-60">Initializing...</div>;
    }
    if (status === 'connecting') {
      return <div tw="opacity-60">Connecting...</div>;
    }
    if (status === 'connected') {
      return (
        <div tw="flex flex-col md:flex-row items-start md:items-center gap-2">
          <div tw="flex-1 text-xl text-gray-600">
            <div tw="flex items-center gap-2">
              {/* <FaEthereum tw="hidden sm:block text-3xl" /> */}
              <div>
                Ethereum address:
                <div tw="text-xs sm:text-sm font-bold mt-1">{account}</div>
              </div>
            </div>
          </div>
          {isAddressVerified === false && (
            <div tw="flex flex-col items-center mt-3 sm:mt-0">
              <LoginAreaButton
                tw="flex gap-1 items-center text-base px-4 text-blue-600 border-blue-500"
                onClick={() => verifyAddress()}
              >
                <FaEthereum />
                <span tw="font-semibold select-none ml-1 animate-pulse [animation-duration: 2s]">
                  Verify wallet
                </span>
              </LoginAreaButton>
            </div>
          )}
        </div>
      );
    }
    return (
      <div>
        <a
          tw="text-blue-500"
          href="https://metamask.io/"
          target="_blank"
          rel="noreferrer"
        >
          MetaMask is required for this Dapp
        </a>
      </div>
    );
  };

  return (
    <>
      {!!user && (
        <>
          <div tw="flex flex-col md:flex-row items-start md:items-center gap-2">
            <div tw="flex-1 text-xl text-gray-600">
              Internet Computer principal:
              <div tw="text-xs sm:text-sm font-bold mt-1">
                {user.client.getIdentity().getPrincipal().toString()}
              </div>
            </div>
            <div tw="flex flex-col items-center mt-3 sm:mt-0">
              <LoginAreaButton
                tw="flex gap-1 items-center text-base px-4"
                onClick={() =>
                  handlePromise(logout(), undefined, 'Error while signing out!')
                }
              >
                <FaSignOutAlt />
                <span tw="font-semibold select-none ml-1">Sign out</span>
              </LoginAreaButton>
            </div>
          </div>
          <hr tw="my-5" />
        </>
      )}
      <div tw="mx-auto">{getMetaMaskButton()}</div>
      {!!isAddressVerified && (
        <>
          <hr tw="my-5" />
          <FormContainer>
            <label>
              <div tw="flex items-center gap-3 text-xl text-gray-600 mb-1">
                <div>OpenSea or Etherscan URL:</div>
                {!!tokenInfo && (
                  <div tw="text-base">
                    {isNftValid === true ? (
                      <FaCheckCircle tw="text-green-500" />
                    ) : isNftValid === false ? (
                      <FaTimesCircle
                        tw="text-red-500 cursor-pointer"
                        onClick={() => verifyToken()}
                      />
                    ) : (
                      <FaCircleNotch tw="opacity-60 animate-spin [animation-duration: 2s]" />
                    )}
                  </div>
                )}
              </div>
              <input
                css={
                  tokenInfo && [
                    isNftValid === true
                      ? tw`border-green-500`
                      : isNftValid === false
                      ? tw`border-red-500`
                      : tw`border-yellow-500`,
                  ]
                }
                type="text"
                placeholder="Paste NFT URL here"
                value={nftUrl}
                onChange={(e) => setNftUrl(e.target.value)}
              />
            </label>
            {!!isCollectionUrl && (
              <div tw="text-red-600 font-bold">
                Please enter a valid token URL
              </div>
            )}
            {tokenInfo && tokenResult ? (
              <>
                {'nft' in tokenResult && (
                  <div tw="mt-3 max-w-[500px] mx-auto">
                    <TokenView
                      nft={tokenResult.nft as Nft}
                      token={tokenResult.token as TokenMetadataResponse}
                    />
                  </div>
                )}
                {'err' in tokenResult && (
                  <div tw="text-red-600 font-bold">{tokenResult.err}</div>
                )}
              </>
            ) : (
              <a
                tw="text-blue-500"
                href="https://testnets.opensea.io/account"
                target="_blank"
                rel="noreferrer"
              >
                OpenSea account page
              </a>
            )}
          </FormContainer>
          {!!nfts && (
            <>
              <hr tw="my-5" />
              <div tw="text-xl text-gray-600 mb-3">Previously verified:</div>
              <NftList items={ownedNfts} />
            </>
          )}
        </>
      )}
    </>
  );
}

function TokenView({ nft, token }: { nft: Nft; token: TokenMetadataResponse }) {
  return (
    <div tw="p-5 sm:p-6 bg-white rounded-xl space-y-3 drop-shadow-2xl">
      {!!nft?.title ||
        (!!token?.name && (
          <div tw="text-2xl sm:text-3xl font-bold">
            {nft?.title || token?.name}
          </div>
        ))}
      {!!nft.media.length ? (
        <img
          tw="w-full rounded-xl"
          alt="NFT preview"
          src={nft.media[0].gateway}
        />
      ) : null}
      {!!nft?.description || !!token?.symbol ? (
        <div tw="sm:text-xl">{nft?.description || token?.symbol}</div>
      ) : null}
    </div>
  );
}

```

## Wrap it up

As a friendly reminder, please note that we renamed many functions and types with the name NFT to token. Please ensure that your function and type names are consistent. 

Once you have saved all of your work, it’s time to deploy the application and test. Check out these references to learn how to deploy an application on the Internet Computer [locally](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally) and on [mainnet](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-mainnet). 

Now navigate to the deployed application. 

* Login using an Internet Identity to access the application.
* Navigate to the Verify tab.
* Connect your Metamask wallet.
* Enter an Etherscan link to a smart contract of a token that you own or do not own on Ethereum, Sepholia, or Goerli.
* Type in Enter. You will see a small loading icon. It will show a red x mark if the wallet does not own the token. It will show a green checkmark if the wallet does own the token.

You can reference the final project here: [https://github.com/jennifertrin/erc20icp](https://github.com/jennifertrin/erc20icp)

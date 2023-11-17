# Dexi: Decentralized Account Rating Application

## Overview

Dexi is an innovative application developed for the ICP Hackathon, leveraging blockchain technology to provide credit scoring in the Web3 financial environment. It's designed to analyze wallet transactions and activities, offering a transparent and trustful approach in the credit lending process of the decentralized financial ecosystem.

## Hackathon Note

This project was created as part of the ICP Hackathon, where our team focused on addressing the challenges of credit scoring in the blockchain and decentralized finance (DeFi) space.

## Motivation

Our motivation was to make a Gitcoin Passport, but for DeFi apps. Such as borrowing/lending protocols, or credit protocols. They can use this app(and it can become onchain when you develop it like Chainlink's Aggregator in this case) to get the calculation of a user. In this case a user can request a calculation to get in to a app, or app can request a calculation from the contract for the user(not available right now).

With the credit score the DeFi app gets, it can make an auth(for example lower than 1000 points cannot swap in my exchange, or use my protocol at all), or a credit dapp can say that we are not giving any credit to a below 1k etc.

## Team Members

- **Omer Goksoy**
- **Sahap Kurtaran**
- **Mehmet Kircal**
- **Nguyen Cong Danh**

## Features

- **Wallet Activity Analysis**: Analyzes blockchain wallet transactions for creditworthiness assessment.
- **Comprehensive Scoring System**: Factors in NFT transactions, token diversity, swap activities, etc.
- **User-Friendly Interface**: Easy to navigate and accessible.
- **Real-Time Updates**: Keeps scores updated with the latest transaction data.

## Installation

Clone the repository and install dependencies.

```bash
git clone https://github.com/iamknownasfesal/dexi.git
cd dexi
npm install
```

## Usage

You have to deploy an contract, you can contract via Remix or any tool you want such as Truffle or Hardhat.

Then you need to open the backend(do not forget to fill the dot env file), and open the frontend, change the CONTRACT_ADDRESS constant to your contract address, which you deployed via Remix in this case.

## Contributing

We welcome contributions to Dexi! Check our contributing guidelines for more details.

## Support

For issues or questions, please use the GitHub issue tracker.

## Contact

For more info, contact us at hello@notuslabs.org

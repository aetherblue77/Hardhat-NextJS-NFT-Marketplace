# 🚀 Full-Stack Decentralized NFT Marketplace

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.7-363636?logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-12.1-black?logo=next.js)
![The Graph](https://img.shields.io/badge/The_Graph-Hosted_Service-6f4cff?logo=thegraph)
![Network](https://img.shields.io/badge/Network-Sepolia_Testnet-grey)

A decentralized marketplace where users can mint, list, buy, update, and cancel listings of NFTs. This project demonstrates a complete **Web3 architecture** combining Smart Contracts, Decentralized Indexing, and a Reactive Frontend.

---

## 🏗️ Architecture & Directories

This monorepo consists of three distinct modules working in harmony:

| Directory | Component | Tech Stack | Description |
| :--- | :--- | :--- | :--- |
| [**`hardhat-nft-marketplace`**](./hardhat-nft-marketplace) | **Backend** | Solidity, Hardhat, Ethers.js | Contains the Smart Contracts for the Marketplace logic and the NFT logic. Handles deployments and scripts. |
| [**`nextjs-nft-marketplace`**](./nextjs-nft-marketplace) | **Frontend** | React, Next.js, Web3UIKit, Moralis | The User Interface. Connects to the wallet, fetches data from The Graph, and executes transactions. |
| [**`graph-nft-marketplace`**](./graph-nft-marketplace) | **Indexer** | GraphQL, AssemblyScript | A Subgraph hosted on The Graph to index events (`ItemBought`, `ItemListed`) for fast querying off-chain. |

---

## 🌟 Features

* **Mint & List:** Users can mint a generic NFT (Dogie) and list it on the marketplace immediately.
* **Buy NFT:** Purchase NFTs using ETH (Sepolia).
* **Update Listing:** Sellers can modify the price of their listed items.
* **Cancel Listing:** Sellers can remove their items from the market.
* **Withdraw Proceeds:** Sellers can withdraw their earnings (ETH) stored in the contract after a sale.
* **Indexer Integration:** Uses The Graph to display "Recently Listed" items without overloading the blockchain provider.
* **Notification System:** Real-time UI feedback for transaction success or failure.

---


## 🛠️ Installation & Setup

To run this project locally, you need to set up each directory individually.

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [Yarn](https://yarnpkg.com/) or NPM
* [Git](https://git-scm.com/)

### 1. Backend (Hardhat)
Set up the smart contracts first.

```bash
cd hardhat-nft-marketplace
yarn install
```

Create a `.env` file in the root of `hardhat-nft-marketplace` and fill it with your keys:

```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
PRIVATE_KEY=0xYourPrivateKey...
ETHERSCAN_API_KEY=YourEtherscanKey...
```

Then deploy to Sepolia network:

```bash
yarn hardhat deploy --network sepolia
```

### 2. The Graph (Indexer)
Note: You need an account on The Graph Hosted Service.

```bash
cd ../graph-nft-marketplace
yarn install
```

Update `subgraph.yaml` and `networks.json` with your deployed contract address from Step 1. Then authenticate and deploy:

```bash
# Replace with your actual Access Token from The Graph Dashboard
graph auth --product hosted-service <YOUR_ACCESS_TOKEN>

# Generate code and build
graph codegen && graph build

# Deploy to The Graph (Replace with your GitHub handle & subgraph name)
graph deploy --product hosted-service <YOUR_GITHUB_HANDLE>/<SUBGRAPH_NAME>
```

### 3. Frontend (Next.js)
Finally, connect the UI.

```bash
cd ../nextjs-nft-marketplace
yarn install
```

Ensure your `constants/networkMapping.json` and ABI files are updated with the latest deployment. Then run the development server:

Bash

yarn dev
Open http://localhost:3000 in your browser.

## ⚠️ Known Issues / Notes

**Indexing Delay**: After listing or buying an item, it may take 1-3 minutes for the changes to appear on the Frontend. This is because The Graph needs time to index the Sepolia block.

**Testnet Only**: This project is deployed on Sepolia Testnet. Do not use real ETH!

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
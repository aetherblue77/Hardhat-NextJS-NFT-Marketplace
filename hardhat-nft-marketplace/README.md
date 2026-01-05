# 🧠 Smart Contract Architecture (Backend)

This directory serves as the **Logic Layer** and the **Source of Truth** for the entire Decentralized Marketplace. It contains the Solidity smart contracts that govern the ownership, trading, and fund management of NFTs.

## 🏛️ Core Design Principles

### 1. The Marketplace Logic (`NftMarketplace.sol`)
Unlike traditional marketplaces that store data in a centralized server, this contract stores the state of listings directly on the Ethereum blockchain. It creates a trustless environment where:
* **Non-Custodial Listing:** Sellers maintain ownership of their NFTs while listed. The contract holds "approval" to transfer, but not the asset itself, until a sale occurs.
* **Pull-Over-Push Pattern:** To prevent Reentrancy attacks and save gas, this contract uses a "Pull" pattern for withdrawing funds. When an item is sold, funds are stored in a mapping (`s_proceeds`), and sellers must explicitly call `withdrawProceeds` to transfer ETH to their wallets.

### 2. Data Structures
The contract avoids using large arrays to track listings (which are expensive to iterate). Instead, it uses efficient mappings:
* `mapping(address => mapping(uint256 => Listing))`: A nested mapping to track price and seller by `NFT Address` and `Token ID`.

### 3. Functions
1. `listItem`: List NFTs on the marketplace
2. `buyItem`: Buy the NFTs
3. `cancelItem`: Cancel a listing
4. `updateListing`: Update Price
5. `withdrawProceeds`: Withdraw payment for my bought NFTs

### 4. Event-Driven Architecture
Since Solidity mappings are difficult to query off-chain (you can't ask "Show me all active listings"), this contract relies heavily on **Events**.
* Every state change (`ItemListed`, `ItemBought`, `ItemCanceled`) emits an event.
* These events are **critical** as they serve as the data feed for our Indexer (The Graph), bridging the gap between on-chain storage and frontend display.

## 📦 Contracts Overview
* **`NftMarketplace.sol`**: The main trading hub. Implements `ReentrancyGuard` for security.
* **`BasicNft.sol`**: A standard ERC-721 implementation used to mint test assets (Dogie) for the marketplace.
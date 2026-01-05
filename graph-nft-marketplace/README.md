# 📊 Decentralized Indexing Layer (The Graph)

This directory acts as the **Data Bridge** between the Blockchain and the Frontend. It solves the "Blockchain Indexing Problem" where reading data directly from smart contracts is slow and limited.

## 🧐 The Problem
Blockchains are designed for security, not for querying. To display a "Recently Listed" page, a frontend would traditionally have to iterate through thousands of blocks to find relevant transactions—a process that is incredibly slow and inefficient.

## 💡 The Solution: Subgraph
This module defines a **Subgraph** that constantly listens to the Sepolia blockchain for specific events emitted by the `NftMarketplace` contract.

### Data Transformation Logic (`mapping.ts`)
Instead of just copying data, this layer processes logic:
1.  **Listing Event:** When `ItemListed` is detected, an `ActiveItem` entity is created or updated in the database.
2.  **Canceled/Bought Event:** When `ItemCanceled` or `ItemBought` is detected, the logic **removes** the corresponding `ActiveItem` from the store (using the `0x00...dead` address strategy for history tracking).

### Schema Design (`schema.graphql`)
We define a specific entity called **`ActiveItem`**. This entity is optimized for the frontend, containing exactly what the UI needs:
* `buyer`: To track ownership changes.
* `seller`: To display who is selling.
* `nftAddress` & `tokenId`: Unique identifiers.
* `price`: Current listing price.

By using this Indexer, the Frontend can perform complex queries (e.g., "Show items where buyer is null") in milliseconds via GraphQL.
# 💻 Reactive Frontend Interface

This directory contains the **User Interface** built with Next.js. It is designed to abstract the complexity of blockchain interactions, providing a Web2-like experience on a Web3 infrastructure.

## 🏗️ Architectural Decisions

### 1. Hybrid Data Fetching
The application uses a hybrid approach to manage data:
* **Writes (Transactions):** Uses `Moralis` and `Web3UIKit` to communicate directly with the Smart Contract via MetaMask (e.g., `list`, `buy`, `cancel`).
* **Reads (Display):** Uses `Apollo Client` to fetch data from **The Graph**. This decouples the "reading" process from the blockchain, ensuring the UI remains fast and responsive even if the network is congested.

### 2. Client-Side IPFS Resolution
The NFT images and metadata are stored on IPFS (InterPlanetary File System). The frontend acts as a resolver:
1.  It queries the Smart Contract for the `tokenURI`.
2.  It fetches the metadata JSON from the IPFS Gateway.
3.  It renders the image directly to the user.

### 3. Asynchronous State Management
Blockchain transactions are not instant. The UI implements robust notification systems to handle the "Mining Gap":
* **Optimistic Updates / Notifications:** Users receive immediate feedback when a transaction is signed.
* **Eventual Consistency:** The UI reflects the understanding that data from The Graph may have a slight delay (latency) compared to the real-time blockchain state.

## 🧩 Key Components
* **`NFTBox.js`**: A self-contained component that handles individual NFT logic (rendering image, handling Buy/Update/Cancel modals).
* **`sell-nft.js`**: Manages the approval and listing workflow (Two-step transaction process: Approve -> List).
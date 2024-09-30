# README

## Project Overview

This project is a comprehensive mobile application built with React Native and TypeScript, a Node.js backend, and a NEAR blockchain contract. It enables users to create accounts, log in, connect to a wallet, and mint NFTs seamlessly.

---

## 1. Mobile Application

The mobile application is developed using **React Native** and **TypeScript**. It provides users with an intuitive interface for the following features:

- **User Authentication**: Utilizes **Firebase** for user registration and authentication, ensuring a secure and reliable login experience.
- **Wallet Integration**: Connects to the user's wallet using **NEAR API JS**, allowing for easy management of assets and transactions.
- **NFT Minting**: Users can mint NFTs directly through the app, with seamless interaction between the mobile frontend and the blockchain backend.

### Installation

To set up the mobile application, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/mercurygrade/tcg_near_marketplacev2.git
   cd mobile
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```

### Prerequisites

- Node.js
- React Native CLI
- Firebase account setup for authentication

---

## 2. Backend

The backend is built using **Node.js** and **TypeScript**, providing robust server-side functionality to support the mobile application.

### Features

- **User Management**: Handles user creation and authentication requests.
- **NEAR Connection**: Establishes secure connections to the NEAR blockchain.
- **Smart Contract Transactions**: Interacts with the deployed NEAR smart contract to facilitate NFT minting and querying.

### Installation

To set up the backend server, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/mercurygrade/tcg_near_marketplacev2.git
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm run start
   ```

### Prerequisites

- Node.js
- NEAR account for deploying and interacting with contracts

---

## 3. NEAR Contract

The NEAR contract is deployed on the NEAR blockchain and is responsible for handling NFT minting and retrieval.

### Features

- **Minting NFTs**: Allows users to mint new NFTs based on specific parameters.
- **Fetching Minted NFTs**: Provides functionality to retrieve a list of minted NFTs for user accounts.

### Deployment

To deploy or interact with the NEAR contract:

1. Ensure you have the NEAR CLI installed.
2. Connect to your NEAR account.
3. Deploy the contract using:
   ```bash
   near deploy <contract-account> --wasmFile <contract.wasm>
   ```

### Prerequisites

- NEAR account
- NEAR CLI installed and configured

---

## Contribution

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

For any questions or issues, please reach out via the project's issue tracker. Happy coding!

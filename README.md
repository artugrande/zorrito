# Zorrito Finance 🦊

Gamified DeFi savings platform on Celo with age verification via Self Protocol and verifiable storage on Filecoin.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/artugrandes-projects/v0-nano-banana-pro-playground-uy)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/dw5WAuVTXk4)

---

## 🎮 Overview

Zorrito Finance turns saving into a game:

- 🕹️ **Gaming** – Keep your virtual fox alive by feeding it regularly.
- 💰 **DeFi** – Save in cUSD and earn yield automatically.
- 🎟️ **No-loss lottery** – Monthly prize draws where only the yield is used; your principal stays safe.
- 🌱 **Conservation** – 2% of every monthly prize is donated to **Rewilding Argentina** to support Patagonian wildlife.

The experience feels like a Tamagotchi, but every interaction (feeding, creating your fox) maps to real **on-chain actions on Celo** and **verifiable storage on Filecoin**.

---

## 🔐 Age Verification (Self Protocol)

Zorrito Finance includes an age verification flow using **Self Protocol** to ensure that only users **13+** can access the app.

### Verification Flow

1. Connect wallet (MiniPay / Farcaster / any Celo-compatible wallet).
2. Accept the onboarding disclaimer.
3. **Age verification via Self Protocol**:
   - The user scans a QR code and completes verification.
   - Only verified users can proceed.
4. Create your fox.
5. Start playing (feed, save, participate in the no-loss lottery).

### Verification Components

- **Frontend**  
  QR verification component:  
  `components/age-verification.tsx`

- **Smart Contract**  
  Age verification contract:  
  `contracts/src/ProofOfHuman.sol`

---

## 🚀 Frontend Setup (Next.js)

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

## 2. Configure Environment Variables

Create a `.env.local` file at the root of the project:

```env
# Self Protocol Configuration
NEXT_PUBLIC_SELF_APP_NAME="Zorrito Finance"
NEXT_PUBLIC_SELF_SCOPE_SEED="zorrito-finance"
NEXT_PUBLIC_SELF_ENDPOINT=0x... # Deployed contract address
NEXT_PUBLIC_SELF_ENDPOINT_TYPE="celo" # "celo" for mainnet (production)
```

## 3. Deploy the Verification Contract

See detailed instructions in contracts/README.md:

```bash
cd contracts
npm install
forge install foundry-rs/forge-std
# Configure .env with PRIVATE_KEY, NETWORK, etc.
forge script script/DeployProofOfHuman.s.sol:DeployProofOfHuman --rpc-url celo --broadcast
```

📁 Project Structure

```bash
zorrito/
├── app/                      # Next.js app directory
│   ├── page.tsx              # Main application flow
│   └── api/                  # API routes
├── components/
│   ├── age-verification.tsx  # Age verification component with QR
│   ├── connect-wallet.tsx
│   ├── create-fox.tsx
│   └── fox-home.tsx
├── contracts/                # Smart contracts (Foundry)
│   ├── src/
│   │   └── ProofOfHuman.sol
│   ├── script/
│   │   └── DeployProofOfHuman.s.sol
│   └── README.md
└── public/                   # Static assets
```

### 🛠️ Development
# Start development server

```bash
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 📚 Documentation

Verification Contracts
 – Full guide to deploying the contracts

Self Protocol Docs
 – Official Self Protocol documentation

Foundry Book
 – Official Foundry documentation

### 🔗 Links

App: Zorrito Finance

Self Protocol: self.xyz

Rewilding Argentina: rewildingargentina.org

### ⚠️ Important Notes

Scope Seed must be identical in both the contract (contracts/.env) and the frontend (.env.local).

Contract Address: Always use lowercase for NEXT_PUBLIC_SELF_ENDPOINT.

Mainnet: This project is configured for production on Celo Mainnet.

Security: Never share your PRIVATE_KEY publicly.

### 🧩 Celo Integration

Zorrito Finance runs on-chain on Celo Mainnet (chainId 42220) and uses verified contracts to represent each fox as an NFT and to manage user savings / yield.

On-chain Contracts (Celo Mainnet)

ZorritoFoxNFT – ERC-721 that represents each user’s fox

Network: Celo Mainnet (chainId 42220)

Address: 0x5dAD0f11e8CFf1069c0343F86A41EDeb3AF511b0

### Explorer: https://celoscan.io/address/0x5dAD0f11e8CFf1069c0343F86A41EDeb3AF511b0

ZorritoYieldEscrow – escrow contract that receives user savings deposits and links them to their fox

### Network: Celo Mainnet (chainId 42220)

Address: 0x69ba0851c4b8Ed0ee8e752fdDca36c4Bf85Af17F

### Explorer: https://celoscan.io/address/0x69ba0851c4b8Ed0ee8e752fdDca36c4Bf85Af17F

Both contracts are deployed and verified on Celo Mainnet, fulfilling the on-chain contracts requirement for the Celo track.

⚙️ How Zorrito Uses Celo

Zorrito Finance turns a classic DeFi savings flow into a Tamagotchi-style experience, but all important actions are real transactions on Celo:

Connect wallet on Celo
The user comes from MiniPay / Farcaster Wallet and connects automatically via a wagmi connector configured for Celo Mainnet (42220).

Age verification (Self Protocol)
Before interacting with the contracts, the user goes through an age verification flow using Self Protocol, ensuring that only users 13+ can play.

Create your first fox → NFT mint
When the user creates their fox:

The frontend calls the ZorritoFoxNFT contract on Celo.

A unique NFT is minted representing that fox (bound to the user’s wallet).

This NFT is the fox’s on-chain identity and can be queried by any explorer / DeFi integrator.

Feeding the fox = saving on Celo
Every time the user “feeds” their fox (game action):

A transaction is sent to ZorritoYieldEscrow.

The contract receives the deposit (e.g. cUSD or the configured stable token) and links it to the user’s fox.

From a UX perspective the user is “playing”, but on-chain they are building a savings history on Celo.

Yield and no-loss prize draws

Funds held in ZorritoYieldEscrow are designed to be integrated with yield strategies on Celo.

Only the generated yield is used for the monthly prize draws (no-loss lottery logic).

The user’s principal remains always withdrawable from the escrow contract.

This architecture makes Zorrito:

100% auditable on-chain on Celo.

A way to turn savings habits into a DeFi game accessible to non-technical users.

Easy to integrate with other protocols in the Celo DeFi ecosystem.

### 📱 Farcaster MiniApp & Celo

For the Celo track, Zorrito is also shipped as a Farcaster MiniApp, focused on a native experience inside the social ecosystem:

The app uses the Farcaster wagmi wallet connector to:

Auto-connect the user’s wallet inside Farcaster Wallet.

Sign transactions on Celo Mainnet with minimal friction.

From the MiniApp, the user can:

Connect with their wallet on Celo.

Verify their age with Self Protocol.

Create their fox (NFT mint).

Feed it (on-chain deposits into ZorritoYieldEscrow).

All of this runs on Celo, fulfilling the track requirements:

✅ Live MiniApp

✅ On-chain actions on Celo

✅ Verified contracts on Celo Mainnet

🧬 What We Integrated With Celo (for judges)

Celo Mainnet (chainId 42220) as the primary network for all user actions.

ERC-721 contract (ZorritoFoxNFT) to represent each fox as a unique, verifiable NFT within the Celo ecosystem.

ZorritoYieldEscrow contract to:

Receive savings deposits linked to each fox.

Act as a base layer to plug in DeFi yield strategies on Celo.

Enable no-loss lottery logic using only the generated yield.

Farcaster MiniApp integration using the wallet connector to sign Celo transactions directly from the social experience.

In one sentence: Zorrito Finance turns the habit of saving into a DeFi game on Celo, where feeding your fox is the same as saving on-chain through verified, long-term-oriented contracts.

### 👥 Team

Zorrito Finance is built by a team based in Rosario, Argentina.

Fill in with your real team details, for example:

Mateo Emilio (@MateoEmilio) – Fullstack dev, smart contracts & infra

Member 2 (@alerepetto5) – UX/UI & frontend

Member 3 (@artugrande) – Game design & product

You can also add a simple architecture diagram (Frontend ↔ Farcaster MiniApp ↔ Celo Contracts ↔ Self Protocol) as text or an image so the README is even clearer for judges.

🗄️ Filecoin & Synapse SDK Integration

In addition to running on Celo, Zorrito Finance uses Filecoin Onchain Cloud as a layer of verifiable data storage for foxes and their in-game events, using the Synapse SDK and the Warm Storage service on the Filecoin Calibration Testnet.

### 🌐 Network & Stack

Network: Filecoin Calibration Testnet

SDK: @filoz/synapse-sdk

Service: Warm Storage (datasets + pieces with metadata)

Backend Repo: zorrito-finance-backend (https://github.com/MateoEmilio1/zorrito-finance-backend)

On the backend we have a dedicated service (zorritoStorageService) that:

Creates and reuses DataSets per season (season, e.g. 2025-11).

Uploads fox images and “feeding” events as pieces with metadata.

Exposes REST endpoints (/api/fox, /api/fox/:id, /api/fox/season/:season) so the frontend can:

Create foxes

List foxes for a given season

Inspect all activity stored on Filecoin. See the backend repo for this (command: "test:metadata": "tsx src/test-dataset-piece-metadata.ts") : https://github.com/MateoEmilio1/zorrito-finance-backend

### 🧬 Zorrito DataSets on Filecoin

Each game season is mapped to a DataSet on Filecoin with strongly-typed metadata:

```
DataSetMetadata = {
  appId: "zorrito.finance",
  appUrl: "https://zorrito.vercel.app",
  env: "dev",
  network: "filecoin-calibration",
  season: "2025-11",
  gameVersion: "1.0.0",
}
```

This structure lets us:

Group all pieces (fox profiles + feeding events) by season.

Quickly query the history of a fox by reading its pieces and metadata from Warm Storage.

Prove, on Filecoin, that the data linked to each fox and season was actually stored and can be verified later.



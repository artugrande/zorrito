'use client'

import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Use Base Sepolia (testnet) - Farcaster wallet supports Base chains
// You can switch to base (mainnet) for production
export const config = createConfig({
  chains: [baseSepolia, base], // Base Sepolia for testing, Base for production
  connectors: [
    farcasterMiniApp(), // Farcaster MiniApp connector (connects automatically if wallet already connected)
    injected(),
    metaMask(),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
})

// Treasury wallet address - replace with your actual treasury address
export const TREASURY_WALLET_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_WALLET || '0x0000000000000000000000000000000000000000'


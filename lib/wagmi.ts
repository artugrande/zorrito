'use client'

import { createConfig, http } from 'wagmi'
import { injected, metaMask } from 'wagmi/connectors'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Celo Sepolia chain configuration
const celoSepolia = {
  id: 44787,
  name: 'Celo Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Celo',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/celo_sepolia'], // Ankr public endpoint
    },
    public: {
      http: ['https://rpc.ankr.com/celo_sepolia'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CeloScan',
      url: 'https://sepolia.celoscan.io',
    },
  },
  testnet: true,
} as const

export const config = createConfig({
  chains: [celoSepolia],
  connectors: [
    farcasterMiniApp(), // Farcaster MiniApp connector (connects automatically if wallet already connected)
    injected(),
    metaMask(),
  ],
  transports: {
    [celoSepolia.id]: http('https://rpc.ankr.com/celo_sepolia', {
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
})

// Treasury wallet address - replace with your actual treasury address
export const TREASURY_WALLET_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_WALLET || '0x0000000000000000000000000000000000000000'


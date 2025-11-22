'use client'

import { createConfig, http } from 'wagmi'
import { injected, metaMask } from 'wagmi/connectors'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Celo Mainnet chain configuration
const celo = {
  id: 42220,
  name: 'Celo',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://forno.celo.org'],
    },
    public: {
      http: ['https://forno.celo.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CeloScan',
      url: 'https://celoscan.io',
    },
  },
  testnet: false,
} as const

export const config = createConfig({
  chains: [celo],
  connectors: [
    farcasterMiniApp(), // Farcaster MiniApp connector (connects automatically if wallet already connected)
    injected(),
    metaMask(),
  ],
  transports: {
    [celo.id]: http('https://forno.celo.org', {
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
})

// Treasury wallet address - replace with your actual treasury address
export const TREASURY_WALLET_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_WALLET || '0x0000000000000000000000000000000000000000'


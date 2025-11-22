'use client'

import { createConfig, http } from 'wagmi'
import { injected, metaMask } from 'wagmi/connectors'

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
      http: ['https://sepolia-forno.celo.org'],
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
    injected(),
    metaMask(),
  ],
  transports: {
    [celoSepolia.id]: http(),
  },
})

// Treasury wallet address - replace with your actual treasury address
export const TREASURY_WALLET_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_WALLET || '0x0000000000000000000000000000000000000000'


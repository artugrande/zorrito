'use client'

import { createConfig, http } from 'wagmi'
import { celo } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Use official Celo chain from Wagmi to ensure proper nativeCurrency configuration
// This ensures wallets display "CELO" instead of "ETH"
// Using injected() connector to avoid getChainId() errors with Farcaster connector

export const config = createConfig({
  chains: [celo], // Official Celo chain from Wagmi with proper nativeCurrency: { name: 'CELO', symbol: 'CELO' }
  connectors: [
    farcasterMiniApp(), // Farcaster MiniApp connector (connects automatically if wallet already connected)
    injected(), // 👈 EL CORRECTO – evita getChainId error, compatible con Metamask, Brave, Rabby, etc.
  ],
  transports: {
    [celo.id]: http('https://forno.celo.org'), // Mainnet RPC oficial
  },
  ssr: false, // Disable SSR for wallet connections
})

// Treasury wallet address - replace with your actual treasury address
export const TREASURY_WALLET_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_WALLET || '0x0000000000000000000000000000000000000000'


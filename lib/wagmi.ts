'use client'

import { createConfig, http } from 'wagmi'
import { celo } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Use official Celo chain from Wagmi to ensure proper nativeCurrency configuration
// This ensures wallets display "CELO" instead of "ETH"

export const config = createConfig({
  chains: [celo], // Official Celo chain from Wagmi with proper nativeCurrency: { name: 'CELO', symbol: 'CELO' }
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


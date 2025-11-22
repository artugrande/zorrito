'use client'

// Farcaster Auth Kit configuration
// Get your app ID from https://warpcast.com/~/developers
export const farcasterConfig = {
  // Domain for SIWE (Sign-In With Ethereum)
  domain: typeof window !== 'undefined' ? window.location.hostname : 'zorrito.vercel.app',
  // URI for SIWE
  siweUri: typeof window !== 'undefined' ? window.location.origin : 'https://zorrito.vercel.app',
  // Optional: RPC URL for Ethereum (if needed)
  // rpcUrl: process.env.NEXT_PUBLIC_FARCASTER_RPC_URL,
}

// Farcaster miniapp configuration (matches farcaster.json)
export const miniappConfig = {
  name: 'Zorrito Finance',
  description: "Save daily with a no-loss lottery. Deposit cUSD, grow savings with yield, win prizes, and support Patagonia's wildlife conservation.",
  imageUrl: 'https://zorrito.vercel.app/images/shareimage.png',
  button: {
    title: 'Play Now',
    action: {
      type: 'launch_miniapp',
      url: 'https://zorrito.vercel.app',
    },
  },
  version: '1',
}


"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AuthKitProvider } from '@farcaster/auth-kit'
import { config } from '@/lib/wagmi'
import { farcasterConfig } from '@/lib/farcaster'
import { useState, useEffect } from 'react'

// Dynamically import CSS to avoid SSR issues
if (typeof window !== 'undefined') {
  import('@farcaster/auth-kit/styles.css').catch(() => {
    // Silently fail if CSS can't be loaded
  })
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <AuthKitProvider config={farcasterConfig}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </AuthKitProvider>
  )
}


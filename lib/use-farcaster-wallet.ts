'use client'

import { useState, useEffect } from 'react'
import type { SDK } from '@farcaster/miniapp-sdk'

/**
 * Hook to use Farcaster SDK wallet directly
 * In Farcaster miniapps, the wallet is typically available through the context
 * or automatically connected. This hook checks for wallet availability.
 */
export function useFarcasterWallet() {
  const [sdk, setSdk] = useState<SDK | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize SDK and check for wallet
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initSDK = async () => {
      try {
        const { sdk: farcasterSDK } = await import('@farcaster/miniapp-sdk')
        setSdk(farcasterSDK)
        
        // In Farcaster miniapps, the wallet might be available through:
        // 1. sdk.context.wallet (if available)
        // 2. window.ethereum (injected by Farcaster client)
        // 3. Automatically connected
        
        // Note: We don't access context.wallet directly as it causes path errors
        // Instead, we rely on window.ethereum which is injected by Farcaster

        // Check if window.ethereum is available (injected by Farcaster)
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          try {
            const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
            if (accounts && accounts.length > 0) {
              setAddress(accounts[0])
              setIsConnected(true)
            }
          } catch (e) {
            // Couldn't get accounts
          }
        }
      } catch (err) {
        console.log('Farcaster SDK not available:', err)
        // SDK not available (not in Farcaster context)
      }
    }

    initSDK()
  }, [])

  const connect = async () => {
    if (!sdk) {
      setError('Farcaster SDK not available')
      throw new Error('Farcaster SDK not available')
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Use window.ethereum (injected by Farcaster client)
      // Note: We don't access context.wallet directly as it causes path errors
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ 
            method: 'eth_requestAccounts' 
          })
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0])
            setIsConnected(true)
            return accounts[0]
          }
        } catch (ethError: any) {
          // User rejected or error
          if (ethError.code === 4001) {
            throw new Error('User rejected wallet connection')
          }
          throw ethError
        }
      }

      // If still no address, the wallet might not be available
      throw new Error('Wallet not available. Make sure you are running in a Farcaster client.')
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to connect wallet'
      setError(errorMessage)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    if (!sdk) return

    try {
      // Farcaster SDK doesn't have explicit disconnect, just clear local state
      setAddress(null)
      setIsConnected(false)
    } catch (err) {
      console.error('Error disconnecting:', err)
    }
  }

  return {
    address,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sdk,
  }
}


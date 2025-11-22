'use client'

import { useState, useEffect } from 'react'
import type { SDK } from '@farcaster/miniapp-sdk'

/**
 * Hook to use Farcaster SDK wallet directly
 * This uses the Farcaster SDK's built-in wallet functionality
 */
export function useFarcasterWallet() {
  const [sdk, setSdk] = useState<SDK | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize SDK
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initSDK = async () => {
      try {
        const { sdk: farcasterSDK } = await import('@farcaster/miniapp-sdk')
        setSdk(farcasterSDK)
        
        // Check if already connected
        try {
          const account = await farcasterSDK.actions.connectAccount()
          if (account?.address) {
            setAddress(account.address)
            setIsConnected(true)
          }
        } catch (e) {
          // Not connected yet, that's okay
          console.log('Not connected to wallet yet')
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
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const account = await sdk.actions.connectAccount()
      if (account?.address) {
        setAddress(account.address)
        setIsConnected(true)
        return account.address
      } else {
        throw new Error('No address returned from wallet connection')
      }
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


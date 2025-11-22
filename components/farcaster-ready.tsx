"use client"

import { useEffect } from 'react'

/**
 * Component to call sdk.actions.ready() when the app is loaded
 * This is required for Farcaster miniapps to hide the splash screen
 */
export function FarcasterReady() {
  useEffect(() => {
    // Only call ready() if we're in a Farcaster miniapp context
    if (typeof window !== 'undefined') {
      // Check if we're in a Farcaster miniapp by checking for the SDK
      const initReady = async () => {
        try {
          // Dynamically import to avoid SSR issues
          const { sdk } = await import('@farcaster/miniapp-sdk')
          
          // Call ready() to indicate the app is loaded
          sdk.actions.ready()
          
          console.log('Farcaster miniapp ready() called')
        } catch (error) {
          // Silently fail if not in Farcaster context or SDK not available
          // This is normal when running outside of Farcaster
          console.log('Farcaster SDK not available (running outside Farcaster context)')
        }
      }
      
      initReady()
    }
  }, [])

  return null // This component doesn't render anything
}


"use client"

import { useEffect } from 'react'

/**
 * Component to call sdk.actions.ready() when the app is loaded
 * This is required for Farcaster miniapps to hide the splash screen
 * 
 * According to Farcaster docs: https://miniapps.farcaster.xyz/docs/getting-started#making-your-app-display
 * After your app loads, you must call sdk.actions.ready() to hide the splash screen
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
          
          // Call ready() with await as per Farcaster documentation
          // This hides the splash screen and displays your content
          await sdk.actions.ready()
          
          console.log('Farcaster miniapp ready() called successfully')
        } catch (error) {
          // Silently fail if not in Farcaster context or SDK not available
          // This is normal when running outside of Farcaster
          console.log('Farcaster SDK not available (running outside Farcaster context):', error)
        }
      }
      
      // Call initReady immediately when component mounts
      initReady()
    }
  }, [])

  return null // This component doesn't render anything
}


'use client'

import { useFarcasterAuthKit } from '@farcaster/auth-kit'

/**
 * Hook to access Farcaster authentication state and methods
 * Use this hook in your components to interact with Farcaster
 */
export function useFarcaster() {
  const {
    isAuthenticated,
    user,
    signIn,
    signOut,
  } = useFarcasterAuthKit()

  return {
    isAuthenticated,
    user,
    signIn,
    signOut,
    // Helper to get user's Farcaster username
    username: user?.username || null,
    // Helper to get user's FID (Farcaster ID)
    fid: user?.fid || null,
  }
}


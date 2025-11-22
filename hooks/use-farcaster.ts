'use client'

import { useSignIn, useProfile } from '@farcaster/auth-kit'

/**
 * Hook to access Farcaster authentication state and methods
 * Use this hook in your components to interact with Farcaster
 */
export function useFarcaster() {
  const { signIn, data: signInData, isPending: isSigningIn } = useSignIn()
  const { profile, isAuthenticated } = useProfile()

  // Extract user data from profile
  const user = profile
  const username = profile?.username || null
  const fid = profile?.fid || null

  // Sign out function - clears the profile
  const signOut = () => {
    // Farcaster auth-kit doesn't have a direct signOut
    // The profile will be cleared when the user disconnects
    // You may need to implement custom logic here
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return {
    isAuthenticated: isAuthenticated || false,
    user,
    signIn,
    signOut,
    username,
    fid,
    isPending: isSigningIn,
    signInData,
  }
}


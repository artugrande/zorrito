'use client'

/**
 * React hook for interacting with ZorritoFoxNFT contract
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { ZORRITO_FOX_NFT_ADDRESS, FOX_ALIVE_DURATION_SECONDS } from '@/lib/contracts/constants'
import { ZORRITO_FOX_NFT_ABI } from '@/lib/contracts/abis'
import type { FoxInfo, FoxInfoRaw } from '@/lib/contracts/types'
import { useEffect, useState } from 'react'
import { hexToString } from 'viem'

/**
 * Hook to get fox information
 */
export function useFoxInfo(tokenId: bigint | undefined) {
  const publicClient = usePublicClient()
  const [foxInfo, setFoxInfo] = useState<FoxInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!tokenId || !publicClient) return

    const fetchFoxInfo = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Get owner
        const owner = await publicClient.readContract({
          address: ZORRITO_FOX_NFT_ADDRESS,
          abi: ZORRITO_FOX_NFT_ABI,
          functionName: 'ownerOf',
          args: [tokenId],
        }) as `0x${string}`

        // Get token URI
        const tokenURI = await publicClient.readContract({
          address: ZORRITO_FOX_NFT_ADDRESS,
          abi: ZORRITO_FOX_NFT_ABI,
          functionName: 'tokenURI',
          args: [tokenId],
        }) as string

        // Try to use getFoxInfo first (returns struct), fallback to foxInfo
        let foxInfoRaw: FoxInfoRaw
        try {
          const foxStruct = await publicClient.readContract({
            address: ZORRITO_FOX_NFT_ADDRESS,
            abi: ZORRITO_FOX_NFT_ABI,
            functionName: 'getFoxInfo',
            args: [tokenId],
          }) as FoxInfoRaw
          foxInfoRaw = foxStruct
        } catch {
          // Fallback to foxInfo mapping
          foxInfoRaw = await publicClient.readContract({
            address: ZORRITO_FOX_NFT_ADDRESS,
            abi: ZORRITO_FOX_NFT_ABI,
            functionName: 'foxInfo',
            args: [tokenId],
          }) as FoxInfoRaw
        }

        // Convert bytes32 foxId to string (remove null bytes)
        let foxIdString = foxInfoRaw.foxId
        try {
          // Try to decode as UTF-8 string (removing null bytes)
          foxIdString = hexToString(foxInfoRaw.foxId, { size: 32 }).replace(/\0/g, '')
        } catch {
          // If it's not a valid UTF-8 string, use hex representation
          foxIdString = foxInfoRaw.foxId
        }

        // Calculate if fox is alive
        const currentTimestamp = BigInt(Math.floor(Date.now() / 1000))
        const timeSinceLastFeed = currentTimestamp - foxInfoRaw.lastFeed
        const isAlive = timeSinceLastFeed < BigInt(FOX_ALIVE_DURATION_SECONDS)

        setFoxInfo({
          tokenId,
          owner,
          tokenURI,
          foxId: foxIdString,
          lastFeed: new Date(Number(foxInfoRaw.lastFeed) * 1000),
          streak: foxInfoRaw.streak,
          foodCredits: foxInfoRaw.foodCredits,
          isAlive,
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch fox info'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchFoxInfo()
  }, [tokenId, publicClient])

  return { foxInfo, isLoading, error }
}

/**
 * Hook to get alive foxes for a user
 */
export function useAliveFoxes(userAddress: `0x${string}` | undefined) {
  const publicClient = usePublicClient()
  const [aliveFoxes, setAliveFoxes] = useState<bigint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userAddress || !publicClient) return

    const fetchAliveFoxes = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const foxes = await publicClient.readContract({
          address: ZORRITO_FOX_NFT_ADDRESS,
          abi: ZORRITO_FOX_NFT_ABI,
          functionName: 'getAliveFoxes',
          args: [userAddress],
        }) as bigint[]

        setAliveFoxes(foxes)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch alive foxes'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAliveFoxes()
  }, [userAddress, publicClient])

  return { aliveFoxes, isLoading, error }
}

/**
 * Hook to feed a fox
 */
export function useFeedFox() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const feedFox = (tokenId: bigint) => {
    writeContract({
      address: ZORRITO_FOX_NFT_ADDRESS,
      abi: ZORRITO_FOX_NFT_ABI,
      functionName: 'feedFox',
      args: [tokenId],
    })
  }

  return {
    feedFox,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook to mint a fox (only contract owner)
 */
export function useMintFox() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const mintFox = (owner: `0x${string}`, foxIdString: string, tokenURI: string) => {
    writeContract({
      address: ZORRITO_FOX_NFT_ADDRESS,
      abi: ZORRITO_FOX_NFT_ABI,
      functionName: 'mintFox',
      args: [owner, foxIdString, tokenURI],
    })
  }

  return {
    mintFox,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}



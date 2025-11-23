/**
 * Helper functions for interacting with ZorritoFoxNFT contract
 * Uses wagmi/viem for contract interactions
 */

import { Address, formatEther, parseEther, bytesToString, hexToString } from 'viem'
import { ZORRITO_FOX_NFT_ADDRESS, FOX_ALIVE_DURATION_SECONDS } from './constants'
import { ZORRITO_FOX_NFT_ABI } from './abis'
import type { FoxInfo, FoxInfoRaw } from './types'

/**
 * Get fox information from the contract
 * Uses getFoxInfo function which returns a struct, or falls back to foxInfo
 */
export async function getFoxInfo(
  publicClient: any,
  tokenId: bigint
): Promise<FoxInfo | null> {
  try {
    // Get owner
    const owner = await publicClient.readContract({
      address: ZORRITO_FOX_NFT_ADDRESS,
      abi: ZORRITO_FOX_NFT_ABI,
      functionName: 'ownerOf',
      args: [tokenId],
    }) as Address

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

    return {
      tokenId,
      owner,
      tokenURI,
      foxId: foxIdString,
      lastFeed: new Date(Number(foxInfoRaw.lastFeed) * 1000),
      streak: foxInfoRaw.streak,
      foodCredits: foxInfoRaw.foodCredits,
      isAlive,
    }
  } catch (error) {
    console.error('Error getting fox info:', error)
    return null
  }
}

/**
 * Check if a fox is alive
 */
export async function isFoxAlive(
  publicClient: any,
  tokenId: bigint
): Promise<boolean> {
  try {
    const foxInfo = await getFoxInfo(publicClient, tokenId)
    return foxInfo?.isAlive ?? false
  } catch (error) {
    console.error('Error checking if fox is alive:', error)
    return false
  }
}

/**
 * Get all alive foxes for a user
 */
export async function getAliveFoxes(
  publicClient: any,
  userAddress: Address
): Promise<bigint[]> {
  try {
    const aliveFoxes = await publicClient.readContract({
      address: ZORRITO_FOX_NFT_ADDRESS,
      abi: ZORRITO_FOX_NFT_ABI,
      functionName: 'getAliveFoxes',
      args: [userAddress],
    }) as bigint[]

    return aliveFoxes
  } catch (error) {
    console.error('Error getting alive foxes:', error)
    return []
  }
}

/**
 * Get user's NFT balance
 */
export async function getFoxBalance(
  publicClient: any,
  userAddress: Address
): Promise<bigint> {
  try {
    const balance = await publicClient.readContract({
      address: ZORRITO_FOX_NFT_ADDRESS,
      abi: ZORRITO_FOX_NFT_ABI,
      functionName: 'balanceOf',
      args: [userAddress],
    }) as bigint

    return balance
  } catch (error) {
    console.error('Error getting fox balance:', error)
    return 0n
  }
}

/**
 * Mint a new fox (only contract owner can call)
 */
export async function mintFox(
  walletClient: any,
  owner: Address,
  foxIdString: string,
  tokenURI: string
): Promise<`0x${string}`> {
  try {
    const hash = await walletClient.writeContract({
      address: ZORRITO_FOX_NFT_ADDRESS,
      abi: ZORRITO_FOX_NFT_ABI,
      functionName: 'mintFox',
      args: [owner, foxIdString, tokenURI],
    })

    return hash
  } catch (error: any) {
    console.error('Error minting fox:', error)
    throw new Error(error?.message || 'Failed to mint fox')
  }
}

/**
 * Feed a fox (anyone can call)
 */
export async function feedFox(
  walletClient: any,
  tokenId: bigint
): Promise<`0x${string}`> {
  try {
    const hash = await walletClient.writeContract({
      address: ZORRITO_FOX_NFT_ADDRESS,
      abi: ZORRITO_FOX_NFT_ABI,
      functionName: 'feedFox',
      args: [tokenId],
    })

    return hash
  } catch (error: any) {
    console.error('Error feeding fox:', error)
    throw new Error(error?.message || 'Failed to feed fox')
  }
}



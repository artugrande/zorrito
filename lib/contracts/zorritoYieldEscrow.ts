/**
 * Helper functions for interacting with ZorritoYieldEscrow contract
 * Uses wagmi/viem for contract interactions
 */

import { Address, formatEther, parseEther, maxUint256 } from 'viem'
import { ZORRITO_YIELD_ESCROW_ADDRESS, CELO_TOKEN_ADDRESS } from './constants'
import { ZORRITO_YIELD_ESCROW_ABI, ERC20_ABI } from './abis'
import type { EscrowInfo } from './types'

/**
 * Get user's principal deposit
 * Uses getPrincipal function if available, otherwise falls back to principal mapping
 */
export async function getPrincipal(
  publicClient: any,
  userAddress: Address
): Promise<bigint> {
  try {
    // Try getPrincipal first (view function), fallback to principal mapping
    try {
      const principal = await publicClient.readContract({
        address: ZORRITO_YIELD_ESCROW_ADDRESS,
        abi: ZORRITO_YIELD_ESCROW_ABI,
        functionName: 'getPrincipal',
        args: [userAddress],
      }) as bigint
      return principal
    } catch {
      // Fallback to principal mapping
      const principal = await publicClient.readContract({
        address: ZORRITO_YIELD_ESCROW_ADDRESS,
        abi: ZORRITO_YIELD_ESCROW_ABI,
        functionName: 'principal',
        args: [userAddress],
      }) as bigint
      return principal
    }
  } catch (error) {
    console.error('Error getting principal:', error)
    return 0n
  }
}

/**
 * Get total principal in escrow
 */
export async function getTotalPrincipal(
  publicClient: any
): Promise<bigint> {
  try {
    const totalPrincipal = await publicClient.readContract({
      address: ZORRITO_YIELD_ESCROW_ADDRESS,
      abi: ZORRITO_YIELD_ESCROW_ABI,
      functionName: 'totalPrincipal',
    }) as bigint

    return totalPrincipal
  } catch (error) {
    console.error('Error getting total principal:', error)
    return 0n
  }
}

/**
 * Get available yield for distribution
 */
export async function getAvailableYield(
  publicClient: any
): Promise<bigint> {
  try {
    const yield = await publicClient.readContract({
      address: ZORRITO_YIELD_ESCROW_ADDRESS,
      abi: ZORRITO_YIELD_ESCROW_ABI,
      functionName: 'getAvailableYield',
    }) as bigint

    return yield
  } catch (error) {
    console.error('Error getting available yield:', error)
    return 0n
  }
}

/**
 * Get alive foxes for a user (from escrow contract)
 */
export async function getAliveFoxesFromEscrow(
  publicClient: any,
  userAddress: Address
): Promise<bigint[]> {
  try {
    const aliveFoxes = await publicClient.readContract({
      address: ZORRITO_YIELD_ESCROW_ADDRESS,
      abi: ZORRITO_YIELD_ESCROW_ABI,
      functionName: 'getAliveFoxes',
      args: [userAddress],
    }) as bigint[]

    return aliveFoxes
  } catch (error) {
    console.error('Error getting alive foxes from escrow:', error)
    return []
  }
}

/**
 * Check CELO token allowance
 */
export async function getCeloAllowance(
  publicClient: any,
  owner: Address
): Promise<bigint> {
  try {
    const allowance = await publicClient.readContract({
      address: CELO_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner, ZORRITO_YIELD_ESCROW_ADDRESS],
    }) as bigint

    return allowance
  } catch (error) {
    console.error('Error getting CELO allowance:', error)
    return 0n
  }
}

/**
 * Approve CELO token spending
 */
export async function approveCelo(
  walletClient: any,
  amount: bigint = maxUint256
): Promise<`0x${string}`> {
  try {
    const hash = await walletClient.writeContract({
      address: CELO_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ZORRITO_YIELD_ESCROW_ADDRESS, amount],
    })

    return hash
  } catch (error: any) {
    console.error('Error approving CELO:', error)
    throw new Error(error?.message || 'Failed to approve CELO')
  }
}

/**
 * Deposit CELO into escrow (approves automatically if needed)
 */
export async function depositCelo(
  walletClient: any,
  publicClient: any,
  amount: string // Amount in CELO (e.g., "10" for 10 CELO)
): Promise<`0x${string}`> {
  try {
    const account = walletClient.account?.address
    if (!account) {
      throw new Error('No account connected')
    }

    const amountWei = parseEther(amount)

    // Check allowance
    const allowance = await getCeloAllowance(publicClient, account)
    
    // Approve if needed
    if (allowance < amountWei) {
      console.log('Approving CELO token...')
      const approveHash = await approveCelo(walletClient, maxUint256)
      // Wait for approval to be confirmed
      await publicClient.waitForTransactionReceipt({ hash: approveHash })
    }

    // Deposit
    const hash = await walletClient.writeContract({
      address: ZORRITO_YIELD_ESCROW_ADDRESS,
      abi: ZORRITO_YIELD_ESCROW_ABI,
      functionName: 'deposit',
      args: [amountWei],
    })

    return hash
  } catch (error: any) {
    console.error('Error depositing CELO:', error)
    throw new Error(error?.message || 'Failed to deposit CELO')
  }
}

/**
 * Withdraw CELO from escrow
 */
export async function withdrawCelo(
  walletClient: any,
  amount: string // Amount in CELO (e.g., "10" for 10 CELO)
): Promise<`0x${string}`> {
  try {
    const amountWei = parseEther(amount)

    const hash = await walletClient.writeContract({
      address: ZORRITO_YIELD_ESCROW_ADDRESS,
      abi: ZORRITO_YIELD_ESCROW_ABI,
      functionName: 'withdraw',
      args: [amountWei],
    })

    return hash
  } catch (error: any) {
    console.error('Error withdrawing CELO:', error)
    throw new Error(error?.message || 'Failed to withdraw CELO')
  }
}

/**
 * Harvest and distribute yield (only contract owner can call)
 */
export async function harvestAndDistribute(
  walletClient: any
): Promise<`0x${string}`> {
  try {
    const hash = await walletClient.writeContract({
      address: ZORRITO_YIELD_ESCROW_ADDRESS,
      abi: ZORRITO_YIELD_ESCROW_ABI,
      functionName: 'harvestAndDistribute',
    })

    return hash
  } catch (error: any) {
    console.error('Error harvesting and distributing:', error)
    throw new Error(error?.message || 'Failed to harvest and distribute')
  }
}

/**
 * Get complete escrow info for a user
 */
export async function getEscrowInfo(
  publicClient: any,
  userAddress: Address
): Promise<EscrowInfo> {
  try {
    const [principal, totalPrincipal, availableYield, aliveFoxes] = await Promise.all([
      getPrincipal(publicClient, userAddress),
      getTotalPrincipal(publicClient),
      getAvailableYield(publicClient),
      getAliveFoxesFromEscrow(publicClient, userAddress),
    ])

    return {
      principal,
      totalPrincipal,
      availableYield,
      aliveFoxes,
    }
  } catch (error) {
    console.error('Error getting escrow info:', error)
    return {
      principal: 0n,
      totalPrincipal: 0n,
      availableYield: 0n,
      aliveFoxes: [],
    }
  }
}



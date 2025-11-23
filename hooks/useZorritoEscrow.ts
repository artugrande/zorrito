'use client'

/**
 * React hook for interacting with ZorritoYieldEscrow contract
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from 'wagmi'
import { ZORRITO_YIELD_ESCROW_ADDRESS, CELO_TOKEN_ADDRESS } from '@/lib/contracts/constants'
import { ZORRITO_YIELD_ESCROW_ABI, ERC20_ABI } from '@/lib/contracts/abis'
import { parseEther, maxUint256 } from 'viem'
import { useEffect, useState } from 'react'
import type { EscrowInfo } from '@/lib/contracts/types'

/**
 * Hook to get user's principal
 */
export function usePrincipal(userAddress: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: ZORRITO_YIELD_ESCROW_ADDRESS,
    abi: ZORRITO_YIELD_ESCROW_ABI,
    functionName: 'principal',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })

  return {
    principal: data as bigint | undefined,
    isLoading,
    error,
  }
}

/**
 * Hook to get total principal
 */
export function useTotalPrincipal() {
  const { data, isLoading, error } = useReadContract({
    address: ZORRITO_YIELD_ESCROW_ADDRESS,
    abi: ZORRITO_YIELD_ESCROW_ABI,
    functionName: 'totalPrincipal',
  })

  return {
    totalPrincipal: data as bigint | undefined,
    isLoading,
    error,
  }
}

/**
 * Hook to get available yield
 */
export function useAvailableYield() {
  const { data, isLoading, error } = useReadContract({
    address: ZORRITO_YIELD_ESCROW_ADDRESS,
    abi: ZORRITO_YIELD_ESCROW_ABI,
    functionName: 'getAvailableYield',
  })

  return {
    availableYield: data as bigint | undefined,
    isLoading,
    error,
  }
}

/**
 * Hook to get alive foxes from escrow
 */
export function useAliveFoxesFromEscrow(userAddress: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: ZORRITO_YIELD_ESCROW_ADDRESS,
    abi: ZORRITO_YIELD_ESCROW_ABI,
    functionName: 'getAliveFoxes',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })

  return {
    aliveFoxes: data as bigint[] | undefined,
    isLoading,
    error,
  }
}

/**
 * Hook to check CELO allowance
 */
export function useCeloAllowance(owner: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: CELO_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: owner ? [owner, ZORRITO_YIELD_ESCROW_ADDRESS] : undefined,
    query: {
      enabled: !!owner,
    },
  })

  return {
    allowance: data as bigint | undefined,
    isLoading,
    error,
  }
}

/**
 * Hook to approve CELO token
 */
export function useApproveCelo() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approveCelo = (amount: bigint = maxUint256) => {
    writeContract({
      address: CELO_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ZORRITO_YIELD_ESCROW_ADDRESS, amount],
    })
  }

  return {
    approveCelo,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook to deposit CELO (handles approval automatically)
 */
export function useDepositCelo() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  const { allowance, isLoading: isLoadingAllowance } = useCeloAllowance(address)
  const { approveCelo, hash: approveHash, isPending: isApproving, isSuccess: isApproveSuccess, isLoading: isApproveConfirming } = useApproveCelo()

  const depositCelo = async (amount: string) => {
    if (!address) {
      throw new Error('No account connected')
    }

    const amountWei = parseEther(amount)

    // Check if approval is needed
    if (!allowance || allowance < amountWei) {
      // Approve first
      approveCelo(maxUint256)
      throw new Error('Please approve CELO token first, then try depositing again')
    }

    // Deposit
    writeContract({
      address: ZORRITO_YIELD_ESCROW_ADDRESS,
      abi: ZORRITO_YIELD_ESCROW_ABI,
      functionName: 'deposit',
      args: [amountWei],
    })
  }

  return {
    depositCelo,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    needsApproval: allowance !== undefined && allowance < parseEther('0.001'),
    isApproving,
    isApproveSuccess,
    approveHash,
    isLoadingAllowance,
  }
}

/**
 * Hook to withdraw CELO
 */
export function useWithdrawCelo() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const withdrawCelo = (amount: string) => {
    const amountWei = parseEther(amount)
    writeContract({
      address: ZORRITO_YIELD_ESCROW_ADDRESS,
      abi: ZORRITO_YIELD_ESCROW_ABI,
      functionName: 'withdraw',
      args: [amountWei],
    })
  }

  return {
    withdrawCelo,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook to get complete escrow info
 */
export function useEscrowInfo(userAddress: `0x${string}` | undefined) {
  const { principal, isLoading: isLoadingPrincipal } = usePrincipal(userAddress)
  const { totalPrincipal, isLoading: isLoadingTotal } = useTotalPrincipal()
  const { availableYield, isLoading: isLoadingYield } = useAvailableYield()
  const { aliveFoxes, isLoading: isLoadingFoxes } = useAliveFoxesFromEscrow(userAddress)

  const escrowInfo: EscrowInfo = {
    principal: principal ?? 0n,
    totalPrincipal: totalPrincipal ?? 0n,
    availableYield: availableYield ?? 0n,
    aliveFoxes: aliveFoxes ?? [],
  }

  return {
    escrowInfo,
    isLoading: isLoadingPrincipal || isLoadingTotal || isLoadingYield || isLoadingFoxes,
  }
}


/**
 * Example usage of Zorrito contracts
 * This file demonstrates how to use the hooks and helper functions
 */

'use client'

import { useAccount } from 'wagmi'
import { useFoxInfo, useFeedFox, useAliveFoxes, useMintFox } from '@/hooks/useZorritoNFT'
import { useDepositCelo, useWithdrawCelo, useEscrowInfo, useApproveCelo } from '@/hooks/useZorritoEscrow'
import { formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/**
 * Example: Display fox information
 */
export function FoxInfoExample({ tokenId }: { tokenId: bigint }) {
  const { foxInfo, isLoading, error } = useFoxInfo(tokenId)

  if (isLoading) return <div>Loading fox info...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!foxInfo) return <div>Fox not found</div>

  return (
    <Card className="p-4">
      <h3>Fox #{foxInfo.tokenId.toString()}</h3>
      <p>Fox ID: {foxInfo.foxId}</p>
      <p>Owner: {foxInfo.owner}</p>
      <p>Status: {foxInfo.isAlive ? '🦊 Alive' : '💀 Dead'}</p>
      <p>Streak: {foxInfo.streak.toString()} days</p>
      <p>Food Credits: {foxInfo.foodCredits.toString()}</p>
      <p>Last Fed: {foxInfo.lastFeed.toLocaleString()}</p>
    </Card>
  )
}

/**
 * Example: Feed a fox
 */
export function FeedFoxExample({ tokenId }: { tokenId: bigint }) {
  const { feedFox, isPending, isConfirming, isSuccess, error } = useFeedFox()

  const handleFeed = () => {
    feedFox(tokenId)
  }

  return (
    <div>
      <Button onClick={handleFeed} disabled={isPending || isConfirming}>
        {isPending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Feed Fox'}
      </Button>
      {isSuccess && <p>✅ Fox fed successfully!</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
    </div>
  )
}

/**
 * Example: Display user's alive foxes
 */
export function AliveFoxesExample() {
  const { address } = useAccount()
  const { aliveFoxes, isLoading, error } = useAliveFoxes(address)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h3>Your Alive Foxes</h3>
      {aliveFoxes.length === 0 ? (
        <p>No alive foxes found</p>
      ) : (
        <ul>
          {aliveFoxes.map((tokenId) => (
            <li key={tokenId.toString()}>Fox #{tokenId.toString()}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Example: Deposit CELO
 */
export function DepositCeloExample() {
  const { depositCelo, isPending, isConfirming, isSuccess, error, needsApproval, isApproving, approveCelo } = useDepositCelo()
  const { approveCelo: approve, isPending: isApprovePending } = useApproveCelo()

  const handleDeposit = async () => {
    try {
      await depositCelo('10') // Deposit 10 CELO
    } catch (err: any) {
      if (err.message.includes('approve')) {
        // User needs to approve first
        approve()
      }
    }
  }

  return (
    <div>
      <Button onClick={handleDeposit} disabled={isPending || isConfirming || isApprovePending}>
        {isPending ? 'Sending...' : isConfirming ? 'Confirming...' : isApprovePending ? 'Approving...' : 'Deposit 10 CELO'}
      </Button>
      {needsApproval && (
        <p className="text-yellow-500">⚠️ You need to approve CELO token first</p>
      )}
      {isSuccess && <p>✅ Deposit successful!</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
    </div>
  )
}

/**
 * Example: Display escrow information
 */
export function EscrowInfoExample() {
  const { address } = useAccount()
  const { escrowInfo, isLoading } = useEscrowInfo(address)

  if (isLoading) return <div>Loading escrow info...</div>

  return (
    <Card className="p-4">
      <h3>Escrow Information</h3>
      <p>Your Principal: {formatEther(escrowInfo.principal)} CELO</p>
      <p>Total Principal: {formatEther(escrowInfo.totalPrincipal)} CELO</p>
      <p>Available Yield: {formatEther(escrowInfo.availableYield)} CELO</p>
      <p>Alive Foxes: {escrowInfo.aliveFoxes.length}</p>
    </Card>
  )
}

/**
 * Example: Withdraw CELO
 */
export function WithdrawCeloExample() {
  const { withdrawCelo, isPending, isConfirming, isSuccess, error } = useWithdrawCelo()

  const handleWithdraw = () => {
    withdrawCelo('5') // Withdraw 5 CELO
  }

  return (
    <div>
      <Button onClick={handleWithdraw} disabled={isPending || isConfirming}>
        {isPending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Withdraw 5 CELO'}
      </Button>
      {isSuccess && <p>✅ Withdrawal successful!</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
    </div>
  )
}

/**
 * Example: Mint a fox (only contract owner)
 */
export function MintFoxExample({ owner, foxId, tokenURI }: { owner: string, foxId: string, tokenURI: string }) {
  const { mintFox, isPending, isConfirming, isSuccess, error } = useMintFox()

  const handleMint = () => {
    mintFox(owner as `0x${string}`, foxId, tokenURI)
  }

  return (
    <div>
      <Button onClick={handleMint} disabled={isPending || isConfirming}>
        {isPending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Mint Fox'}
      </Button>
      {isSuccess && <p>✅ Fox minted successfully!</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
    </div>
  )
}



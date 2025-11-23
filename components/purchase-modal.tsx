"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useWaitForTransactionReceipt, useChainId, usePublicClient, useWalletClient, useAccount, useSendTransaction } from "wagmi"
import { parseEther } from "viem"
import { ZORRITO_YIELD_ESCROW_ADDRESS, CELO_MAINNET_CHAIN_ID } from "@/lib/contracts/constants"

interface PurchaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    name: string
    price: number
    quantity: number
    duration: string
  } | null
}

export function PurchaseModal({ open, onOpenChange, item }: PurchaseModalProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  // All hooks must be called before any conditional returns
  const chainId = useChainId()
  // Don't use useSwitchChain to avoid connector.getChainId() issues with Farcaster
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { address, isConnected } = useAccount()
  const CELO_MAINNET_CHAIN_ID = 42220
  
  // Use wagmi's useSendTransaction to ensure proper chain handling
  const { sendTransaction, isPending: isSending, data: sendHash } = useSendTransaction()

  // Use direct walletClient calls instead of useWriteContract to avoid connector.getChainId() issues
  const [depositHash, setDepositHash] = useState<`0x${string}` | null>(null)
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositError, setDepositError] = useState<Error | null>(null)

  // Update depositHash when sendHash changes
  useEffect(() => {
    if (sendHash) {
      setDepositHash(sendHash)
    }
  }, [sendHash])

  // Wait for deposit transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
    hash: depositHash || sendHash || undefined,
    query: {
      enabled: !!(depositHash || sendHash),
      retry: 3,
    },
  })

  // Calculate values (must be before useCallback hooks)
  const totalCost = item ? (item.price * item.quantity).toFixed(18) : "0" // Full precision for CELO amounts
  const amountWei = item ? parseEther(totalCost) : 0n

  const handleDeposit = useCallback(async () => {
    if (!item) return
    if (chainId !== CELO_MAINNET_CHAIN_ID) {
      // Try to switch chain using walletClient directly to avoid connector.getChainId() issues
      if (walletClient) {
        try {
          // Use walletClient's switchChain method
          await walletClient.switchChain({ id: CELO_MAINNET_CHAIN_ID })
          // Wait a bit for chain to switch before continuing
          await new Promise(resolve => setTimeout(resolve, 1000))
          return
        } catch (err: any) {
          console.error("Chain switch error:", err)
          setError("Please switch to Celo Mainnet manually in your wallet.")
          return
        }
      } else {
        setError("Please switch to Celo Mainnet manually in your wallet.")
        return
      }
    }

    setError(null)

    // Check native CELO balance
    if (address && publicClient) {
      try {
        const nativeBalance = await publicClient.getBalance({ address })

        if (nativeBalance < amountWei) {
          const nativeBalanceFormatted = (Number(nativeBalance) / 1e18).toFixed(6)
          setError(`Insufficient CELO balance. You need ${totalCost} CELO but only have ${nativeBalanceFormatted} CELO.`)
          return
        }
      } catch (err) {
        console.error('Error checking balance:', err)
        // Continue anyway, the transaction will fail if there's an issue
      }
    }

    if (!address) {
      setError("Wallet address not available. Please reconnect your wallet.")
      return
    }

    setIsDepositing(true)
    setDepositError(null)

    // Send native CELO directly to the contract using wagmi's sendTransaction
    // useSendTransaction handles walletClient internally, so we don't need to check it
    // This ensures proper chain recognition (CELO instead of ETH)
    try {
      sendTransaction({
        to: ZORRITO_YIELD_ESCROW_ADDRESS,
        value: amountWei,
      }, {
        onSuccess: (hash) => {
          setDepositHash(hash)
          setIsDepositing(false)
        },
        onError: (err) => {
          console.error("Send transaction error:", err)
          setDepositError(err as Error)
          setIsDepositing(false)
          
          const errorMessage = err?.message || err?.toString() || "Unknown error"
          const errorLower = errorMessage.toLowerCase()
          
          if (errorLower.includes('insufficient') || errorLower.includes('balance') || errorLower.includes("don't have enough funds")) {
            setError(`Insufficient CELO balance. You need ${totalCost} CELO.`)
          } else if (errorLower.includes('user rejected') || errorLower.includes('user denied')) {
            setError("Transaction was rejected. Please try again.")
          } else if (errorLower.includes('wallet') || errorLower.includes('client')) {
            setError("Wallet connection issue. Please refresh the page and try again.")
          } else {
            setError(errorMessage)
          }
        }
      })
    } catch (err: any) {
      console.error("Error calling sendTransaction:", err)
      setDepositError(err as Error)
      setIsDepositing(false)
      setError(err?.message || "Failed to initiate transaction. Please try again.")
    }
  }, [chainId, walletClient, amountWei, CELO_MAINNET_CHAIN_ID, item, address, publicClient, totalCost, sendTransaction])

  // Reset deposit state when deposit is confirmed
  useEffect(() => {
    if (isConfirmed && depositHash) {
      setIsDepositing(false)
    }
  }, [isConfirmed, depositHash])


  // No auto-deposit needed for native CELO (no approval required)

  // Debug logging
  useEffect(() => {
    if (depositHash) {
      console.log("Deposit transaction hash:", depositHash)
    }
    if (isConfirmed) {
      console.log("Deposit confirmed!")
    }
    if (receiptError) {
      console.error("Receipt error:", receiptError)
    }
  }, [depositHash, isConfirmed, receiptError])

  // Show success screen when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && depositHash) {
      setShowSuccess(true)
      setError(null)
      // Auto-close after 5 seconds (longer to allow viewing transaction)
      setTimeout(() => {
        setShowSuccess(false)
        onOpenChange(false)
      }, 5000)
    }
  }, [isConfirmed, depositHash, onOpenChange])

  // Handle deposit errors
  useEffect(() => {
    if (depositError) {
      const errorMessage = depositError.message || "Deposit failed. Please try again."
      // Check if error is about insufficient funds or approval
      if (errorMessage.toLowerCase().includes('insufficient') || errorMessage.toLowerCase().includes('balance')) {
        setError(`Insufficient CELO balance. You need ${totalCost} CELO to complete this purchase.`)
      } else {
        setError(errorMessage)
      }
    }
  }, [depositError, totalCost])


  // Handle receipt errors
  useEffect(() => {
    if (receiptError) {
      setError(receiptError.message || "Transaction confirmation failed. Please check the transaction hash.")
    }
  }, [receiptError])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setShowSuccess(false)
      setError(null)
      setIsDepositing(false)
      setDepositHash(null)
      setDepositError(null)
    }
  }, [open])

  const handleConfirmPurchase = useCallback(async () => {
    setError(null)
    
    // Check if wallet is connected
    if (!isConnected || !address) {
      setError("Wallet not connected. Please connect your wallet first.")
      return
    }

    // Always ensure we're on Celo Mainnet
    if (chainId !== CELO_MAINNET_CHAIN_ID) {
      // Try to switch chain using walletClient if available
      if (walletClient) {
        try {
          await walletClient.switchChain({ id: CELO_MAINNET_CHAIN_ID })
          // Wait a bit for chain to switch before continuing
          await new Promise(resolve => setTimeout(resolve, 1000))
          return
        } catch (err: any) {
          console.error("Chain switch error:", err)
          setError("Please switch to Celo Mainnet manually in your wallet.")
          return
        }
      } else {
        setError("Please switch to Celo Mainnet manually in your wallet.")
        return
      }
    }

    // Deposit native CELO directly
    // useSendTransaction will handle walletClient internally
    handleDeposit()
  }, [chainId, walletClient, isConnected, address, publicClient, item, handleDeposit])

  const handleClose = () => {
    // Only allow closing if transaction is not in progress
    if (!isDepositing && !isConfirming && !isConfirmed) {
      setShowSuccess(false)
      setError(null)
      onOpenChange(false)
    }
  }

  const isTransactionPending = isDepositing || isSending || isConfirming

  // Now we can do conditional returns after all hooks
  if (!item) return null

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-center mb-3 sm:mb-4">
            <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-green-500" />
          </div>
          <DialogTitle className="text-center text-xl sm:text-2xl">Purchase Successful!</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4 text-center">
            <div className="p-4 bg-black rounded-lg border border-zinc-800 space-y-2">
              <p className="text-zinc-400">Amount Spent</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold">{totalCost} CELO</span>
              </div>
            </div>

            <div className="p-4 bg-black rounded-lg border border-zinc-800 space-y-2">
              <p className="text-zinc-400">Item Purchased</p>
              <p className="text-lg font-semibold">
                {item.quantity}x {item.name}
              </p>
            </div>

            <div className="p-4 bg-green-950/20 rounded-lg border border-green-800 space-y-2">
              <p className="text-zinc-400">Effect</p>
              <p className="text-lg font-semibold text-green-400">{getEffectMessage(item)}</p>
            </div>

            <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-800 space-y-2">
              <p className="text-zinc-400">Deposit Status</p>
              <p className="text-lg font-semibold text-blue-400">
                {totalCost} CELO deposited to escrow
              </p>
              {depositHash && (
                <a
                  href={`https://celoscan.io/tx/${depositHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-300 hover:text-blue-200 underline mt-2 inline-block"
                >
                  View on CeloScan →
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Purchase Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 bg-black rounded-lg border border-zinc-800 space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs sm:text-sm">Item</span>
              <span className="font-semibold text-xs sm:text-sm text-right">{item.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs sm:text-sm">Quantity</span>
              <span className="font-semibold text-xs sm:text-sm">{item.quantity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs sm:text-sm">Description</span>
              <span className="text-xs sm:text-sm text-zinc-300 text-right">{item.duration}</span>
            </div>
            <div className="pt-2 sm:pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400 text-xs sm:text-sm">Total Cost</span>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-white">{totalCost} CELO</span>
              </div>
            </div>
          </div>


          {error && (
            <div className="p-2.5 sm:p-3 bg-red-950/20 rounded-lg border border-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-red-200 break-words">{error}</p>
              </div>
            </div>
          )}

          {isTransactionPending && (
            <div className="p-2.5 sm:p-3 bg-blue-950/20 rounded-lg border border-blue-800">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400 animate-spin flex-shrink-0" />
                <p className="text-xs sm:text-sm text-blue-200">
                  {isDepositing
                    ? "Sending CELO to escrow..."
                    : "Waiting for confirmation..."}
                </p>
              </div>
              {depositHash && (
                <div className="mt-2">
                  <p className="text-xs text-blue-300 break-all">
                    Deposit TX: {depositHash.slice(0, 10)}...{depositHash.slice(-8)}
                  </p>
                  <a
                    href={`https://celoscan.io/tx/${depositHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 underline mt-1 inline-block"
                  >
                    View on CeloScan →
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isTransactionPending}
              className="flex-1 border-zinc-700 bg-transparent text-xs sm:text-sm h-10 sm:h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              disabled={isTransactionPending}
              className="flex-1 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm h-10 sm:h-11"
            >
              {isTransactionPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Purchase"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getEffectMessage(item: { name: string; quantity: number; duration: string }) {
  if (item.name.includes("Revive Potion")) {
    return "Your fox has been revived!"
  }
  if (item.name.includes("Golden Fish")) {
    return `Boosted your winning chances by ${item.quantity}x!`
  }
  if (item.name.includes("1 Fish")) {
    return `Fed your fox for ${item.quantity} day${item.quantity > 1 ? "s" : ""}!`
  }
  if (item.name.includes("Box of 7 Fish")) {
    return `Fed your fox for ${item.quantity} week${item.quantity > 1 ? "s" : ""}!`
  }
  if (item.name.includes("Box of 15 Fish")) {
    return `Fed your fox for ${item.quantity * 2} weeks!`
  }
  return "Item successfully applied!"
}

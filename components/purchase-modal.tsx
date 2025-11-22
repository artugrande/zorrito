"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useSendTransaction, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi"
import { parseUnits } from "viem"
import { TREASURY_WALLET_ADDRESS } from "@/lib/wagmi"

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

  // All hooks must be called before any conditional returns
  const {
    data: hash,
    isPending: isSending,
    error: sendError,
    sendTransaction,
  } = useSendTransaction()

  // Only wait for receipt if we have a transaction hash
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
    hash: hash || undefined,
    query: {
      enabled: !!hash, // Only query when hash exists
      retry: 3, // Retry up to 3 times
    },
  })

  // Debug logging
  useEffect(() => {
    if (hash) {
      console.log("Transaction hash:", hash)
    }
    if (isConfirmed) {
      console.log("Transaction confirmed!")
    }
    if (receiptError) {
      console.error("Receipt error:", receiptError)
    }
  }, [hash, isConfirmed, receiptError])

  // Show success screen when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setShowSuccess(true)
      setError(null)
      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
        onOpenChange(false)
      }, 3000)
    }
  }, [isConfirmed, onOpenChange])

  // Handle send errors
  useEffect(() => {
    if (sendError) {
      setError(sendError.message || "Transaction failed. Please try again.")
    }
  }, [sendError])

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
    }
  }, [open])

  // Now we can do conditional returns after all hooks
  if (!item) return null

  const totalCost = (item.price * item.quantity).toFixed(2)
  // Use fixed 0.001 CELO for all transactions (to save faucet)
  const transactionValue = parseUnits("0.001", 18)

  const handleConfirmPurchase = async () => {
    setError(null)
    
    // Check if we're on the correct chain
    if (chainId !== CELO_SEPOLIA_CHAIN_ID) {
      try {
        await switchChain({ chainId: CELO_SEPOLIA_CHAIN_ID })
        // Wait a bit for chain switch, then retry
        setTimeout(() => {
          handleConfirmPurchase()
        }, 1000)
        return
      } catch (err) {
        setError("Please switch to Celo Sepolia network in your wallet")
        return
      }
    }

    try {
      sendTransaction({
        to: TREASURY_WALLET_ADDRESS as `0x${string}`,
        value: transactionValue,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send transaction")
    }
  }

  const handleClose = () => {
    // Only allow closing if transaction is not in progress
    if (!isSending && !isConfirming && !isConfirmed) {
      setShowSuccess(false)
      setError(null)
      onOpenChange(false)
    }
  }

  const isTransactionPending = isSending || isConfirming

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="bg-zinc-950 border-zinc-800 max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl">Purchase Successful!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <div className="p-4 bg-black rounded-lg border border-zinc-800 space-y-2">
              <p className="text-zinc-400">Amount Spent</p>
              <div className="flex items-center justify-center gap-2">
                <img src="/images/celousdcoin.png" alt="cUSD" className="w-6 h-6" />
                <span className="text-2xl font-bold">{totalCost} cUSD</span>
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
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>Review your purchase before confirming</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-black rounded-lg border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Item</span>
              <span className="font-semibold">{item.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Quantity</span>
              <span className="font-semibold">{item.quantity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Description</span>
              <span className="text-sm text-zinc-300">{item.duration}</span>
            </div>
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Total Cost</span>
              <div className="flex items-center gap-2">
                <img src="/images/celousdcoin.png" alt="cUSD" className="w-5 h-5" />
                <span className="text-xl font-bold">{totalCost} cUSD</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-yellow-950/20 rounded-lg border border-yellow-800">
            <p className="text-sm text-yellow-200">
              ⚠️ This item will be consumed immediately after purchase and cannot be refunded.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/20 rounded-lg border border-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          )}

          {isTransactionPending && (
            <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-800">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                <p className="text-sm text-blue-200">
                  {isSending ? "Sending transaction..." : "Waiting for confirmation..."}
                </p>
              </div>
              {hash && (
                <p className="text-xs text-blue-300 mt-2 break-all">
                  TX: {hash.slice(0, 10)}...{hash.slice(-8)}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isTransactionPending}
              className="flex-1 border-zinc-700 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              disabled={isTransactionPending}
              className="flex-1 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransactionPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

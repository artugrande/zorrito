"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useWaitForTransactionReceipt, useChainId, usePublicClient, useWalletClient, useAccount } from "wagmi"
import { parseEther, maxUint256 } from "viem"
import { ZORRITO_YIELD_ESCROW_ADDRESS, CELO_TOKEN_ADDRESS } from "@/lib/contracts/constants"
import { ZORRITO_YIELD_ESCROW_ABI, ERC20_ABI } from "@/lib/contracts/abis"

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
  const { address } = useAccount()
  const CELO_MAINNET_CHAIN_ID = 42220

  // Use direct walletClient calls instead of useWriteContract to avoid connector.getChainId() issues
  const [depositHash, setDepositHash] = useState<`0x${string}` | null>(null)
  const [approveHash, setApproveHash] = useState<`0x${string}` | null>(null)
  const [isDepositing, setIsDepositing] = useState(false)
  const [isApprovingTx, setIsApprovingTx] = useState(false)
  const [depositError, setDepositError] = useState<Error | null>(null)
  const [approveError, setApproveError] = useState<Error | null>(null)

  // Wait for approval transaction
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approveHash || undefined,
    query: {
      enabled: !!approveHash,
      retry: 3,
    },
  })

  // Wait for deposit transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
    hash: depositHash || undefined,
    query: {
      enabled: !!depositHash,
      retry: 3,
    },
  })

  // Calculate values (must be before useCallback hooks)
  const totalCost = item ? (item.price * item.quantity).toFixed(18) : "0" // Full precision for CELO amounts
  const amountWei = item ? parseEther(totalCost) : 0n

  // Define handleApprove first to avoid dependency issues
  const handleApprove = useCallback(async () => {
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
    setIsApproving(true)
    setIsApprovingTx(true)
    setApproveError(null)

    if (!walletClient) {
      setError("Wallet not connected")
      setIsApproving(false)
      setIsApprovingTx(false)
      return
    }

    try {
      const hash = await walletClient.writeContract({
        address: CELO_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ZORRITO_YIELD_ESCROW_ADDRESS, maxUint256],
        chain: { id: CELO_MAINNET_CHAIN_ID },
      })
      setApproveHash(hash)
    } catch (err: any) {
      console.error("Approval error:", err)
      setApproveError(err)
      setError(err?.message || "Failed to approve CELO token")
      setIsApproving(false)
      setIsApprovingTx(false)
    }
  }, [chainId, walletClient, CELO_MAINNET_CHAIN_ID])

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

    // Check balance and allowance before depositing
    if (address && publicClient) {
      try {
        // Check CELO token (ERC20) balance - this is what the contract needs
        const tokenBalance = await publicClient.readContract({
          address: CELO_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address],
        }) as bigint

        // Also check native CELO balance for better error messages
        const nativeBalance = await publicClient.getBalance({ address })

        if (tokenBalance < amountWei) {
          const tokenBalanceFormatted = (Number(tokenBalance) / 1e18).toFixed(6)
          const nativeBalanceFormatted = (Number(nativeBalance) / 1e18).toFixed(6)
          
          if (nativeBalance >= amountWei) {
            // User has native CELO but not token CELO - needs to convert
            setError(`You have ${nativeBalanceFormatted} CELO native, but the contract needs CELO token (ERC20). You need to convert your native CELO to CELO token first. You can do this by swapping on a DEX or using the Celo wallet.`)
          } else {
            setError(`Insufficient CELO token balance. You need ${totalCost} CELO token but only have ${tokenBalanceFormatted} CELO token.`)
          }
          return
        }

        // Check allowance
        const allowance = await publicClient.readContract({
          address: CELO_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, ZORRITO_YIELD_ESCROW_ADDRESS],
        }) as bigint

        if (allowance < amountWei) {
          setError("You need to approve CELO token spending first. The approval will be requested automatically.")
          setNeedsApproval(true)
          handleApprove()
          return
        }
      } catch (err) {
        console.error('Error checking balance/allowance:', err)
        // Continue anyway, the transaction will fail if there's an issue
      }
    }

    if (!walletClient) {
      setError("Wallet not connected")
      return
    }

    setIsDepositing(true)
    setDepositError(null)

    try {
      const hash = await walletClient.writeContract({
        address: ZORRITO_YIELD_ESCROW_ADDRESS,
        abi: ZORRITO_YIELD_ESCROW_ABI,
        functionName: 'deposit',
        args: [amountWei],
        chain: { id: CELO_MAINNET_CHAIN_ID },
      })
      setDepositHash(hash)
    } catch (err: any) {
      console.error("Deposit error:", err)
      setDepositError(err)
      setIsDepositing(false)
      // Check if error is about insufficient funds or approval
      if (err?.message?.toLowerCase().includes('insufficient') || err?.message?.toLowerCase().includes('balance')) {
        setError(`Insufficient CELO balance. You need ${totalCost} CELO.`)
      } else if (err?.message?.toLowerCase().includes('allowance') || err?.message?.toLowerCase().includes('approve')) {
        setError("You need to approve CELO token spending first. Please try again.")
        setNeedsApproval(true)
      } else {
        setError(err?.message || "Failed to deposit CELO. Please try again.")
      }
    }
  }, [chainId, walletClient, amountWei, CELO_MAINNET_CHAIN_ID, item, address, publicClient, totalCost, handleApprove])

  // Check allowance when component mounts or address changes
  useEffect(() => {
    const checkAllowance = async () => {
      if (!address || !publicClient || !item) return

      try {
        const allowance = await publicClient.readContract({
          address: CELO_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, ZORRITO_YIELD_ESCROW_ADDRESS],
        }) as bigint

        const amountWei = parseEther((item.price * item.quantity).toFixed(18))
        setNeedsApproval(allowance < amountWei)
      } catch (err) {
        console.error('Error checking allowance:', err)
      }
    }

    if (chainId === CELO_MAINNET_CHAIN_ID) {
      checkAllowance()
    }
  }, [address, publicClient, item, chainId])

  // Reset deposit state when deposit is confirmed
  useEffect(() => {
    if (isConfirmed && depositHash) {
      setIsDepositing(false)
    }
  }, [isConfirmed, depositHash])

  // Reset approval state when approval is confirmed
  useEffect(() => {
    if (isApprovalConfirmed && approveHash) {
      setIsApproving(false)
      setIsApprovingTx(false)
    }
  }, [isApprovalConfirmed, approveHash])

  // Auto-deposit after approval is confirmed
  useEffect(() => {
    if (isApprovalConfirmed && needsApproval && item && !isDepositing && !depositHash && chainId === CELO_MAINNET_CHAIN_ID) {
      console.log("Approval confirmed, depositing to escrow...")
      handleDeposit()
      setNeedsApproval(false) // Reset approval flag
    }
  }, [isApprovalConfirmed, needsApproval, item, isDepositing, depositHash, chainId, handleDeposit])

  // Debug logging
  useEffect(() => {
    if (depositHash) {
      console.log("Deposit transaction hash:", depositHash)
    }
    if (approveHash) {
      console.log("Approval transaction hash:", approveHash)
    }
    if (isConfirmed) {
      console.log("Deposit confirmed!")
    }
    if (receiptError) {
      console.error("Receipt error:", receiptError)
    }
  }, [depositHash, approveHash, isConfirmed, receiptError])

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
      } else if (errorMessage.toLowerCase().includes('allowance') || errorMessage.toLowerCase().includes('approve')) {
        setError("You need to approve CELO token spending first. The approval transaction will be sent automatically.")
        setNeedsApproval(true)
      } else {
        setError(errorMessage)
      }
    }
  }, [depositError, totalCost])

  // Handle approval errors
  useEffect(() => {
    if (approveError) {
      setError(approveError.message || "Approval failed. Please try again.")
      setIsApproving(false)
      setIsApprovingTx(false)
    }
  }, [approveError])

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
      setNeedsApproval(false)
      setIsApproving(false)
      setIsApprovingTx(false)
      setIsDepositing(false)
      setApproveHash(null)
      setDepositHash(null)
      setDepositError(null)
      setApproveError(null)
    }
  }, [open])

  const handleConfirmPurchase = useCallback(async () => {
    setError(null)
    
    // Always ensure we're on Celo Mainnet
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

    // Always check allowance before proceeding
    if (address && publicClient && item) {
      try {
        const allowance = await publicClient.readContract({
          address: CELO_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, ZORRITO_YIELD_ESCROW_ADDRESS],
        }) as bigint

        const amountWei = parseEther((item.price * item.quantity).toFixed(18))
        
        // If approval is needed, approve first
        if (allowance < amountWei) {
          console.log("Approval needed, initiating approval...")
          setNeedsApproval(true)
          handleApprove()
          return
        }
      } catch (err) {
        console.error('Error checking allowance:', err)
        // Continue anyway, will fail if approval is needed
      }
    }

    // Otherwise, deposit directly
    handleDeposit()
  }, [chainId, walletClient, address, publicClient, item, handleApprove, handleDeposit])

  const handleClose = () => {
    // Only allow closing if transaction is not in progress
    if (!isDepositing && !isConfirming && !isApproving && !isApprovalConfirming && !isConfirmed) {
      setShowSuccess(false)
      setError(null)
      onOpenChange(false)
    }
  }

  const isTransactionPending = isDepositing || isConfirming || isApproving || isApprovalConfirming

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
          <DialogTitle className="text-lg sm:text-xl">Confirm Purchase</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Review your purchase before confirming</DialogDescription>
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

          <div className="p-2.5 sm:p-3 bg-green-950/20 rounded-lg border border-green-800">
            <p className="text-xs sm:text-sm text-green-200 leading-relaxed">
              ✅ <strong>This purchase will deposit {totalCost} CELO to the escrow</strong> - your money will generate yield and you can withdraw it anytime.
            </p>
          </div>

          <div className="p-2.5 sm:p-3 bg-yellow-950/20 rounded-lg border border-yellow-800">
            <p className="text-xs sm:text-sm text-yellow-200 leading-relaxed">
              ⚠️ This item will be consumed immediately after purchase and cannot be refunded.
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-blue-950/20 rounded-lg border border-blue-800 space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-blue-200 mb-2">📋 Transaction Preview</p>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 bg-black/30 p-2 rounded">
                <span className="text-blue-300 text-xs">You will spend:</span>
                <span className="font-bold text-white text-base sm:text-lg">{totalCost} CELO</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 bg-black/30 p-2 rounded">
                <span className="text-blue-300 text-xs">Contract:</span>
                <span className="font-mono text-blue-200 text-[10px] sm:text-xs break-all sm:break-normal">{ZORRITO_YIELD_ESCROW_ADDRESS}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 bg-black/30 p-2 rounded">
                <span className="text-blue-300 text-xs">Function:</span>
                <span className="text-blue-200 text-xs sm:text-sm break-all sm:break-normal">deposit({totalCost} CELO)</span>
              </div>
            </div>
            <div className="mt-2 sm:mt-3 p-2 bg-yellow-900/20 border border-yellow-700 rounded">
              <p className="text-[10px] sm:text-xs text-yellow-200 leading-relaxed">
                ⚠️ <strong>Important:</strong> The wallet will show the escrow contract address ({ZORRITO_YIELD_ESCROW_ADDRESS.slice(0, 8)}...{ZORRITO_YIELD_ESCROW_ADDRESS.slice(-6)}). 
                The amount {totalCost} CELO is in the function parameters. This is safe - you're depositing to the escrow to generate yield.
              </p>
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

          {needsApproval && !isApprovalConfirmed && (
            <div className="p-2.5 sm:p-3 bg-yellow-950/20 rounded-lg border border-yellow-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-yellow-200">
                  You need to approve CELO token spending first.
                </p>
              </div>
            </div>
          )}

          {isTransactionPending && (
            <div className="p-2.5 sm:p-3 bg-blue-950/20 rounded-lg border border-blue-800">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400 animate-spin flex-shrink-0" />
                <p className="text-xs sm:text-sm text-blue-200">
                  {isApproving || isApprovalConfirming
                    ? "Approving CELO token..."
                    : isDepositing
                    ? "Depositing to escrow..."
                    : "Waiting for confirmation..."}
                </p>
              </div>
              {approveHash && (
                <p className="text-xs text-blue-300 mt-2 break-all">
                  Approval TX: {approveHash.slice(0, 10)}...{approveHash.slice(-8)}
                </p>
              )}
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

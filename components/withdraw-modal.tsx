"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface WithdrawModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WithdrawModal({ open, onOpenChange }: WithdrawModalProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleWithdraw = async () => {
    setIsProcessing(true)
    // Simulate withdrawal process
    setTimeout(() => {
      setIsProcessing(false)
      setShowSuccess(true)
    }, 2000)
  }

  const handleReturnToStart = () => {
    // In production, this would reset the app state
    window.location.reload()
  }

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-zinc-950 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Withdrawal Successful</DialogTitle>
          </DialogHeader>
          <p className="text-center text-zinc-400 py-4">Withdrawal completed successfully.</p>
          <DialogFooter>
            <Button onClick={handleReturnToStart} className="w-full bg-white text-black hover:bg-zinc-200">
              Return to Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <DialogTitle className="text-2xl text-red-500">Withdrawal Warning</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 text-base pt-4">
            To withdraw your funds you must burn your NFT. If you burn it, your fox will be lost forever and you will no
            longer participate in upcoming draws.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-white text-black hover:bg-gray-300 border-0"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button onClick={handleWithdraw} variant="destructive" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Yes, withdraw and burn my NFT"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

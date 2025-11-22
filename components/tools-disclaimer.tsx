"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronRight, Loader2, Wallet, MessageCircle, AlertCircle } from "lucide-react"
import { useConnect, useAccount } from "wagmi"
import { useFarcaster } from "@/hooks/use-farcaster"

type ConnectionType = "wallet" | "farcaster"

interface ToolsDisclaimerProps {
  onContinue: (address: string, connectionType: ConnectionType) => void
  connectionType: ConnectionType
}

const tools = [
  {
    name: "Self",
    icon: "/images/self.png",
    description:
      "Verifies the country of our users without exposing private information and ensures access is limited to users aged 13 or older. Although our platform aims to reduce gambling and promote saving habits, we recommend that minors participate only with parental consent.",
  },
  {
    name: "Google Gemini 2.5 Flash Image",
    icon: "/images/gemini.png",
    description: "Generates unique, personalized characters.",
  },
  {
    name: "Celo",
    icon: "/images/celo.png",
    description: "Enables daily transactions with the lowest network costs possible.",
  },
  {
    name: "Filecoin",
    icon: "/images/filecoin.png",
    description: "Stores images in a decentralized way.",
  },
  {
    name: "Aave",
    icon: "/images/aave.png",
    description:
      "Invests your capital in DeFi to generate yield, which funds a no-loss lottery every month. Your deposit always stays safe, and only the yield is used to distribute prizes among participants.",
  },
]

export function ToolsDisclaimer({ onContinue, connectionType }: ToolsDisclaimerProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { connect, connectors, isPending: isWalletPending } = useConnect()
  const { address, isConnected } = useAccount()
  const { isAuthenticated, user, signIn, signOut, fid } = useFarcaster()

  // Handle wallet connection
  useEffect(() => {
    if (connectionType === "wallet" && isConnecting && isConnected && address) {
      setIsConnecting(false)
      setConnectionError(null)
      onContinue(address, "wallet")
    }
  }, [connectionType, isConnecting, isConnected, address, onContinue])

  // Handle Farcaster connection
  useEffect(() => {
    if (connectionType === "farcaster" && isConnecting && isAuthenticated && fid) {
      setIsConnecting(false)
      setConnectionError(null)
      // Use FID as identifier for Farcaster users
      const farcasterAddress = `farcaster:${fid}`
      onContinue(farcasterAddress, "farcaster")
    }
  }, [connectionType, isConnecting, isAuthenticated, fid, onContinue])

  const handleContinue = async () => {
    if (!acknowledged) return
    if (isConnecting) return // Prevent double clicks

    setIsConnecting(true)
    setConnectionError(null)

    if (connectionType === "wallet") {
      // Wallet connection logic
      const hasWallet = typeof window !== "undefined" && (window.ethereum || (window as any).web3)
      
      if (!hasWallet) {
        setConnectionError("No wallet found. Please install MetaMask or another Web3 wallet.")
        setIsConnecting(false)
        return
      }

      const injectedConnector = connectors.find((c) => c.id === "injected" || c.id === "metaMask")
      
      if (!injectedConnector) {
        setConnectionError("Wallet connector not found. Please refresh the page.")
        setIsConnecting(false)
        return
      }

      let timeoutId: NodeJS.Timeout | null = null
      
      try {
        timeoutId = setTimeout(() => {
          if (!isConnected) {
            setConnectionError("Connection timeout. Please try again.")
            setIsConnecting(false)
          }
        }, 30000)

        await connect({ connector: injectedConnector })
        
        if (timeoutId) clearTimeout(timeoutId)
        // The useEffect will handle calling onContinue when connected
      } catch (error: any) {
        console.error("Failed to connect wallet:", error)
        if (timeoutId) clearTimeout(timeoutId)
        setConnectionError(error?.message || "Failed to connect wallet. Please try again.")
        setIsConnecting(false)
      }
    } else if (connectionType === "farcaster") {
      // Farcaster connection logic
      try {
        if (!isAuthenticated) {
          // signIn() from useSignIn doesn't return a promise, it triggers the flow
          // The useEffect will handle calling onContinue when authenticated
          signIn()
        } else {
          // Already authenticated, continue immediately
          const farcasterAddress = `farcaster:${fid}`
          setIsConnecting(false)
          onContinue(farcasterAddress, "farcaster")
        }
      } catch (error: any) {
        console.error("Failed to sign in with Farcaster:", error)
        setConnectionError(error?.message || "Failed to sign in with Farcaster. Please try again.")
        setIsConnecting(false)
      }
    }
  }

  const isPending = connectionType === "wallet" ? isWalletPending : false

  return (
    <div className="min-h-screen flex items-center justify-center p-4 page-background">
      <Card className="w-full max-w-2xl p-8 bg-white/95 backdrop-blur-sm border-[#E8913F] border-2 shadow-2xl">
        <div className="space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Before connecting your wallet</h1>
            <p className="text-gray-700">We use several tools to keep the experience safe, fun, and responsible.</p>
          </div>

          {/* Tools List */}
          <div className="space-y-4">
            {tools.map((tool) => (
              <div key={tool.name} className="flex gap-4 p-4 rounded-lg bg-white border border-[#E8913F] shadow-sm">
                <div className="flex-shrink-0">
                  <img src={tool.icon || "/placeholder.svg"} alt={tool.name} className="w-12 h-12 rounded-lg" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                  <p className="text-sm text-gray-700">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-lg bg-[#FFF4E9] border border-[#E8913F]">
            <p className="text-sm text-gray-800">
              By continuing, you acknowledge that you understand the risks associated with DeFi.
            </p>
          </div>

          {/* More Information Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="risks" className="border-[#E8913F]">
              <AccordionTrigger className="text-gray-800 hover:text-gray-900">More information</AccordionTrigger>
              <AccordionContent className="text-sm text-gray-700 space-y-4">
                <div className="space-y-2">
                  <p className="font-semibold text-gray-800">Main risks include:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Smart contract vulnerabilities or protocol bugs.</li>
                    <li>Impermanent loss or fluctuations in yield performance.</li>
                    <li>Liquidity risks if a protocol becomes insolvent or behaves unexpectedly.</li>
                    <li>Volatility of underlying assets used in yield strategies.</li>
                    <li>Potential loss of funds due to user error or incorrect wallet interactions.</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acknowledge"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[#E8913F] bg-white text-[#F28C33] focus:ring-2 focus:ring-[#F28C33]"
            />
            <label htmlFor="acknowledge" className="text-sm text-gray-700 cursor-pointer">
              I understand and acknowledge the risks associated with using DeFi protocols and decentralized
              technologies.
            </label>
          </div>

          {/* Connection Type Indicator */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2">
              {connectionType === "wallet" ? (
                <>
                  <Wallet className="h-4 w-4 text-gray-600" />
                  <p className="text-sm text-gray-700">Connecting with MetaMask</p>
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 text-[#8A63D2]" />
                  <p className="text-sm text-gray-700">Signing in with Farcaster</p>
                </>
              )}
            </div>
          </div>

          {/* Connection Error */}
          {connectionError && (
            <div className="p-3 bg-red-950/20 rounded-lg border border-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-sm text-red-200">{connectionError}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isConnecting && (
            <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-800">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-blue-200">
                    {connectionType === "wallet" ? "Connecting Wallet..." : "Signing in with Farcaster..."}
                  </p>
                  <p className="text-xs text-blue-300 mt-1">
                    {connectionType === "wallet"
                      ? "Please approve the connection in your wallet (MetaMask, etc.)"
                      : "Please approve the sign-in request in your Farcaster app"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!acknowledged || isConnecting || isPending}
            className={`w-full h-12 text-lg font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
              connectionType === "wallet" ? "bg-[#000000] hover:bg-[#222222]" : "bg-[#8A63D2] hover:bg-[#7A53C2]"
            }`}
          >
            {isConnecting || isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {connectionType === "wallet" ? "Connecting..." : "Signing in..."}
              </>
            ) : (
              <>
                {connectionType === "wallet" ? (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet & Continue
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Sign in with Farcaster & Continue
                  </>
                )}
              </>
            )}
            {!isConnecting && !isPending && <ChevronRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>
      </Card>
    </div>
  )
}

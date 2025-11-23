"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { FarcasterReady } from "@/components/farcaster-ready"

// Lazy load components to avoid initialization order issues
const ConnectWallet = dynamic(() => import("@/components/connect-wallet").then(mod => ({ default: mod.ConnectWallet })), { ssr: false })
const ToolsDisclaimer = dynamic(() => import("@/components/tools-disclaimer").then(mod => ({ default: mod.ToolsDisclaimer })), { ssr: false })
const CreateFox = dynamic(() => import("@/components/create-fox").then(mod => ({ default: mod.CreateFox })), { ssr: false })
const FoxHome = dynamic(() => import("@/components/fox-home").then(mod => ({ default: mod.FoxHome })), { ssr: false })

type Screen = "connect" | "disclaimer" | "create" | "home"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("connect")
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [foxData, setFoxData] = useState<any>(null)

  const handleWalletConnected = (address: string) => {
    // Just advance to disclaimer, wallet will be connected there
    setCurrentScreen("disclaimer")
  }

  const handleDisclaimerAcknowledged = (address: string) => {
    setWalletAddress(address)
    setCurrentScreen("create")
  }

  const handleFoxCreated = (data: any) => {
    setFoxData(data)
    setCurrentScreen("home")
  }

  const handleLogout = () => {
    setWalletAddress("")
    setFoxData(null)
    setCurrentScreen("connect")
  }

  const handleBackToHome = () => {
    if (foxData) {
      setCurrentScreen("home")
    } else {
      setCurrentScreen("disclaimer")
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <FarcasterReady />
      {currentScreen === "connect" && <ConnectWallet onConnect={handleWalletConnected} />}
      {currentScreen === "disclaimer" && <ToolsDisclaimer onContinue={handleDisclaimerAcknowledged} />}
      {currentScreen === "create" && (
        <CreateFox walletAddress={walletAddress} onFoxCreated={handleFoxCreated} onBack={handleBackToHome} />
      )}
      {currentScreen === "home" && <FoxHome walletAddress={walletAddress} foxData={foxData} onLogout={handleLogout} />}
    </main>
  )
}

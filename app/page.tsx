"use client"

import { useState } from "react"
import { ConnectWallet } from "@/components/connect-wallet"
import { ToolsDisclaimer } from "@/components/tools-disclaimer"
import { CreateFox } from "@/components/create-fox"
import { FoxHome } from "@/components/fox-home"

type Screen = "connect" | "disclaimer" | "create" | "home"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("connect")
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [foxData, setFoxData] = useState<any>(null)

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address)
    setCurrentScreen("disclaimer")
  }

  const handleDisclaimerAcknowledged = () => {
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
      {currentScreen === "connect" && <ConnectWallet onConnect={handleWalletConnected} />}
      {currentScreen === "disclaimer" && <ToolsDisclaimer onContinue={handleDisclaimerAcknowledged} />}
      {currentScreen === "create" && (
        <CreateFox walletAddress={walletAddress} onFoxCreated={handleFoxCreated} onBack={handleBackToHome} />
      )}
      {currentScreen === "home" && <FoxHome walletAddress={walletAddress} foxData={foxData} onLogout={handleLogout} />}
    </main>
  )
}

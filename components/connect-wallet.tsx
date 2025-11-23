"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Wallet } from "lucide-react"

interface ConnectWalletProps {
  onConnect: (address: string) => void
}

export function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("[v0] Video autoplay blocked:", error)
      })
    }
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)

    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("[v0] Video play failed:", error)
      })
    }

    setTimeout(() => {
      const mockAddress = "0x" + Math.random().toString(16).substring(2, 42)
      onConnect(mockAddress)
      setIsConnecting(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between pt-[20vh] pb-8 p-4 relative overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/artugrande_httpss.mj.runc7sFuz5Uuaw_Animate_a_charming_2D_sce_e792a51a-942c-4b48-81f5-b3d55eba3919_3-BNSZbZHwbno5QQvqAJDOeSrhl3atYk.mp4" type="video/mp4" />
      </video>

      <Card className="relative z-10 w-full max-w-md p-8 bg-white/95 backdrop-blur-sm border-[#E8913F] border-2 shadow-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <img src="/images/logozorrito.png" alt="Zorrito Finance" className="w-full max-w-sm mx-[] mb-[-25px] mt-[-25px]" />

            <div className="space-y-2">
              <p className="text-2xl font-bold text-[#F28C33]">Play. Save. Earn. Help.</p>
              <p className="text-sm text-gray-700">The first no-loss lottery inspired by Patagonia. 🏔️</p>
            </div>
          </div>

          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full h-14 text-lg font-semibold bg-[#000000] text-white hover:bg-[#222222]"
          >
            <Wallet className="mr-2 h-5 w-5" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      </Card>

      <div className="relative z-10 flex items-center gap-2 text-white text-sm bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
        <span>An idea born in the mountains of Edge City Patagonia</span>
        <img src="/images/edgelogo.svg" alt="Edge City" className="h-6" />
      </div>
    </div>
  )
}

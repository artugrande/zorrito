"use client"

import React, { useState, useEffect } from "react"
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  getUniversalLink,
} from "@selfxyz/qrcode"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface AgeVerificationProps {
  walletAddress: string
  onVerified: () => void
  onBack: () => void
}

export function AgeVerification({ walletAddress, onVerified, onBack }: AgeVerificationProps) {
  const [linkCopied, setLinkCopied] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null)
  const [universalLink, setUniversalLink] = useState("")
  const [userId] = useState(walletAddress || ethers.ZeroAddress)

  // Use useEffect to ensure code only executes on the client side
  useEffect(() => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Zorrito Finance",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE_SEED || "zorrito-finance",
        endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || "",
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: userId,
        endpointType: process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE as "celo" | "staging_celo" | "https" | "staging_https" || "celo",
        userIdType: "hex",
        userDefinedData: "Gracias por usar zorrito.finance 🦊",

        disclosures: {
          // Verificar que el usuario tenga al menos 13 años
          minimumAge: 13,
          nationality: true,
        },
      }).build()

      setSelfApp(app)
      setUniversalLink(getUniversalLink(app))
    } catch (error) {
      console.error("Failed to initialize Self app:", error)
      displayToast("Error al inicializar la verificación. Por favor, recarga la página.")
    }
  }, [userId])

  const displayToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const copyToClipboard = () => {
    if (!universalLink) return

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true)
        displayToast("Enlace copiado al portapapeles!")
        setTimeout(() => setLinkCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
        displayToast("Error al copiar el enlace")
      })
  }

  const openSelfApp = () => {
    if (!universalLink) return

    window.open(universalLink, "_blank")
    displayToast("Abriendo Self App...")
  }

  const handleSuccessfulVerification = () => {
    displayToast("¡Verificación exitosa! Redirigiendo...")
    setTimeout(() => {
      onVerified()
    }, 1500)
  }

  return (
    <div className="min-h-screen w-full bg-[#87CEEB] bg-[url('/images/backgroundzorrito.png')] bg-fixed bg-cover bg-center flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-white/95 backdrop-blur-sm border-[#E8913F] border-2 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
            Verificación de Edad
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Escanea el código QR con la app Self Protocol para verificar que eres mayor de 13 años
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          {selfApp ? (
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleSuccessfulVerification}
              onError={() => {
                displayToast("Error: No se pudo verificar la identidad")
              }}
            />
          ) : (
            <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
              <p className="text-gray-500 text-sm">Cargando código QR...</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Button
            type="button"
            onClick={copyToClipboard}
            disabled={!universalLink}
            variant="outline"
            className="flex-1 border-[#E8913F] bg-white hover:bg-[#FFF4E9] text-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {linkCopied ? "¡Copiado!" : "Copiar Enlace"}
          </Button>

          <Button
            type="button"
            onClick={openSelfApp}
            disabled={!universalLink}
            className="flex-1 bg-[#000000] hover:bg-[#222222] text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Abrir Self App
          </Button>
        </div>

        {/* User Address */}
        <div className="flex flex-col items-center gap-2 mt-4 mb-4">
          <span className="text-gray-500 text-xs uppercase tracking-wide">Dirección de Wallet</span>
          <div className="bg-gray-100 rounded-md px-3 py-2 w-full text-center break-all text-sm font-mono text-gray-800 border border-gray-200">
            {walletAddress ? walletAddress : <span className="text-gray-400">No conectado</span>}
          </div>
        </div>

        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full border-[#E8913F] bg-white hover:bg-[#FFF4E9] text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        {/* Toast notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm z-50">
            {toastMessage}
          </div>
        )}
      </Card>
    </div>
  )
}


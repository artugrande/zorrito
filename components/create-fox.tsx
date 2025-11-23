"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Wallet, ArrowLeft } from "lucide-react"
import { Footer } from "@/components/footer"
import { Textarea } from "@/components/ui/textarea"

interface CreateFoxProps {
  walletAddress: string
  onFoxCreated: (data: any) => void
  onBack: () => void
}

const sanitizeCustomization = (text: string): { isValid: boolean; message?: string } => {
  const bannedPatterns = [
    /sex|nude|naked|porn|xxx/i,
    /violence|weapon|gun|knife|blood|kill/i,
    /swastika|nazi|kkk|hate/i,
    /drug|cocaine|heroin|meth/i,
    /racist|discriminat|slur/i,
    /terror|bomb|explosive/i,
  ]

  for (const pattern of bannedPatterns) {
    if (pattern.test(text)) {
      return {
        isValid: false,
        message: "Please use friendly and safe descriptions. Avoid inappropriate content.",
      }
    }
  }

  return { isValid: true }
}

export function CreateFox({ walletAddress, onFoxCreated, onBack }: CreateFoxProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [nameError, setNameError] = useState("")
  const [customizationError, setCustomizationError] = useState("")

  const [formData, setFormData] = useState({
    etapa: "Young",
    colorPelaje: "Red",
    tipoPelaje: "Short & tidy",
    expresion: "Curious",
    entorno: "Dry steppe",
    nombre: "",
    customization: "",
  })

  const handleGenerate = async () => {
    if (!formData.nombre.trim()) {
      setNameError("Please enter a name for your fox")
      return
    }
    setNameError("")

    if (formData.customization.trim()) {
      const validation = sanitizeCustomization(formData.customization)
      if (!validation.isValid) {
        setCustomizationError(validation.message || "")
        return
      }
    }
    setCustomizationError("")

    console.log("[v0] Starting fox generation...")
    setIsGenerating(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 2
      })
    }, 100)

    try {
      console.log("[v0] Calling API with data:", formData)
      const response = await fetch("/api/generate-foxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] API error:", errorData)
        throw new Error(errorData.details || "Failed to generate fox")
      }

      const data = await response.json()
      console.log("[v0] Fox generated successfully, image length:", data.image?.length || 0)
      setGeneratedImage(data.image)
      setProgress(100)
    } catch (error) {
      console.error("[v0] Error generating fox:", error)
      alert(`Error: ${error instanceof Error ? error.message : "Failed to generate fox"}`)
      setProgress(0)
    } finally {
      clearInterval(interval)
      setIsGenerating(false)
    }
  }

  const handleMint = async () => {
    setIsMinting(true)

    setTimeout(() => {
      setIsMinting(false)
      setShowSuccessModal(true)
    }, 2000)
  }

  const handleContinue = () => {
    onFoxCreated({
      ...formData,
      image: generatedImage,
    })
  }

  if (showSuccessModal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#87CEEB] bg-[url('/images/backgroundzorrito.png')] bg-fixed bg-cover bg-center">
        <Card className="w-full max-w-md p-8 bg-white border-zorrito-cream shadow-lg">
          <div className="text-center space-y-6">
            {generatedImage && (
              <img src={generatedImage || "/placeholder.svg"} alt="Generated Fox" className="w-full rounded-lg" />
            )}
            <h2 className="text-2xl font-bold text-zorrito-brown">Your fox NFT has been minted successfully!</h2>
            <Button onClick={handleContinue} className="w-full h-12 bg-black hover:bg-black/90 text-white">
              Continue
            </Button>
          </div>
        </Card>
        <div className="mt-8">
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#87CEEB] bg-[url('/images/backgroundzorrito.png')] bg-fixed bg-cover bg-center">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-8 gap-4">
          <Button onClick={onBack} className="bg-black hover:bg-black/90 text-white px-4 py-2 h-10">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back Home
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-zorrito-brown">Customize Your Fox 🦊</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 bg-[#D8731F] border-[#FFAA5A] shadow-lg">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-white font-semibold">
                  Fox Name *
                </Label>
                <Input
                  id="nombre"
                  placeholder="Name your fox"
                  value={formData.nombre}
                  onChange={(e) => {
                    setFormData({ ...formData, nombre: e.target.value })
                    if (nameError) setNameError("")
                  }}
                  className="w-full bg-white border-[#FFAA5A] text-zorrito-brown placeholder:text-zorrito-brown/40"
                  required
                />
                {nameError && <p className="text-red-200 text-sm font-semibold">{nameError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="etapa" className="text-white font-semibold">
                  Stage / Age
                </Label>
                <Select value={formData.etapa} onValueChange={(value) => setFormData({ ...formData, etapa: value })}>
                  <SelectTrigger id="etapa" className="w-full bg-white border-[#FFAA5A] text-zorrito-brown">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Puppy">Puppy</SelectItem>
                    <SelectItem value="Young">Young</SelectItem>
                    <SelectItem value="Adult">Adult</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorPelaje" className="text-white font-semibold">
                  Fur Color
                </Label>
                <Select
                  value={formData.colorPelaje}
                  onValueChange={(value) => setFormData({ ...formData, colorPelaje: value })}
                >
                  <SelectTrigger id="colorPelaje" className="w-full bg-white border-[#FFAA5A] text-zorrito-brown">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Black">Black</SelectItem>
                    <SelectItem value="Gray">Gray</SelectItem>
                    <SelectItem value="Brown">Brown</SelectItem>
                    <SelectItem value="Red">Red</SelectItem>
                    <SelectItem value="Pink">Pink</SelectItem>
                    <SelectItem value="White">White</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Light Blue">Light Blue</SelectItem>
                    <SelectItem value="Golden">Golden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoPelaje" className="text-white font-semibold">
                  Fur Type
                </Label>
                <Select
                  value={formData.tipoPelaje}
                  onValueChange={(value) => setFormData({ ...formData, tipoPelaje: value })}
                >
                  <SelectTrigger id="tipoPelaje" className="w-full bg-white border-[#FFAA5A] text-zorrito-brown">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Short & tidy">Short & tidy</SelectItem>
                    <SelectItem value="Long & messy">Long & messy</SelectItem>
                    <SelectItem value="Soft & fluffy">Soft & fluffy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expresion" className="text-white font-semibold">
                  Expression / Personality
                </Label>
                <Select
                  value={formData.expresion}
                  onValueChange={(value) => setFormData({ ...formData, expresion: value })}
                >
                  <SelectTrigger id="expresion" className="w-full bg-white border-[#FFAA5A] text-zorrito-brown">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Curious">Curious</SelectItem>
                    <SelectItem value="Alert">Alert</SelectItem>
                    <SelectItem value="Playful">Playful</SelectItem>
                    <SelectItem value="Wise">Wise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entorno" className="text-white font-semibold">
                  Patagonian Environment
                </Label>
                <Select
                  value={formData.entorno}
                  onValueChange={(value) => setFormData({ ...formData, entorno: value })}
                >
                  <SelectTrigger id="entorno" className="w-full bg-white border-[#FFAA5A] text-zorrito-brown">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Dry steppe">Dry steppe</SelectItem>
                    <SelectItem value="Andean forest">Andean forest</SelectItem>
                    <SelectItem value="Snowy mountains">Snowy mountains</SelectItem>
                    <SelectItem value="Windy coastline">Windy coastline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customization" className="text-white font-semibold">
                  Customize your fox (optional)
                </Label>
                <Textarea
                  id="customization"
                  placeholder="Clothes, hat, accessories… e.g. 'explorer hat', 'scarf', 'backpack'. Keep it friendly and respectful."
                  value={formData.customization}
                  onChange={(e) => {
                    setFormData({ ...formData, customization: e.target.value })
                    if (customizationError) setCustomizationError("")
                  }}
                  rows={3}
                  className="w-full bg-white border-[#FFAA5A] text-zorrito-brown placeholder:text-zorrito-brown/40 resize-none"
                />
                {customizationError && <p className="text-red-200 text-sm font-semibold">{customizationError}</p>}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-12 bg-black hover:bg-black/90 text-white relative overflow-hidden"
              >
                {isGenerating && (
                  <div
                    className="absolute inset-0 bg-zorrito-orange transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Fox"
                  )}
                </span>
              </Button>
            </div>
          </Card>

          <div className="flex flex-col items-center justify-center">
            {generatedImage ? (
              <div className="w-full space-y-4">
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt="Generated Fox"
                  className="w-full rounded-xl border-2 border-zorrito-cream shadow-lg"
                />
                <Button
                  onClick={handleMint}
                  disabled={isMinting}
                  className="w-full h-12 bg-black hover:bg-black/90 text-white"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-5 w-5" />
                      Mint NFT
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Card className="w-full aspect-square flex items-center justify-center bg-black border-zorrito-cream shadow-lg">
                <p className="text-white text-center px-8">Generate your fox to see the preview</p>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

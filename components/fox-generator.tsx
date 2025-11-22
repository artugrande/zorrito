"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2, Wallet } from "lucide-react"

const etapaOptions = ["Cachorro", "Adulto", "Zorro viejo"]

const colorPelajeOptions = [
  "Rojo clásico",
  "Rojo oscuro",
  "Marrón patagónico",
  "Gris plateado",
  "Gris oscuro",
  "Blanco ártico",
  "Beige claro",
  "Negro",
  "Dorado rojizo",
]

const tipoPelajeOptions = ["Corto y prolijo", "Medio y esponjoso", "Largo y salvaje"]

const expresionOptions = ["Curioso y atento", "Tranquilo y relajado", "Valiente / protector"]

const entornoOptions = [
  "Estepa patagónica seca",
  "Bosque valdiviano / bosque andino",
  "Cordillera nevada / montañas frías",
  "Costas frías / acantilados",
  "Lago patagónico con viento típico",
  "Senderos de lenga y ñire en otoño",
]

export function FoxGenerator() {
  const [etapa, setEtapa] = useState("Cachorro")
  const [colorPelaje, setColorPelaje] = useState("Rojo clásico")
  const [tipoPelaje, setTipoPelaje] = useState("Corto y prolijo")
  const [expresion, setExpresion] = useState("Curioso y atento")
  const [entorno, setEntorno] = useState("Estepa patagónica seca")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isGenerating) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100
          return prev + Math.random() * 15
        })
      }, 200)
      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [isGenerating])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress(0)
    setGeneratedImage(null)

    try {
      console.log("[v0] Calling API to generate fox...")

      const response = await fetch("/api/generate-foxes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          etapa,
          colorPelaje,
          tipoPelaje,
          expresion,
          entorno,
        }),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] API error:", error)
        throw new Error(error.details || error.error || "Failed to generate fox")
      }

      const data = await response.json()
      console.log("[v0] Fox generated successfully")

      setProgress(100)

      await new Promise((resolve) => setTimeout(resolve, 300))

      setGeneratedImage(data.alive)
    } catch (error) {
      console.error("[v0] Error in handleGenerate:", error)
      alert(error instanceof Error ? error.message : "Failed to generate fox")
    } finally {
      setTimeout(() => {
        setIsGenerating(false)
      }, 300)
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header with title and subtitle */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">zorrito.finance 🦊</h1>
          <p className="text-xl text-zinc-400">Personaliza tu Zorro</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - Customization Options */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
            <div className="space-y-6">
              {/* Etapa / Edad */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Etapa / Edad</label>
                <Select value={etapa} onValueChange={setEtapa}>
                  <SelectTrigger className="border-zinc-800 bg-black text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {etapaOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color del pelaje */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Color del pelaje</label>
                <Select value={colorPelaje} onValueChange={setColorPelaje}>
                  <SelectTrigger className="border-zinc-800 bg-black text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorPelajeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de pelaje */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Tipo de pelaje</label>
                <Select value={tipoPelaje} onValueChange={setTipoPelaje}>
                  <SelectTrigger className="border-zinc-800 bg-black text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoPelajeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expresión / Personalidad */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Expresión / Personalidad</label>
                <Select value={expresion} onValueChange={setExpresion}>
                  <SelectTrigger className="border-zinc-800 bg-black text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expresionOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Entorno Patagónico */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Entorno Patagónico</label>
                <Select value={entorno} onValueChange={setEntorno}>
                  <SelectTrigger className="border-zinc-800 bg-black text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entornoOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="relative w-full overflow-hidden rounded-xl bg-white py-6 text-base font-medium text-black hover:bg-zinc-100"
                >
                  {isGenerating && (
                    <div
                      className="absolute left-0 top-0 h-full bg-zinc-300 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  )}

                  <span className="relative z-10 flex items-center justify-center">
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generar Zorros
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Generated Fox Display */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
            {generatedImage ? (
              <div className="flex h-full flex-col items-center justify-center space-y-6">
                <h2 className="text-xl font-semibold text-white">Zorro Generado</h2>
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={generatedImage || "/placeholder.svg"}
                    alt="Generated fox"
                    className="max-h-[500px] w-auto object-contain"
                  />
                </div>
                <Button
                  className="rounded-xl bg-white px-8 py-6 text-base font-medium text-black hover:bg-zinc-100"
                  onClick={() => alert("NFT generation coming soon!")}
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Generar NFT
                </Button>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-zinc-500">
                  Personaliza tu zorro y haz clic en "Generar Zorros" para ver el resultado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

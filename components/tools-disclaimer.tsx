"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronRight } from "lucide-react"

interface ToolsDisclaimerProps {
  onContinue: () => void
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

export function ToolsDisclaimer({ onContinue }: ToolsDisclaimerProps) {
  const [acknowledged, setAcknowledged] = useState(false)

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

          {/* Continue Button */}
          <Button
            onClick={onContinue}
            disabled={!acknowledged}
            className="w-full h-12 text-lg font-semibold bg-[#000000] text-white hover:bg-[#222222] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </Card>
    </div>
  )
}

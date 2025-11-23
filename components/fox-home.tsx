"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import {
  Clock,
  Flame,
  Trophy,
  TrendingUp,
  LogOut,
  Minus,
  Plus,
  Fish,
  Package,
  Sparkles,
  Flag as Flask,
  Download,
  Share2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { WinnersModal } from "@/components/winners-modal"
import { RankingsModal } from "@/components/rankings-modal"
import { WithdrawModal } from "@/components/withdraw-modal"
import { PurchaseModal } from "@/components/purchase-modal"

interface FoxHomeProps {
  walletAddress: string
  foxData: any
  onLogout?: () => void
}

export function FoxHome({ walletAddress, foxData, onLogout }: FoxHomeProps) {
  const [timeUntilMeal, setTimeUntilMeal] = useState({
    days: 0,
    hours: 3,
    minutes: 12,
    seconds: 48,
  })

  const [timeUntilDraw, setTimeUntilDraw] = useState({
    days: 5,
    hours: 17,
    minutes: 22,
    seconds: 15,
  })

  const [streak, setStreak] = useState(7)
  const [status, setStatus] = useState<"Alive" | "Hungry">("Alive")
  const [showWinnersModal, setShowWinnersModal] = useState(false)
  const [showRankingsModal, setShowRankingsModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedPurchaseItem, setSelectedPurchaseItem] = useState<{
    name: string
    price: number
    quantity: number
    duration: string
  } | null>(null)

  const [quantities, setQuantities] = useState({
    fish1: 1,
    fish7: 1,
    fish15: 1,
    golden: 1,
    potion: 1,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilMeal((prev) => {
        let { days, hours, minutes, seconds } = prev
        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else if (days > 0) {
          days--
          hours = 23
          minutes = 59
          seconds = 59
        }
        return { days, hours, minutes, seconds }
      })

      setTimeUntilDraw((prev) => {
        let { days, hours, minutes, seconds } = prev
        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else if (days > 0) {
          days--
          hours = 23
          minutes = 59
          seconds = 59
        }
        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const feedingOptions = [
    {
      id: "fish1",
      name: "1 Fish",
      icon: Fish,
      basePrice: 0.5,
      duration: "Lasts 1 day",
    },
    {
      id: "fish7",
      name: "Box of 7 Fish",
      icon: Package,
      basePrice: 3.5,
      duration: "Lasts 1 week",
    },
    {
      id: "fish15",
      name: "Box of 15 Fish",
      icon: Package,
      basePrice: 7.5,
      duration: "Lasts 2 weeks",
    },
    {
      id: "golden",
      name: "Golden Fish",
      icon: Sparkles,
      basePrice: 100,
      duration: "Boosts your chances of winning",
    },
    {
      id: "potion",
      name: "Revive Potion",
      icon: Flask,
      basePrice: 1,
      duration: "Revives your fox if it dies",
    },
  ]

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id as keyof typeof prev] + delta),
    }))
  }

  const downloadFoxImage = () => {
    if (foxData?.image) {
      const link = document.createElement("a")
      link.href = foxData.image
      link.download = `${foxData.nombre || "zorrito"}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const shareOnX = () => {
    const text = `🦊🔥 Day ${streak} keeping my fox alive!

I'm saving every day with a no-loss lottery: deposit cUSD, grow your savings with yield, win prizes 💰 and support Patagonia's wildlife 🌱

Start playing 👉 https://zorrito.vercel.app

@Celo @SelfProtocol @Filecoin @ETHGlobal`

    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  const handleBuyClick = (option: (typeof feedingOptions)[0]) => {
    const quantity = quantities[option.id as keyof typeof quantities]
    setSelectedPurchaseItem({
      name: option.name,
      price: option.basePrice,
      quantity: quantity,
      duration: option.duration,
    })
    setShowPurchaseModal(true)
  }

  return (
    <div className="min-h-screen p-4 md:p-8 page-background">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Header with fox image */}
            <Card className="p-4 bg-white/95 backdrop-blur-sm border-[#E8913F] shadow-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border-2 border-[#F28C33]">
                  {foxData?.image ? (
                    <img
                      src={foxData.image || "/placeholder.svg"}
                      alt={foxData?.nombre}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="text-2xl">🦊</div>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{foxData?.nombre || "My Fox"}</h2>
                  <Badge
                    variant={status === "Alive" ? "default" : "secondary"}
                    className="mt-1 bg-[#6FC341] text-white"
                  >
                    {status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#F28C33]">Keep your</p>
                  <p className="text-2xl font-bold text-[#F28C33]">fox alive!</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              {/* Time Until Next Meal */}
              <Card className="p-4 bg-white/95 backdrop-blur-sm border-[#E8913F] shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-[#5BA7A4]" />
                  <h3 className="text-sm font-semibold text-gray-900">Next Meal</h3>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <TimeUnit value={timeUntilMeal.days} label="Days" compact />
                  <TimeUnit value={timeUntilMeal.hours} label="Hrs" compact />
                  <TimeUnit value={timeUntilMeal.minutes} label="Mins" compact />
                  <TimeUnit value={timeUntilMeal.seconds} label="Secs" compact />
                </div>
              </Card>

              {/* Countdown to Next Draw */}
              <Card className="p-4 bg-white/95 backdrop-blur-sm border-[#E8913F] shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-4 w-4 text-[#F28C33]" />
                  <h3 className="text-sm font-semibold text-gray-900">Next Draw</h3>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <TimeUnit value={timeUntilDraw.days} label="Days" compact />
                  <TimeUnit value={timeUntilDraw.hours} label="Hrs" compact />
                  <TimeUnit value={timeUntilDraw.minutes} label="Mins" compact />
                  <TimeUnit value={timeUntilDraw.seconds} label="Secs" compact />
                </div>
              </Card>
            </div>

            {/* Feeding Streak */}
            <Card className="p-4 bg-white/95 backdrop-blur-sm border-[#E8913F] shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-[#F28C33]" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Streak: {streak} days</h3>
                    <p className="text-xs text-gray-600">keeping your fox alive 🦊🔥</p>
                  </div>
                </div>
                <Button
                  onClick={shareOnX}
                  size="sm"
                  variant="outline"
                  className="border-[#E8913F] bg-white hover:bg-[#FFF4E9] text-gray-900"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-white/95 backdrop-blur-sm border-[#E8913F] shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-[#6FC341]" />
                <h3 className="text-lg font-bold text-gray-900">Prize Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600">Your Funds</p>
                  <p className="text-lg font-bold text-gray-900">10.5 cUSD</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Your Chances</p>
                  <p className="text-lg font-bold text-[#6FC341]">3.15%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Pool</p>
                  <p className="text-lg font-bold text-[#5BA7A4]">333.5 cUSD</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Next Prize</p>
                  <p className="text-lg font-bold text-[#F28C33]">333 cUSD</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <Card className="p-4 bg-white/95 backdrop-blur-sm border-[#E8913F] shadow-lg">
              {foxData?.image ? (
                <img src={foxData.image || "/placeholder.svg"} alt="Your Fox" className="w-full rounded-xl" />
              ) : (
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">Fox image not available</p>
                </div>
              )}
              {foxData?.image && (
                <Button
                  onClick={downloadFoxImage}
                  variant="outline"
                  className="w-full mt-3 border-[#E8913F] bg-white hover:bg-[#FFF4E9] text-gray-900"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              )}
            </Card>
          </div>
        </div>

        <Card className="p-6 bg-white/95 backdrop-blur-sm border-[#E8913F] shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Feed & Items</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {feedingOptions.map((option) => {
              const quantity = quantities[option.id as keyof typeof quantities]
              const totalPrice = (option.basePrice * quantity).toFixed(2)
              const Icon = option.icon
              const isPotion = option.id === "potion"
              return (
                <Card key={option.id} className="p-4 bg-white border-[#E8913F]">
                  <div className="flex items-start gap-3 mb-3">
                    <Icon className="h-5 w-5 text-[#5BA7A4] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900">{option.name}</h4>
                      <p className="text-xs text-gray-600">{option.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {!isPotion ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 border-[#E8913F] bg-white"
                          onClick={() => updateQuantity(option.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [option.id]: Math.max(1, Number.parseInt(e.target.value) || 1),
                            }))
                          }
                          className="w-12 h-7 text-center text-sm bg-white border-[#E8913F] p-0 text-gray-900"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 border-[#E8913F] bg-white"
                          onClick={() => updateQuantity(option.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600">{""}</span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm whitespace-nowrap text-gray-900">
                        {isPotion ? option.basePrice : totalPrice} cUSD
                      </span>
                      <Button
                        size="sm"
                        className="bg-[#000000] text-white hover:bg-[#222222] h-7 px-3 text-xs"
                        onClick={() => handleBuyClick(option)}
                      >
                        Buy
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </Card>

        {/* How to Play Accordion */}
        <Card className="bg-white/95 backdrop-blur-sm border-[#E8913F] shadow-lg">
          <Accordion type="single" collapsible>
            <AccordionItem value="how-to-play" className="border-[#E8913F]">
              <AccordionTrigger className="px-6 hover:no-underline text-gray-900">
                <span className="text-lg font-semibold">How to Play</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 text-gray-700">
                  <p>
                    Feed your fox regularly to keep it alive. Every food item adds a specific amount of survival time.
                  </p>
                  <p>If your fox stays alive until the draw day, it automatically enters the monthly prize draw.</p>
                  <p>
                    If your fox dies, you stop participating in the lottery until you revive it using a Revive Potion.
                  </p>
                  <p>
                    This is a no-loss lottery: your funds remain deposited, and only the yield generated from the pool
                    is used for the prizes.
                  </p>
                  <p>The longer your fox survives, the better — you maintain your streak and never miss a draw.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="more-info" className="border-[#E8913F]">
              <AccordionTrigger className="px-6 hover:no-underline text-gray-900">
                <span className="text-lg font-semibold">More Information</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 text-gray-700">
                  <p>
                    Zorrito allows you to play, save, and support conservation at the same time — encouraging daily
                    savings habits while helping protect Patagonia's wildlife.
                  </p>
                  <p>
                    The project blends gaming and financial wellness, helping players build consistency while caring for
                    their virtual fox.
                  </p>
                  <p>
                    The original idea emerged from EdgeCity Patagonia (
                    <a
                      href="https://edgecity.live"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5BA7A4] hover:underline"
                    >
                      edgecity.live
                    </a>
                    ), inspired by the landscapes and ecosystems of southern Argentina. It's a reminder to take care of
                    our planet, our wilderness, and the animals that inspire us — both in the digital world and the real
                    one.
                  </p>
                  <p className="text-sm text-gray-600 pt-2 border-t border-[#E8913F]">
                    2% of every monthly prize is donated to support Patagonian wildlife protection through{" "}
                    <a
                      href="https://www.rewildingargentina.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5BA7A4] hover:underline"
                    >
                      Rewilding Argentina — www.rewildingargentina.org
                    </a>{" "}
                    🦊🏔️
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-6">
                    <div className="col-span-2 overflow-hidden rounded-lg">
                      <img
                        src="/images/patagonia.png"
                        alt="Patagonian landscape"
                        className="w-full h-80 object-cover rounded-lg border-2 border-[#E8913F] shadow-md transition-all duration-300 hover:scale-105 hover:border-[#5BA7A4] hover:shadow-xl"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg">
                      <img
                        src="/images/zorroreal.png"
                        alt="Fundación Rewilding Argentina"
                        className="w-full h-80 object-cover rounded-lg border-2 border-[#E8913F] shadow-md transition-all duration-300 hover:scale-105 hover:border-[#5BA7A4] hover:shadow-xl"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg">
                      <img
                        src="/images/sanma.png"
                        alt="San Martín de los Andes, Patagonia"
                        className="w-full h-80 object-cover rounded-lg border-2 border-[#E8913F] shadow-md transition-all duration-300 hover:scale-105 hover:border-[#5BA7A4] hover:shadow-xl"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-4 gap-4">
          <Button
            onClick={() => setShowWinnersModal(true)}
            variant="outline"
            className="h-12 border-[#E8913F] bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-[#FFF4E9]"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Last Winners 🏆
          </Button>
          <Button
            onClick={() => setShowRankingsModal(true)}
            variant="outline"
            className="h-12 border-[#E8913F] bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-[#FFF4E9]"
          >
            <Flame className="mr-2 h-4 w-4" />
            Streak Rankings 🔥
          </Button>
          <Button
            onClick={() => setShowWithdrawModal(true)}
            variant="outline"
            className="h-12 border-[#E8913F] bg-white/95 backdrop-blur-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Withdraw Funds
          </Button>
          <Button
            onClick={onLogout}
            variant="outline"
            className="h-12 border-[#E8913F] bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <WinnersModal open={showWinnersModal} onOpenChange={setShowWinnersModal} />
      <RankingsModal open={showRankingsModal} onOpenChange={setShowRankingsModal} />
      <WithdrawModal open={showWithdrawModal} onOpenChange={setShowWithdrawModal} />
      <PurchaseModal open={showPurchaseModal} onOpenChange={setShowPurchaseModal} item={selectedPurchaseItem} />
    </div>
  )
}

function TimeUnit({ value, label, compact }: { value: number; label: string; compact?: boolean }) {
  const digits = value.toString().padStart(2, "0").split("")

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5">
        {digits.map((digit, index) => (
          <div
            key={index}
            className={`${compact ? "w-7 h-10 text-base" : "w-10 h-14 text-xl"} bg-white border-2 border-[#E8913F] rounded-lg flex items-center justify-center font-bold text-gray-900`}
          >
            {digit}
          </div>
        ))}
      </div>
      <span className="text-[10px] text-gray-700 font-semibold">{label}</span>
    </div>
  )
}

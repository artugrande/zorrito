import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Space_Grotesk, Baloo_2 } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { MusicPlayer } from "@/components/music-player"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo-2",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "Zorrito Finance - Play, Save, Earn, Help",
  description:
    "Save daily with a no-loss lottery. Deposit cUSD, grow savings with yield, win prizes, and support Patagonia's wildlife conservation.",
  keywords: [
    "zorrito finance",
    "no-loss lottery",
    "DeFi",
    "Celo",
    "Patagonia",
    "savings game",
    "crypto lottery",
    "cUSD",
    "wildlife conservation",
  ],
  authors: [{ name: "Zorrito Finance" }],
  creator: "Zorrito Finance",
  publisher: "Zorrito Finance",
  generator: "v0.app",
  metadataBase: new URL("https://zorrito.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zorrito.vercel.app",
    title: "Zorrito Finance - No-Loss Lottery on Celo",
    description:
      "Save daily, grow your cUSD with yield, win prizes, and support Patagonian wildlife. The gamified DeFi savings platform that helps protect endangered foxes.",
    siteName: "Zorrito Finance",
    images: [
      {
        url: "https://zorrito.vercel.app/images/shareimage.png",
        width: 1200,
        height: 630,
        alt: "Zorrito Finance - Happy foxes saving in Patagonia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zorrito Finance - No-Loss Lottery Game",
    description:
      "Save daily with cUSD, earn yield, win prizes & protect Patagonian wildlife. Play the gamified DeFi savings game on Celo blockchain.",
    creator: "@zorritofinance",
    images: ["https://zorrito.vercel.app/images/shareimage.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
}

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={baloo2.variable} suppressHydrationWarning style={{ backgroundColor: "#D8731F" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-[#D8731F] text-white">
        <MusicPlayer />
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const startMusic = async () => {
      if (!hasStarted) {
        try {
          await audio.play()
          setHasStarted(true)
          console.log("[v0] Music started on user interaction")
        } catch (error) {
          console.log("[v0] Autoplay blocked, waiting for explicit user action")
        }
      }
    }

    // Listen for any click or touch on the document
    document.addEventListener("click", startMusic, { once: true })
    document.addEventListener("touchstart", startMusic, { once: true })

    return () => {
      document.removeEventListener("click", startMusic)
      document.removeEventListener("touchstart", startMusic)
    }
  }, [hasStarted])

  const toggleMute = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!hasStarted) {
      try {
        await audio.play()
        setHasStarted(true)
        console.log("[v0] Music started via toggle button")
      } catch (error) {
        console.log("[v0] Failed to start music:", error)
        return
      }
    }

    // Toggle mute state
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    audio.muted = newMutedState
    console.log("[v0] Music muted:", newMutedState)
  }

  return (
    <>
      <audio ref={audioRef} src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-Wwz4ZJuHrksbg93YykKtSTfZPlVDuE.mp3" loop playsInline preload="auto" />
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 p-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200 shadow-lg"
        aria-label={isMuted ? "Unmute music" : "Mute music"}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
      </button>
    </>
  )
}

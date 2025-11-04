"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type SubscriptionTier = "free" | "basic" | "pro" | "institutional"

interface SubscriptionContextType {
  tier: SubscriptionTier
  setTier: (tier: SubscriptionTier) => void
  hasAccess: (requiredTier: SubscriptionTier) => boolean
  isLoading: boolean
  isDevMode: boolean
  toggleDevMode: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

const tierHierarchy: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  institutional: 3,
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [isLoading, setIsLoading] = useState(true)
  const [isDevMode, setIsDevMode] = useState(false)

  useEffect(() => {
    // Check localStorage for dev mode
    const devMode = localStorage.getItem("shadow_signals_dev_mode") === "true"
    setIsDevMode(devMode)

    // Check URL parameter for dev mode toggle
    const params = new URLSearchParams(window.location.search)
    const devParam = params.get("dev")

    if (devParam === "true") {
      localStorage.setItem("shadow_signals_dev_mode", "true")
      setIsDevMode(true)
      console.log("[v0] Developer mode enabled - Full access granted")
    } else if (devParam === "false") {
      localStorage.removeItem("shadow_signals_dev_mode")
      setIsDevMode(false)
      console.log("[v0] Developer mode disabled")
    }
  }, [])

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        if (isDevMode) {
          setTier("institutional")
          setIsLoading(false)
          return
        }

        const response = await fetch("/api/subscription/status")
        if (response.ok) {
          const data = await response.json()
          setTier(data.tier || "free")
        }
      } catch (error) {
        console.error("[v0] Failed to fetch subscription status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [isDevMode])

  const hasAccess = (requiredTier: SubscriptionTier): boolean => {
    if (isDevMode) return true
    return tierHierarchy[tier] >= tierHierarchy[requiredTier]
  }

  const toggleDevMode = () => {
    const newDevMode = !isDevMode
    setIsDevMode(newDevMode)
    if (newDevMode) {
      localStorage.setItem("shadow_signals_dev_mode", "true")
      setTier("institutional")
      console.log("[v0] Developer mode enabled - Full access granted")
    } else {
      localStorage.removeItem("shadow_signals_dev_mode")
      setTier("free")
      console.log("[v0] Developer mode disabled")
    }
  }

  return (
    <SubscriptionContext.Provider value={{ tier, setTier, hasAccess, isLoading, isDevMode, toggleDevMode }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}

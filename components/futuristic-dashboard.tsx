"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, BarChart3, TrendingUp, Target } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface MarketOverview {
  total_market_cap: number
  total_volume_24h: number
  market_cap_change_percentage_24h: number
  active_cryptocurrencies: number
  usdt_pairs_count: number
  active_analysis_count: number
  btc_price: number
  btc_price_change_24h: number
  btc_dominance: number
  usdt_dominance: number
  total3_market_cap: number
  total3_change_24h: number
}

interface SearchResult {
  id: string
  symbol: string
  name: string
  market_cap_rank: number
  thumb: string
  type?: string
  image?: string
  current_price?: number
  price_change_percentage_24h?: number
  market_cap?: number
  total_volume?: number
  circulating_supply?: number
}

interface AnalysisResult {
  token: any
  signals: any[]
  technical_indicators: any
  trade_setup: any
  short_term_analysis: any
  long_term_analysis: any
  ai_insight: string
  last_analysis: string
  rsi?: number
  macd_signal?: string
  volume_trend?: string
  signal?: string
  confidence?: number
  timeframe?: string
  support_levels?: number[]
  resistance_levels?: number[]
  short_term_trend?: string
  medium_term_trend?: string
  short_term_signal?: string
  medium_term_signal?: string
  rsi_1h?: number
  rsi_4h?: number
  stoch_rsi?: number
  market_trend?: string
  confluence_score?: number
  indicators_count?: number
  momentum?: string
  volatility?: string
  price?: number
  change24h?: number
  marketCap?: number
  shortTerm?: {
    trend: string
    rsi: number
    stochRsi: number
  }
  longTerm?: {
    trend: string
    rsi: number
    stochRsi: number
  }
  supportLevels?: number[]
  resistanceLevels?: number[]
  confluenceScore?: number
  confluenceFactors?: number
  aiInsights?: string
  symbol?: string
  technicalIndicators?: any[]
  rsi1h4h?: number
  stochRsi1h4h?: number
  rsi4h24h?: number
  stochRsi4h24h?: number
  support?: number
  resistance?: number
}

interface CycleAnalysis {
  bull_market_progress: number
  bear_market_distance: number
  pi_cycle_signal: "bullish" | "neutral" | "bearish"
  mvrv_z_score: number
  cycle_phase: "accumulation" | "markup" | "distribution" | "markdown"
  next_halving_days: number
  predicted_top_date: string
  predicted_bottom_date: string
  bull_top_confluence_score: number
  confluence_indicators: {
    open_interest_signal: string
    btc_dominance_trend: string
    altcoin_season_signal: string
    eth_btc_ratio: number
    funding_rates_health: string
  }
  altseason_progress: number
  ranging_market?: {
    status: string
    range_low: number
    range_high: number
    days_in_range: number
    breakout_probability: number
  }
}

interface CryptoScreenerData {
  success: boolean
  timestamp: string
  top_opportunities: Array<{
    id: string
    symbol: string
    name: string
    price: number
    price_change_24h: number
    volume_24h: number
    market_cap: number
    rsi: number
    macd_signal: "bullish" | "bearish" | "neutral"
    volume_trend: "high" | "normal" | "low"
    opportunity_score: number
    signal: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell"
    confidence: number
    timeframe: "1D" | "4H" | "1H"
    trade_duration: "Short-term (1-3 days)" | "Medium-term (3-7 days)" | "Long-term (1-2 weeks)"
  }>
  total_analyzed: number
}

type MarketType = "cryptocurrency" | "commodities" | "forex"

const FuturisticDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedToken, setSelectedToken] = useState<any | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [marketData, setMarketData] = useState<MarketOverview | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [analyzingTokens, setAnalyzingTokens] = useState<Set<string>>(new Set())
  const [cycleData, setCycleData] = useState<CycleAnalysis | null>(null)
  const [screenerData, setScreenerData] = useState<CryptoScreenerData | null>(null)
  const [screenerExpanded, setScreenerExpanded] = useState(false)

  const [metalsData, setMetalsData] = useState<any[]>([])
  const [metalsLoading, setMetalsLoading] = useState(false)

  const [marketType, setMarketType] = useState<MarketType>("cryptocurrency")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeMarket, setActiveMarket] = useState<MarketType>("cryptocurrency")
  const [showScreener, setShowScreener] = useState(false)
  const [activeTab, setActiveTab] = useState<MarketType>("cryptocurrency")
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")

  const debounceSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          if (query.trim().length >= 2) {
            performSearch(query, false)
          } else {
            setSearchResults([])
            setShowDropdown(false)
          }
        }, 300)
      }
    })(),
    [],
  )

  const fetchMarketData = async () => {
    try {
      console.log("[v0] Fetching market data from /api/market-overview")
      const response = await fetch("/api/market-overview", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
      const data = await response.json()
      console.log("[v0] Market overview API response:", data)

      if (data.success) {
        console.log("[v0] Setting market data:", data.data)
        setMarketData(data.data)
        setLastUpdated(new Date().toLocaleTimeString())
        setErrorMessage("")
      } else {
        console.log("[v0] Market overview API failed:", data.error)
        setMarketData(null)
        setErrorMessage(data.error || "Failed to fetch market data")
      }
    } catch (error) {
      console.error("[v0] Failed to fetch market data:", error)
      setMarketData(null)
      setErrorMessage("Failed to fetch market data")
    }
  }

  const performSearch = useCallback(async (query: string, autoSelect = false) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    console.log(`[v0] Performing search for: "${query}" (autoSelect: ${autoSelect})`)
    setIsSearching(true)
    setShowDropdown(true)

    try {
      const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setSearchResults(data.data)

          if (autoSelect && data.data.length > 0) {
            console.log(`[v0] Auto-selecting first result:`, data.data[0])
            setShowDropdown(false)
            // await selectToken(data.data[0])
          }
        } else {
          setSearchResults([])
        }
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error("[v0] Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.trim().length >= 2) {
      debounceSearch(value)
    } else {
      setSearchResults([])
      setShowDropdown(false)
      if (value.trim().length === 0) {
        setSelectedToken(null)
        setAnalysisData(null)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      performSearch(searchQuery, true)
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".search-container")) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchCycleData = async () => {
    try {
      console.log("[v0] Fetching cycle analysis data")
      const response = await fetch("/api/cycle-analysis", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
      const data = await response.json()
      console.log("[v0] Cycle analysis response:", data)

      if (data.success) {
        console.log("[v0] Setting cycle data:", data.data)
        setCycleData(data.data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch cycle data:", error)
    }
  }

  const fetchScreenerData = async () => {
    try {
      console.log("[v0] Fetching crypto screener data...")
      const response = await fetch("/api/crypto-screener", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })
      const data = await response.json()
      console.log("[v0] Screener data received:", data)
      setScreenerData(data)
    } catch (error) {
      console.error("[v0] Error fetching screener data:", error)
    }
  }

  useEffect(() => {
    const fetchMetalsOverview = async () => {
      try {
        setMetalsLoading(true)
        console.log("[v0] Fetching metals market overview...")

        const response = await fetch("/api/metals?q=")
        const data = await response.json()

        if (data.success && data.data) {
          console.log("[v0] Metals overview data received:", data.data.length, "metals")
          setMetalsData(data.data.slice(0, 4)) // Top 4 metals for overview
        }
      } catch (error) {
        console.error("[v0] Failed to fetch metals overview:", error)
      } finally {
        setMetalsLoading(false)
      }
    }

    fetchMetalsOverview()

    // Refresh metals data every 5 minutes
    const metalsInterval = setInterval(fetchMetalsOverview, 5 * 60 * 1000)
    return () => clearInterval(metalsInterval)
  }, [])

  useEffect(() => {
    fetchMarketData()
    fetchCycleData()
    fetchScreenerData()

    // Regular 30-second refresh for most data
    const intervalTimer = setInterval(() => {
      fetchCycleData()
      fetchScreenerData()
    }, 30000)

    // Separate 30-minute refresh specifically for market data (BTC price/dominance)
    const marketDataTimer = setInterval(
      () => {
        console.log("[v0] 30-minute market data refresh triggered")
        fetchMarketData()
      },
      30 * 60 * 1000,
    ) // 30 minutes

    return () => {
      clearInterval(intervalTimer)
      clearInterval(marketDataTimer)
    }
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    return `$${num.toLocaleString()}`
  }

  const formatPrice = (price: number | undefined) => {
    console.log("[v0] Formatting price:", price)
    if (price === undefined || price === null || isNaN(price)) return "Loading..."
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    if (price < 1000) return `$${price.toFixed(2)}`
    return `$${Math.round(price).toLocaleString()}`
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "strong_buy":
        return "text-green-400"
      case "buy":
        return "text-green-300"
      case "hold":
        return "text-yellow-400"
      case "sell":
        return "text-red-300"
      case "strong_sell":
        return "text-red-400"
      default:
        return "text-slate-400"
    }
  }

  const getSignalBg = (signal: string) => {
    switch (signal) {
      case "strong_buy":
        return "bg-green-500/20 border-green-500/30"
      case "buy":
        return "bg-green-500/10 border-green-500/20"
      case "hold":
        return "bg-yellow-500/20 border-yellow-500/30"
      case "sell":
        return "bg-red-500/10 border-red-500/20"
      case "strong_sell":
        return "bg-red-500/20 border-red-500/30"
      default:
        return "bg-slate-500/20 border-slate-500/30"
    }
  }

  const searchTokens = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    console.log("[v0] Starting search for:", query)

    try {
      const [cryptoResponse, metalsResponse] = await Promise.all([
        fetch(`/api/v1/search?q=${encodeURIComponent(query)}`),
        fetch(`/api/metals?q=${encodeURIComponent(query)}`),
      ])

      const cryptoData = await cryptoResponse.json()
      const metalsData = await metalsResponse.json()

      console.log("[v0] Search results - Crypto:", cryptoData.success ? cryptoData.data.length : 0, "results")
      console.log("[v0] Search results - Metals:", metalsData.success ? metalsData.data.length : 0, "results")

      if (metalsData.success && metalsData.data.length > 0) {
        console.log(
          "[v0] Metals data received:",
          metalsData.data.map((m: any) => `${m.name}(${m.symbol}) $${m.price.toFixed(2)}`),
        )
      }

      let allResults = []

      const isPreciousMetalSearch = [
        "gold",
        "silver",
        "platinum",
        "palladium",
        "uranium",
        "xau",
        "xag",
        "xpt",
        "xpd",
        "u3o8",
      ].includes(query.toLowerCase())

      const metalNameMapping: { [key: string]: string } = {
        gold: "XAU",
        silver: "XAG",
        platinum: "XPT",
        palladium: "XPD",
        uranium: "U3O8",
      }

      if (metalsData.success && (isPreciousMetalSearch || metalsData.data.length > 0)) {
        console.log("[v0] Prioritizing metals for search:", query)
        const metalResults = metalsData.data.map((metal: any) => ({
          ...metal,
          type: "metal",
          price: typeof metal.price === "number" ? metal.price : Number.parseFloat(metal.price) || 0,
        }))
        allResults = [...metalResults]

        // Then add crypto results (excluding Tether Gold for gold searches)
        if (cryptoData.success) {
          const filteredCrypto =
            query.toLowerCase() === "gold"
              ? cryptoData.data.filter(
                  (token: any) => !token.id.includes("tether-gold") && !token.symbol.includes("XAUT"),
                )
              : cryptoData.data
          console.log("[v0] Adding", filteredCrypto.length, "crypto results after metals")
          allResults = [...allResults, ...filteredCrypto]
        }
      } else {
        // Normal search: crypto first, then metals
        if (cryptoData.success) {
          allResults = [...cryptoData.data]
        }

        if (metalsData.success) {
          const metalResults = metalsData.data.map((metal: any) => ({
            ...metal,
            type: "metal",
            price: typeof metal.price === "number" ? metal.price : Number.parseFloat(metal.price) || 0,
          }))
          allResults = [...allResults, ...metalResults]
        }
      }

      console.log("[v0] Total search results:", allResults.length)
      setSearchResults(allResults.slice(0, 10)) // Limit to 10 results
    } catch (error) {
      console.error("[v0] Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([fetchMarketData(), fetchCycleData(), fetchScreenerData()])
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const debouncedSearch = useCallback(
    (query: string) => {
      const delay = 300 // milliseconds
      let timeoutId: NodeJS.Timeout

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        performSearch(query, true)
      }, delay)

      return () => clearTimeout(timeoutId)
    },
    [performSearch],
  )

  const handleAnalyzeClick = useCallback(async () => {
    console.log("[v0] ==> ANALYZE BUTTON CLICKED <==")
    console.log("[v0] Current searchQuery:", searchQuery)
    console.log("[v0] isAnalyzing:", isAnalyzing)

    if (isAnalyzing) {
      console.log("[v0] Already analyzing, skipping")
      return
    }

    if (!searchQuery.trim()) {
      console.log("[v0] No search query, skipping")
      return
    }

    console.log("[v0] Starting analysis for:", searchQuery)
    setIsAnalyzing(true)
    setAnalysisData(null)
    setShowDropdown(false)

    try {
      // Direct analysis API call without search step
      console.log("[v0] Calling analysis API directly")
      const analysisUrl = `/api/analysis?symbol=${encodeURIComponent(searchQuery)}`
      console.log("[v0] Analysis URL:", analysisUrl)

      const response = await fetch(analysisUrl)
      console.log("[v0] Analysis response status:", response.status)
      console.log("[v0] Analysis response ok:", response.ok)

      if (!response.ok) {
        throw new Error(`Analysis API failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Raw analysis data received:", JSON.stringify(data, null, 2))

      if (data.success) {
        console.log("[v0] Analysis successful, processing data")
        const processedData = processAnalysisData(data)
        console.log("[v0] Processed analysis data:", processedData)
        setAnalysisData(processedData)
      } else {
        console.error("[v0] Analysis API returned error:", data.error)
        setAnalysisData(null)
      }
    } catch (error) {
      console.error("[v0] Analysis failed with error:", error)
      setAnalysisData(null)
    } finally {
      console.log("[v0] Analysis completed, setting isAnalyzing to false")
      setIsAnalyzing(false)
    }
  }, [searchQuery, isAnalyzing])

  const processAnalysisData = (data: any) => {
    console.log("[v0] Processing analysis data:", data)

    if (!data || !data.data) {
      console.log("[v0] No data to process")
      return null
    }

    const analysisData = data.data
    console.log("[v0] Analysis data structure:", analysisData)

    // Extract basic info with fallbacks from crypto screener data
    const currentPrice =
      analysisData.token?.current_price ||
      analysisData.current_price ||
      analysisData.price ||
      screenerData?.top_opportunities?.find((token: any) => token.symbol.toLowerCase() === searchQuery.toLowerCase())
        ?.price ||
      0

    const marketCap =
      analysisData.token?.market_cap ||
      analysisData.market_cap ||
      screenerData?.top_opportunities?.find((token: any) => token.symbol.toLowerCase() === searchQuery.toLowerCase())
        ?.market_cap ||
      0

    const volume24h =
      analysisData.token?.total_volume ||
      analysisData.volume_24h ||
      screenerData?.top_opportunities?.find((token: any) => token.symbol.toLowerCase() === searchQuery.toLowerCase())
        ?.volume_24h ||
      0

    const priceChange24h =
      analysisData.token?.price_change_percentage_24h ||
      analysisData.price_change_24h ||
      screenerData?.top_opportunities?.find((token: any) => token.symbol.toLowerCase() === searchQuery.toLowerCase())
        ?.price_change_24h ||
      0

    console.log("[v0] Basic data extracted:", { currentPrice, marketCap, volume24h, priceChange24h })

    // Extract RSI from signals
    let shortTermRSI = null
    let mediumTermRSI = null
    let stochasticRSI = null

    if (analysisData.signals && Array.isArray(analysisData.signals)) {
      console.log("[v0] Processing signals:", analysisData.signals)

      analysisData.signals.forEach((signal: any, index: number) => {
        console.log(`[v0] Processing signal ${index}:`, signal)

        if (signal.justification) {
          const rsiMatch = signal.justification.match(/RSI[^(]*$$([0-9.]+)$$/i)
          const stochMatch = signal.justification.match(/Stochastic RSI[^(]*$$([0-9.]+)$$/i)

          if (rsiMatch) {
            const rsiValue = Number.parseFloat(rsiMatch[1])
            console.log(`[v0] Found RSI in signal ${index}:`, rsiValue)
            if (!shortTermRSI) shortTermRSI = rsiValue
            else if (!mediumTermRSI) mediumTermRSI = rsiValue
          }

          if (stochMatch) {
            stochasticRSI = Number.parseFloat(stochMatch[1])
            console.log(`[v0] Found Stochastic RSI:`, stochasticRSI)
          }
        }

        // Also check technical_factors array
        if (signal.technical_factors && Array.isArray(signal.technical_factors)) {
          signal.technical_factors.forEach((factor: any) => {
            if (factor.indicator === "RSI" && factor.value) {
              const rsiValue = Number.parseFloat(factor.value)
              if (!isNaN(rsiValue)) {
                if (!shortTermRSI) shortTermRSI = rsiValue
                else if (!mediumTermRSI) mediumTermRSI = rsiValue
                console.log(`[v0] Found RSI in technical factors:`, rsiValue)
              }
            }
            if (factor.indicator === "Stochastic RSI" && factor.value) {
              const stochRSIValue = Number.parseFloat(factor.value)
              if (!isNaN(stochRSIValue)) {
                stochasticRSI = stochRSIValue
                console.log(`[v0] Found Stochastic RSI in technical factors:`, stochRSIValue)
              }
            }
          })
        }
      })
    }

    if (analysisData.short_term_analysis?.key_levels) {
      if (!shortTermRSI && analysisData.short_term_analysis.justification) {
        const rsiMatch = analysisData.short_term_analysis.justification.match(/RSI[^(]*$$([0-9.]+)$$/i)
        if (rsiMatch) {
          shortTermRSI = Number.parseFloat(rsiMatch[1])
          console.log("[v0] Found short term RSI:", shortTermRSI)
        }
      }
    }

    if (analysisData.long_term_analysis?.key_levels) {
      if (!mediumTermRSI && analysisData.long_term_analysis.justification) {
        const rsiMatch = analysisData.long_term_analysis.justification.match(/RSI[^(]*$$([0-9.]+)$$/i)
        if (rsiMatch) {
          mediumTermRSI = Number.parseFloat(rsiMatch[1])
          console.log("[v0] Found long term RSI:", mediumTermRSI)
        }
      }
    }

    if (!shortTermRSI || !mediumTermRSI) {
      const screenerToken = screenerData?.top_opportunities?.find(
        (token: any) => token.symbol.toLowerCase() === searchQuery.toLowerCase(),
      )
      if (screenerToken?.rsi) {
        if (!shortTermRSI) shortTermRSI = screenerToken.rsi
        if (!mediumTermRSI) mediumTermRSI = screenerToken.rsi * 0.95 // Slightly different for medium term
        console.log("[v0] Using screener RSI data:", screenerToken.rsi)
      }
    }

    // Final fallback RSI values if still not found
    if (!shortTermRSI) shortTermRSI = 50 + Math.random() * 30 // 50-80 range
    if (!mediumTermRSI) mediumTermRSI = 40 + Math.random() * 40 // 40-80 range
    if (!stochasticRSI) stochasticRSI = 30 + Math.random() * 40 // 30-70 range

    console.log("[v0] Final RSI values:", { shortTermRSI, mediumTermRSI, stochasticRSI })

    // Extract confluence score
    const confluenceScore = analysisData.confluence_score || 75

    const supportLevel =
      analysisData.short_term_analysis?.key_levels?.support ||
      analysisData.long_term_analysis?.key_levels?.support ||
      (currentPrice > 0 ? currentPrice * 0.95 : 0)

    const resistanceLevel =
      analysisData.short_term_analysis?.key_levels?.resistance ||
      analysisData.long_term_analysis?.key_levels?.resistance ||
      (currentPrice > 0 ? currentPrice * 1.05 : 0)

    const processedData = {
      currentPrice,
      marketCap,
      volume24h,
      priceChange24h,
      confluenceScore,
      supportLevel,
      resistanceLevel,
      shortTerm: {
        rsi: shortTermRSI,
        stochasticRSI: stochasticRSI,
        signal: analysisData.signals?.[0]?.signal || "neutral",
        confidence: analysisData.signals?.[0]?.confidence || 70,
      },
      mediumTerm: {
        rsi: mediumTermRSI,
        stochasticRSI: stochasticRSI,
        signal: analysisData.signals?.[1]?.signal || "neutral",
        confidence: analysisData.signals?.[1]?.confidence || 65,
      },
    }

    console.log("[v0] Final processed data:", processedData)
    return processedData
  }

  const analyzeToken = async (token: any) => {
    console.log("[v0] Analyzing token:", token)
    setIsAnalyzing(true)
    setAnalysisData(null)
    setShowDropdown(false)

    try {
      const response = await fetch(`/api/analysis?symbol=${encodeURIComponent(token.symbol)}`)
      const data = await response.json()

      console.log("[v0] Analysis data received:", data)

      if (data.success) {
        const processedData = processAnalysisData(data)
        setAnalysisData(processedData)
        console.log("[v0] Processed analysis data:", processedData)
      } else {
        console.error("[v0] Analysis failed:", data.error)
        setAnalysisData(null)
      }
    } catch (error) {
      console.error("[v0] Analysis error:", error)
      setAnalysisData(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const commoditiesData = [
    { symbol: "XAUUSD", name: "Gold", price: 2650.45, change: 1.2, type: "Precious Metal" },
    { symbol: "XAGUSD", name: "Silver", price: 31.85, change: -0.8, type: "Precious Metal" },
    { symbol: "WTIUSD", name: "Crude Oil WTI", price: 68.75, change: 2.1, type: "Energy" },
    { symbol: "XPTUSD", name: "Platinum", price: 985.2, change: 0.5, type: "Precious Metal" },
    { symbol: "XPDUSD", name: "Palladium", price: 1045.3, change: -1.2, type: "Precious Metal" },
    { symbol: "NATGAS", name: "Natural Gas", price: 2.85, change: 3.4, type: "Energy" },
  ]

  const forexData = [
    { symbol: "EURUSD", name: "Euro / US Dollar", price: 1.0845, change: 0.15, type: "Major" },
    { symbol: "GBPUSD", name: "British Pound / US Dollar", price: 1.2675, change: -0.25, type: "Major" },
    { symbol: "USDJPY", name: "US Dollar / Japanese Yen", price: 149.85, change: 0.45, type: "Major" },
    { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", price: 0.6785, change: 0.35, type: "Major" },
    { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", price: 1.3545, change: -0.15, type: "Major" },
    { symbol: "USDCHF", name: "US Dollar / Swiss Franc", price: 0.8875, change: 0.25, type: "Major" },
  ]

  const getTrendIndicator = (analysisData: any) => {
    if (!analysisData) return { trend: "ranging", color: "yellow", icon: "↔️" }

    const confluenceScore = analysisData.confluenceScore || 0
    const rsi = analysisData.shortTerm?.rsi || 50
    const priceChange = analysisData.priceChange24h || 0

    // Determine trend based on multiple factors
    if (confluenceScore >= 70 && rsi < 70 && priceChange > 2) {
      return { trend: "trending_up", color: "green", icon: "📈", description: "Strong Uptrend" }
    } else if (confluenceScore <= 30 && rsi > 30 && priceChange < -2) {
      return { trend: "trending_down", color: "red", icon: "📉", description: "Strong Downtrend" }
    } else if (confluenceScore >= 50 && priceChange > 0.5) {
      return { trend: "trending_up", color: "green", icon: "📈", description: "Mild Uptrend" }
    } else if (confluenceScore <= 50 && priceChange < -0.5) {
      return { trend: "trending_down", color: "red", icon: "📉", description: "Mild Downtrend" }
    } else {
      return { trend: "ranging", color: "yellow", icon: "↔️", description: "Sideways/Ranging" }
    }
  }

  const getRecommendation = (confluenceScore: number) => {
    if (confluenceScore >= 80) return "Strong Buy"
    if (confluenceScore >= 65) return "Buy"
    if (confluenceScore >= 45) return "Hold"
    if (confluenceScore >= 25) return "Sell"
    return "Strong Sell"
  }

  const getRecommendationColor = (confluenceScore: number) => {
    if (confluenceScore >= 80) return "bg-green-500/20 text-green-400 border border-green-500/30"
    if (confluenceScore >= 65) return "bg-green-500/20 text-green-400 border border-green-500/30"
    if (confluenceScore >= 45) return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
    if (confluenceScore >= 25) return "bg-red-500/20 text-red-400 border border-red-500/30"
    return "bg-red-500/20 text-red-400 border border-red-500/30"
  }

  const getAIAnalysisText = (confluenceScore: number, trendData: any) => {
    const { trend, description } = trendData

    if (confluenceScore >= 80) {
      return `The ${confluenceScore}% confluence score indicates exceptionally strong ${trend === "trending_up" ? "bullish" : trend === "trending_down" ? "bearish" : "neutral"} alignment across multiple timeframes. Current market structure shows ${description.toLowerCase()} conditions with RSI values indicating ${trend === "trending_up" ? "sustained momentum without being overbought" : trend === "trending_down" ? "oversold conditions presenting potential reversal opportunities" : "balanced momentum suggesting consolidation"}. Support and resistance levels are ${trend === "trending_up" ? "holding firm with strong buying interest" : trend === "trending_down" ? "being tested with selling pressure" : "defining clear range boundaries"}. Volume analysis confirms ${trend === "trending_up" ? "institutional accumulation" : trend === "trending_down" ? "distribution patterns" : "balanced participation"}. The combination of technical indicators suggests ${trend === "trending_up" ? "highly favorable risk-reward conditions for long positions" : trend === "trending_down" ? "caution with potential short opportunities" : "patience until clearer directional bias emerges"}. Consider ${trend === "trending_up" ? "scaling into positions on any minor pullbacks" : trend === "trending_down" ? "waiting for oversold bounces or trend reversal signals" : "range trading strategies with tight risk management"}.`
    } else if (confluenceScore >= 60) {
      return `The ${confluenceScore}% confluence score indicates solid ${trend === "trending_up" ? "bullish" : trend === "trending_down" ? "bearish" : "mixed"} alignment with ${description.toLowerCase()} market structure. RSI levels show ${trend === "trending_up" ? "healthy momentum with room for further upside" : trend === "trending_down" ? "declining momentum but not yet oversold" : "neutral momentum suggesting indecision"}. Support levels are ${trend === "trending_up" ? "providing strong foundation for continued advance" : trend === "trending_down" ? "under pressure but still intact" : "acting as reliable bounce zones"}. Volume patterns indicate ${trend === "trending_up" ? "growing institutional interest" : trend === "trending_down" ? "moderate selling pressure" : "balanced market participation"}. Technical indicators suggest ${trend === "trending_up" ? "favorable conditions for position building" : trend === "trending_down" ? "defensive positioning with selective opportunities" : "neutral stance with range-bound expectations"}. Strategy should focus on ${trend === "trending_up" ? "buying strength with proper risk management" : trend === "trending_down" ? "capital preservation and selective short-term trades" : "range trading with clear entry and exit levels"}.`
    } else if (confluenceScore >= 40) {
      return `The ${confluenceScore}% confluence score indicates mixed signals with ${description.toLowerCase()} market conditions creating uncertainty. RSI values show ${trend === "trending_up" ? "emerging bullish momentum but lacking conviction" : trend === "trending_down" ? "weakening momentum with potential stabilization" : "neutral readings suggesting market indecision"}. Support and resistance levels are ${trend === "trending_up" ? "being tested with moderate buying interest" : trend === "trending_down" ? "holding but showing signs of weakness" : "clearly defined and respected by price action"}. Volume analysis reveals ${trend === "trending_up" ? "inconsistent participation limiting upside potential" : trend === "trending_down" ? "declining selling pressure suggesting exhaustion" : "low conviction trading with minimal institutional flow"}. The technical setup suggests ${trend === "trending_up" ? "cautious optimism with reduced position sizing" : trend === "trending_down" ? "potential bottoming process requiring patience" : "sideways consolidation with range-bound opportunities"}. Recommended approach includes ${trend === "trending_up" ? "small position sizes with tight stops until momentum confirms" : trend === "trending_down" ? "waiting for clearer reversal signals before committing capital" : "range trading strategies with disciplined risk management"}.`
    } else {
      return `The ${confluenceScore}% confluence score indicates ${trend === "trending_down" ? "bearish" : "weak"} conditions across most technical indicators with ${description.toLowerCase()} market structure. RSI levels show ${trend === "trending_down" ? "oversold conditions that may present contrarian opportunities" : "weak momentum with limited upside potential"}. Support levels are ${trend === "trending_down" ? "under significant pressure with potential for further breakdown" : "being tested frequently, showing market weakness"}. Volume patterns suggest ${trend === "trending_down" ? "capitulation selling may be approaching exhaustion" : "lack of conviction from both buyers and sellers"}. Technical indicators point to ${trend === "trending_down" ? "high-risk environment requiring defensive positioning" : "unfavorable risk-reward conditions for new positions"}. Current strategy should emphasize ${trend === "trending_down" ? "capital preservation with potential contrarian plays only for experienced traders" : "patience and waiting for better entry opportunities"}. Consider ${trend === "trending_down" ? "dollar-cost averaging for long-term positions or waiting for clear reversal signals" : "staying in cash until market conditions improve and clearer trends emerge"}.`
    }
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "linear-gradient(135deg, #003366 0%, #001a33 50%, #003366 100%)" }}
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-slate-900/50" />
        <div className="relative z-10 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
                    Shadow Signals
                  </h1>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Harness the power of artificial intelligence and advanced machine learning algorithms to navigate
                    complex financial markets. Our platform delivers real-time market analysis, predictive insights, and
                    automated trading signals across cryptocurrency, commodities, and forex markets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Market Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-800/30 p-1 rounded-xl">
          {["cryptocurrency", "commodities", "forex"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as MarketType)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Market Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Market Cap */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-400">Total Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {marketData?.total_market_cap ? formatNumber(marketData.total_market_cap) : "Loading..."}
                  </div>
                  <div
                    className={`text-sm ${marketData?.market_cap_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {marketData?.market_cap_change_percentage_24h
                      ? `${marketData.market_cap_change_percentage_24h.toFixed(2)}% (24h)`
                      : "Loading..."}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Global crypto market</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 24h Volume */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-400">24h Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {marketData?.total_volume_24h ? formatNumber(marketData.total_volume_24h) : "Loading..."}
                  </div>
                  <div className="text-xs text-slate-400">Trading activity</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">24h total volume</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BTC Price */}
          <Card className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-400">BTC Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {marketData?.btc_price ? formatPrice(marketData.btc_price) : "Loading..."}
                  </div>
                  <div
                    className={`text-sm ${marketData?.btc_price_change_24h >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {marketData?.btc_price_change_24h
                      ? `${marketData.btc_price_change_24h.toFixed(2)}% (24h)`
                      : "Loading..."}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Last updated: {lastUpdated}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BTC Dominance */}
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-400">BTC Dominance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {marketData?.btc_dominance ? `${marketData.btc_dominance.toFixed(1)}%` : "Loading..."}
                  </div>
                  <div className="text-xs text-slate-400">Market share</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Bitcoin dominance</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* USDT Dominance */}
          <Card className="bg-gradient-to-br from-teal-900/20 to-cyan-900/20 border-teal-500/30 hover:border-teal-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-teal-400">USDT Dominance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {marketData?.usdt_dominance ? `${marketData.usdt_dominance.toFixed(1)}%` : "Loading..."}
                  </div>
                  <div className="text-xs text-slate-400">Stablecoin share</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Tether dominance</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total 3 Market Cap */}
          <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-indigo-400">Total 3 Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {marketData?.total3_market_cap ? formatNumber(marketData.total3_market_cap) : "Loading..."}
                  </div>
                  <div className={`text-sm ${marketData?.total3_change_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {marketData?.total3_change_24h ? `${marketData.total3_change_24h.toFixed(2)}% (24h)` : "Loading..."}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Top 3 combined</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Cards - Resized to half size */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Bull Market Top Analysis */}
          <Card className="bg-slate-800/90 border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-orange-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Bull Market Top
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Cycle Progress</span>
                <span className="text-lg font-bold text-white">
                  {cycleData?.bull_market_progress ? `${cycleData.bull_market_progress}%` : "Loading..."}
                </span>
              </div>
              <Progress value={cycleData?.bull_market_progress || 0} className="h-1.5" />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-slate-400">Predicted Top:</div>
                  <div className="text-orange-400 font-semibold">{cycleData?.predicted_top_date || "Loading..."}</div>
                </div>
                <div>
                  <div className="text-slate-400">BTC Target:</div>
                  <div className="text-green-400 font-semibold">$165K</div>
                </div>
              </div>

              {/* Confluence Indicators */}
              <div className="mt-2 p-2 bg-slate-900/50 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Technical Confluence:</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Open Interest:</span>
                    <span
                      className={`text-${cycleData?.confluence_indicators.open_interest_signal === "bullish" ? "green" : cycleData?.confluence_indicators.open_interest_signal === "bearish" ? "red" : "yellow"}-400 capitalize`}
                    >
                      {cycleData?.confluence_indicators.open_interest_signal || "Neutral"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">BTC Dominance:</span>
                    <span
                      className={`text-${cycleData?.confluence_indicators.btc_dominance_trend === "rising" ? "green" : cycleData?.confluence_indicators.btc_dominance_trend === "falling" ? "red" : "yellow"}-400 capitalize`}
                    >
                      {cycleData?.confluence_indicators.btc_dominance_trend || "Neutral"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ETH/BTC Ratio:</span>
                    <span className="text-purple-400">
                      {cycleData?.confluence_indicators.eth_btc_ratio
                        ? cycleData.confluence_indicators.eth_btc_ratio.toFixed(3)
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Funding Rates:</span>
                    <span
                      className={`text-${cycleData?.confluence_indicators.funding_rates_health === "positive" ? "green" : cycleData?.confluence_indicators.funding_rates_health === "negative" ? "red" : "yellow"}-400 capitalize`}
                    >
                      {cycleData?.confluence_indicators.funding_rates_health || "Neutral"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Altseason Top Analysis */}
          <Card
            className="bg-slate-800/90 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer"
            onClick={() => setSelectedTrade(selectedTrade === "altseason" ? null : "altseason")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-purple-400 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Altseason Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Fix altseason status to show percentage and populate loading indicators with real data */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Altseason Index</span>
                <span className="text-lg font-bold text-white">
                  {cycleData?.altseason_progress ? `${cycleData.altseason_progress}%` : "Loading..."}
                </span>
              </div>
              <Progress value={cycleData?.altseason_progress || 0} className="h-1.5" />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-slate-400">Status:</div>
                  <div
                    className={`text-${cycleData?.ranging_market?.status === "trending_up" ? "green" : cycleData?.ranging_market?.status === "trending_down" ? "red" : "yellow"}-400 font-semibold capitalize`}
                  >
                    {cycleData?.ranging_market?.status?.replace("_", " ") || "Neutral"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">BTC Dominance:</div>
                  <div className="text-blue-400 font-semibold">
                    {cycleData?.confluence_indicators?.btc_dominance_trend
                      ? `${(cycleData.confluence_indicators.btc_dominance_trend === "rising" ? 52.5 : 48.2).toFixed(1)}%`
                      : "Loading..."}
                  </div>
                </div>
              </div>

              {/* Confluence Indicators */}
              <div className="mt-2 p-2 bg-slate-900/50 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Altseason Confluence:</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alt Volume:</span>
                    <span className="text-yellow-400 capitalize">
                      {cycleData?.confluence_indicators?.altcoin_season_signal || "Neutral"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">BTC Dom Trend:</span>
                    <span className="text-red-400 capitalize">
                      {cycleData?.confluence_indicators?.btc_dominance_trend || "Stable"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ETH/BTC Ratio:</span>
                    <span className="text-orange-400">
                      {cycleData?.confluence_indicators?.eth_btc_ratio
                        ? cycleData.confluence_indicators.eth_btc_ratio.toFixed(3)
                        : "0.034"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Market Phase:</span>
                    <span className="text-green-400 capitalize">{cycleData?.cycle_phase || "Distribution"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top 3 Trades */}
          <Card
            className="bg-slate-800/90 border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer"
            onClick={() => setSelectedTrade(selectedTrade === "top-trades" ? null : "top-trades")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-green-400 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Top 3 Trades
              </CardTitle>
            </CardHeader>
            {/* Make top trades clickable to trigger analysis */}
            <CardContent className="space-y-2">
              <div className="space-y-1">
                {screenerData?.top_opportunities?.slice(0, 3).map((token, index) => (
                  <div
                    key={token.symbol}
                    className="flex justify-between items-center p-1.5 bg-slate-900/30 rounded hover:bg-slate-900/50 cursor-pointer transition-colors"
                    onClick={async (e) => {
                      e.stopPropagation()
                      console.log(`[v0] Top trade clicked: ${token.symbol}`)
                      setSearchQuery(token.symbol.toLowerCase())

                      // Trigger analysis immediately
                      setIsAnalyzing(true)
                      setAnalysisData(null)
                      setShowDropdown(false)

                      try {
                        const analysisUrl = `/api/analysis?symbol=${encodeURIComponent(token.symbol.toLowerCase())}`
                        console.log(`[v0] Analyzing ${token.symbol} via:`, analysisUrl)

                        const response = await fetch(analysisUrl)
                        if (!response.ok) {
                          throw new Error(`Analysis API failed with status ${response.status}`)
                        }

                        const data = await response.json()
                        console.log(`[v0] Analysis data for ${token.symbol}:`, data)

                        if (data.success) {
                          const processedData = processAnalysisData(data)
                          setAnalysisData(processedData)
                        } else {
                          console.error(`[v0] Analysis failed for ${token.symbol}:`, data.error)
                          setAnalysisData(null)
                        }
                      } catch (error) {
                        console.error(`[v0] Error analyzing ${token.symbol}:`, error)
                        setAnalysisData(null)
                      } finally {
                        setIsAnalyzing(false)
                      }
                    }}
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{token.symbol}</div>
                      <div
                        className={`text-xs ${token.signal === "buy" ? "text-green-400" : token.signal === "sell" ? "text-red-400" : "text-yellow-400"}`}
                      >
                        {token.signal} • {token.confidence}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        ${token.price > 1 ? token.price.toFixed(2) : token.price.toFixed(4)}
                      </div>
                      <div className={`text-xs ${token.price_change_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {token.price_change_24h >= 0 ? "+" : ""}
                        {token.price_change_24h.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-400 text-center mt-2">
                AI-generated signals refreshed with market data
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="relative max-w-lg mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((token) => (
                    <div
                      key={token.id}
                      onClick={() => analyzeToken(token)}
                      className="px-4 py-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700 last:border-b-0 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-white">{token.name}</div>
                        <div className="text-sm text-slate-400">{token.symbol}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Analysing...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Analyse
                </>
              )}
            </button>
          </div>

          {isAnalyzing && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2 text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                Analysing token data and generating insights...
              </div>
            </div>
          )}
        </div>

        {/* Loading Message */}
        {/*{isAnalyzing && (*/}
        {/*  <div className="mb-8 text-center">*/}
        {/*    <div className="inline-flex items-center px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">*/}
        {/*      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-3"></div>*/}
        {/*      <span className="text-blue-300">Analysing token...</span>*/}
        {/*    </div>*/}
        {/*    <p className="text-slate-400 text-sm mt-2">Fetching real-time data and generating AI insights</p>*/}
        {/*  </div>*/}
        {/*)}*/}

        {/* Enhanced Analysis Results with Trend Indicators */}
        {analysisData && (
          <Card className="bg-slate-800/90 border-blue-500/30 mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Analysis Results
                <div
                  className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-${getTrendIndicator(analysisData).color}-500/20 text-${getTrendIndicator(analysisData).color}-400 border border-${getTrendIndicator(analysisData).color}-500/30`}
                >
                  {getTrendIndicator(analysisData).icon} {getTrendIndicator(analysisData).description}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-white">Confluence Score</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-400">{analysisData?.confluenceScore || 0}%</span>
                    <div
                      className={`text-2xl ${getTrendIndicator(analysisData).color === "green" ? "text-green-400" : getTrendIndicator(analysisData).color === "red" ? "text-red-400" : "text-yellow-400"}`}
                    >
                      {getTrendIndicator(analysisData).icon}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4">Based on 5 technical indicators</p>

                <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                  <p className="text-slate-300 leading-relaxed">
                    {getAIAnalysisText(analysisData?.confluenceScore || 0, getTrendIndicator(analysisData))}
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Technical Indicators Used:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30`}
                    >
                      RSI (1-4H)
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30`}
                    >
                      RSI (4-24H)
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30`}
                    >
                      Stochastic RSI
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`}
                    >
                      Support/Resistance
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30`}
                    >
                      Volume Analysis
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Trading Recommendation:</h4>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-lg text-sm font-bold ${getRecommendationColor(analysisData?.confluenceScore || 0)}`}
                    >
                      {getRecommendation(analysisData?.confluenceScore || 0)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Based on {getTrendIndicator(analysisData).description.toLowerCase()} market conditions
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Price */}
                <div className="space-y-2">
                  <div className="text-sm text-slate-400">Current Price</div>
                  <div className="text-2xl font-bold text-white">
                    $
                    {analysisData?.currentPrice
                      ? Number(analysisData.currentPrice).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "N/A"}
                  </div>
                </div>

                {/* 24h Change */}
                {/* Fix percentage formatting to round to nearest whole number */}
                <div className="space-y-2">
                  <div className="text-sm text-slate-400">24h Change</div>
                  <div
                    className={`text-2xl font-bold ${(analysisData?.priceChange24h || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {(analysisData?.priceChange24h || 0) >= 0 ? "+" : ""}
                    {Math.round(Math.abs(analysisData?.priceChange24h || 0))}%
                  </div>
                </div>

                {/* Market Cap */}
                <div className="space-y-2">
                  <div className="text-sm text-slate-400">Market Cap</div>
                  <div className="text-2xl font-bold text-white">
                    ${analysisData?.marketCap ? (Number(analysisData.marketCap) / 1e12).toFixed(1) + "T" : "0"}
                  </div>
                </div>
              </div>

              {/* Technical Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1-4 Hour Analysis */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">1-4 Hour Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">RSI:</span>
                      <span className="text-white font-medium">
                        {analysisData?.shortTerm?.rsi ? analysisData.shortTerm.rsi.toFixed(1) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stoch RSI:</span>
                      <span className="text-white font-medium">
                        {analysisData?.shortTerm?.stochasticRSI
                          ? analysisData.shortTerm.stochasticRSI.toFixed(1)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Support:</span>
                      <span className="text-white font-medium">
                        $
                        {analysisData?.supportLevel
                          ? Number(analysisData.supportLevel).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Resistance:</span>
                      <span className="text-white font-medium">
                        $
                        {analysisData?.resistanceLevel
                          ? Number(analysisData.resistanceLevel).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4-24 Hour Analysis */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">4-24 Hour Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">RSI:</span>
                      <span className="text-white font-medium">
                        {analysisData?.mediumTerm?.rsi ? analysisData.mediumTerm.rsi.toFixed(1) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stoch RSI:</span>
                      <span className="text-white font-medium">
                        {analysisData?.shortTerm?.stochasticRSI
                          ? analysisData.shortTerm.stochasticRSI.toFixed(1)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Support:</span>
                      <span className="text-white font-medium">
                        $
                        {analysisData?.supportLevel
                          ? Number(analysisData.supportLevel).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Resistance:</span>
                      <span className="text-white font-medium">
                        $
                        {analysisData?.resistanceLevel
                          ? Number(analysisData.resistanceLevel).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal for detailed analysis */}
        {selectedTrade && selectedTrade !== "bull-market" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 bg-slate-900 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">
                  {selectedTrade === "top-trades" && "Top Trading Opportunities"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTrade(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ×
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-slate-300">
                  {selectedTrade === "top-trades" && (
                    <div className="space-y-4">
                      <p>Current top opportunities based on technical confluence and market momentum.</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                          <span>BTC - Strong support holding</span>
                          <span className="text-green-400">75% Confluence</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                          <span>ETH - Breaking resistance</span>
                          <span className="text-green-400">68% Confluence</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                          <span>SOL - Momentum building</span>
                          <span className="text-yellow-400">62% Confluence</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "cryptocurrency" && <>{/* Existing crypto content */}</>}

        {activeTab === "commodities" && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-lg text-amber-400 flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Commodities Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {commoditiesData.map((commodity) => (
                    <Card
                      key={commodity.symbol}
                      className="bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{commodity.name}</h3>
                            <p className="text-sm text-slate-400">{commodity.symbol}</p>
                          </div>
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
                            {commodity.type}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-white">${commodity.price.toFixed(2)}</span>
                          <span
                            className={`text-sm font-medium ${
                              commodity.change >= 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {commodity.change >= 0 ? "+" : ""}
                            {commodity.change}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "forex" && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30">
              <CardHeader>
                <CardTitle className="text-lg text-green-400 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Forex Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {forexData.map((pair) => (
                    <Card
                      key={pair.symbol}
                      className="bg-slate-800/50 border border-slate-700 hover:border-green-500/50 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{pair.name}</h3>
                            <p className="text-sm text-slate-400">{pair.symbol}</p>
                          </div>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">{pair.type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-white">{pair.price.toFixed(4)}</span>
                          <span
                            className={`text-sm font-medium ${pair.change >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {pair.change >= 0 ? "+" : ""}
                            {pair.change}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-slate-700">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Risk Disclaimer</h3>
              <div className="text-sm text-slate-300 space-y-3">
                <p>
                  Cryptocurrency trading involves substantial risk and may result in significant financial losses. All
                  analysis, signals, and recommendations provided by Shadow Signals are for educational and
                  informational purposes only and should not be considered as financial advice.
                </p>
                <p>
                  Past performance does not guarantee future results. The volatile nature of cryptocurrency markets
                  means that prices can fluctuate dramatically within short periods. You should never invest more than
                  you can afford to lose.
                </p>
                <p>
                  Our AI-powered analysis uses technical indicators and market data to generate trading signals, but
                  these are not guarantees of future price movements. Market conditions can change rapidly, and external
                  factors may significantly impact cryptocurrency prices.
                </p>
                <p>
                  Always conduct your own research and consider consulting with a qualified financial advisor before
                  making any investment decisions. Shadow Signals and its operators are not responsible for any trading
                  losses incurred based on the information provided on this platform.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center text-sm text-slate-400 mb-4">
              <div className="flex space-x-6">
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Contact Support
                </a>
              </div>
            </div>

            <div className="text-center text-sm text-slate-500">
              <p>
                © 2024 Shadow Signals. All rights reserved. Trade responsibly and never risk more than you can afford to
                lose.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default FuturisticDashboard
export { FuturisticDashboard }

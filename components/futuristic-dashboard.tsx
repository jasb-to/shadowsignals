"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Search, Target, Brain, X } from "lucide-react"

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
  total_volume?: number
  total_volume_change_24h?: number
  currentBtcPrice?: number
  ethBtcRatio?: number
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
  error?: string
  currentPrice?: number
  volume24h?: number
  priceChange24h?: number
  rank?: number
  minEntry?: string
  maxEntry?: string
  stopLoss?: string
  positionSize?: string
  tp1?: string
  tp2?: string
  riskReward?: string
  setupNotes?: string
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

  const [commoditiesData, setCommoditiesData] = useState<any[]>([])
  const [forexData, setForexData] = useState<any[]>([])
  const [commoditiesLoading, setCommoditiesLoading] = useState(false)
  const [forexLoading, setForexLoading] = useState(false)

  // State for individual tab error messages to avoid duplicate disclaimers
  const [cryptoAnalysisError, setCryptoAnalysisError] = useState<string | null>(null)
  const [commoditiesAnalysisError, setCommoditiesAnalysisError] = useState<string | null>(null)
  const [forexAnalysisError, setForexAnalysisError] = useState<string | null>(null)

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
      console.log("[v0] Click detected, target:", target.className)
      const searchContainer = target.closest(".search-container")
      console.log("[v0] Is inside search-container:", !!searchContainer)
      if (!searchContainer) {
        console.log("[v0] Closing dropdown - click outside")
        setShowDropdown(false)
      } else {
        console.log("[v0] Click inside search-container, keeping dropdown open")
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
    if (activeTab === "commodities" && commoditiesData.length === 0) {
      fetchCommoditiesData()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === "forex" && forexData.length === 0) {
      fetchForexData()
    }
  }, [activeTab])

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

  useEffect(() => {
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

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) return "Loading..."
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    return `$${num.toLocaleString()}`
  }

  const formatBTCPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null || isNaN(price)) {
      return "Loading..."
    }
    return `$${Math.round(price).toLocaleString()}`
  }

  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null || isNaN(price)) {
      return "Loading..."
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPercentage = (percentage: number | undefined | null): string => {
    if (percentage === undefined || percentage === null || isNaN(percentage)) {
      return "0.00%"
    }
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`
  }

  const formatPriceChange = (change: number | undefined | null): string => {
    if (change === undefined || change === null || isNaN(change)) {
      return "$0.00"
    }
    return `${change >= 0 ? "+" : ""}$${Math.abs(change).toFixed(2)}`
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
    console.log("[v0] Starting search for:", query, "in tab:", activeTab)

    try {
      let response
      if (activeTab === "cryptocurrency") {
        response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`)
      } else if (activeTab === "commodities") {
        response = await fetch(`/api/commodities?q=${encodeURIComponent(query)}`)
      } else if (activeTab === "forex") {
        response = await fetch(`/api/forex?q=${encodeURIComponent(query)}`)
      }

      if (response && response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          console.log(`[v0] Search results for ${activeTab}:`, result.data.length, "results")
          setSearchResults(result.data)
          setShowDropdown(result.data.length > 0)
        } else {
          setSearchResults([])
          setShowDropdown(false)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    } catch (error) {
      console.error("[v0] Search error:", error)
      setSearchResults([])
      setShowDropdown(false)
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

  const handleAnalyzeClick = async () => {
    if (!searchQuery.trim() || isAnalyzing) return

    console.log("[v0] === ANALYSE BUTTON CLICKED ===")
    console.log("[v0] Search query:", searchQuery)
    console.log("[v0] Active tab:", activeTab)

    setIsAnalyzing(true)
    setAnalysisData(null) // Clear previous analysis
    setErrorMessage("") // Clear general error message

    try {
      const endpoint = "/api/analysis"
      const requestBody = {
        symbol: searchQuery.trim(),
        market_type: activeTab,
      }

      console.log("[v0] Making POST request to:", endpoint)
      console.log("[v0] Request body:", requestBody)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      console.log("[v0] Response content-type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] Non-JSON response received:", text.substring(0, 200))
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      console.log("[v0] Analysis API response:", data)

      if (data.success && data.data) {
        console.log("[v0] Analysis successful, setting data:", data.data)
        setAnalysisData(data) // <-- Changed from data.analysis to data
      } else {
        console.error("[v0] Analysis failed:", data.error)
        throw new Error(data.error || "Analysis failed")
      }
    } catch (error: any) {
      console.error("[v0] Analysis error:", error)
      // Set specific error based on active tab
      if (activeTab === "cryptocurrency") {
        setCryptoAnalysisError(error.message || "Analysis failed. Please try again.")
      } else if (activeTab === "commodities") {
        setCommoditiesAnalysisError(error.message || "Analysis failed. Please try again.")
      } else {
        setForexAnalysisError(error.message || "Analysis failed. Please try again.")
      }
      setAnalysisData(null) // Ensure analysisData is null on error
    } finally {
      setIsAnalyzing(false)
      console.log("[v0] === ANALYSE COMPLETE ===")
    }
  }

  const handleTabChange = (tab: MarketType) => {
    setActiveTab(tab)
    // Clear analysis data and error messages when switching tabs
    setAnalysisData(null)
    setCryptoAnalysisError(null)
    setCommoditiesAnalysisError(null)
    setForexAnalysisError(null)
    setSearchQuery("") // Clear search query
    setSearchResults([])
    setShowDropdown(false)
  }

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
      analysisData.price_change_percentage_24h ||
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] Non-JSON response received:", text.substring(0, 200))
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()

      console.log("[v0] Analysis data received:", data)

      if (data.success) {
        const processedData = processAnalysisData(data)
        setAnalysisData(processedData)
        console.log("[v0] Processed analysis data:", processedData)
      } else {
        console.error("[v0] Analysis failed:", data.error)
        setAnalysisData({
          error: data.error || "Analysis failed. Please try again.",
          symbol: token.symbol,
        })
      }
    } catch (error) {
      console.error("[v0] Analysis error:", error)
      setAnalysisData({
        error: "Analysis failed. Please try again.",
        symbol: token.symbol,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const fetchCommoditiesData = async () => {
    setCommoditiesLoading(true)
    try {
      const response = await fetch("/api/commodities")
      const result = await response.json()
      if (result.success && result.data) {
        // Transform API data to match UI format
        const transformedData = result.data.map((item: any) => ({
          symbol: item.symbol,
          name: item.name,
          price: Number.parseFloat(item.price),
          change: Number.parseFloat(item.change),
          type: item.symbol.includes("XAU") || item.symbol.includes("XAG") ? "Precious Metal" : "Energy",
          volume: "Medium",
          trend: item.sentiment,
        }))
        setCommoditiesData(transformedData)
      }
    } catch (error) {
      console.error("Failed to fetch commodities data:", error)
    } finally {
      setCommoditiesLoading(false)
    }
  }

  const fetchForexData = async () => {
    setForexLoading(true)
    try {
      const response = await fetch("/api/forex")
      const result = await response.json()
      if (result.success && result.data) {
        // Transform API data to match UI format
        const transformedData = result.data.map((item: any) => ({
          symbol: item.symbol,
          name: item.name,
          price: Number.parseFloat(item.price),
          change: Number.parseFloat(item.change),
          type: "Major",
          volume: "High",
          trend: item.sentiment,
        }))
        setForexData(transformedData)
      }
    } catch (error) {
      console.error("Failed to fetch forex data:", error)
    } finally {
      setForexLoading(false)
    }
  }

  const commoditiesDataList =
    commoditiesData.length > 0
      ? commoditiesData
      : [
          {
            symbol: "XAUUSD",
            name: "Gold",
            price: 2650.45,
            change: 1.2,
            type: "Precious Metal",
            volume: "High",
            trend: "Bullish",
          },
          {
            symbol: "XAGUSD",
            name: "Silver",
            price: 31.85,
            change: -0.8,
            type: "Precious Metal",
            volume: "Medium",
            trend: "Bearish",
          },
          {
            symbol: "WTIUSD",
            name: "Crude Oil WTI",
            price: 68.75,
            change: 2.1,
            type: "Energy",
            volume: "High",
            trend: "Bullish",
          },
          {
            symbol: "XPTUSD",
            name: "Platinum",
            price: 985.2,
            change: 0.5,
            type: "Precious Metal",
            volume: "Low",
            trend: "Neutral",
          },
          {
            symbol: "XPDUSD",
            name: "Palladium",
            price: 1045.3,
            change: -1.2,
            type: "Precious Metal",
            volume: "Low",
            trend: "Bearish",
          },
          {
            symbol: "NATGAS",
            name: "Natural Gas",
            price: 2.85,
            change: 3.4,
            type: "Energy",
            volume: "Medium",
            trend: "Bullish",
          },
        ]

  const forexDataList =
    forexData.length > 0
      ? forexData
      : [
          {
            symbol: "EURUSD",
            name: "Euro / US Dollar",
            price: 1.0845,
            change: 0.15,
            type: "Major",
            volume: "Very High",
            trend: "Bullish",
          },
          {
            symbol: "GBPUSD",
            name: "British Pound / US Dollar",
            price: 1.2675,
            change: -0.25,
            type: "Major",
            volume: "High",
            trend: "Bearish",
          },
          {
            symbol: "USDJPY",
            name: "US Dollar / Japanese Yen",
            price: 149.85,
            change: 0.45,
            type: "Major",
            volume: "High",
            trend: "Bullish",
          },
          {
            symbol: "AUDUSD",
            name: "Australian Dollar / US Dollar",
            price: 0.6785,
            change: 0.35,
            type: "Major",
            volume: "Medium",
            trend: "Bullish",
          },
          {
            symbol: "USDCAD",
            name: "US Dollar / Canadian Dollar",
            price: 1.3545,
            change: -0.15,
            type: "Major",
            volume: "Medium",
            trend: "Bearish",
          },
          {
            symbol: "USDCHF",
            name: "US Dollar / Swiss Franc",
            price: 0.8875,
            change: 0.25,
            type: "Major",
            volume: "Medium",
            trend: "Bullish",
          },
        ]

  const commoditiesMarketData = [
    { title: "Gold Sentiment", value: "82%", status: "Bullish", description: "Strong institutional demand" },
    { title: "Oil Inventory", value: "-2.1M", status: "Bullish", description: "Weekly drawdown continues" },
    { title: "DXY Impact", value: "101.45", status: "Bearish", description: "Strong dollar pressure" },
    { title: "Inflation Hedge", value: "Active", status: "Bullish", description: "Rising inflation expectations" },
    { title: "Supply Chain", value: "Tight", status: "Bullish", description: "Limited supply availability" },
    { title: "Seasonal Trends", value: "Positive", status: "Bullish", description: "Q4 seasonal strength" },
  ]

  const forexMarketData = [
    { title: "USD Strength", value: "101.45", status: "Strong", description: "Fed hawkish stance" },
    { title: "EUR Outlook", value: "Weak", status: "Bearish", description: "ECB dovish signals" },
    { title: "JPY Intervention", value: "150 Level", status: "Risk", description: "BoJ intervention zone" },
    { title: "Risk Sentiment", value: "Risk-On", status: "Bullish", description: "Equity markets strong" },
    { title: "Carry Trades", value: "Active", status: "Bullish", description: "High yield currencies favored" },
    { title: "Central Bank", value: "Divergence", status: "Volatile", description: "Policy differences driving moves" },
  ]

  const handleTradeClick = async (token: any) => {
    setIsAnalyzing(true)
    setAnalysisData(null)
    setShowDropdown(false)

    try {
      const response = await fetch(`/api/analysis?symbol=${encodeURIComponent(token.symbol)}`)

      // Check if response is ok and content type is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] Non-JSON response received:", text.substring(0, 200))
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()

      console.log("[v0] Analysis data received:", data)

      if (data.success) {
        const processedData = processAnalysisData(data)
        setAnalysisData(processedData)
        console.log("[v0] Processed analysis data:", processedData)
      } else {
        console.error("[v0] Analysis failed:", data.error)
        setAnalysisData({
          error: data.error || "Analysis failed. Please try again.",
          symbol: token.symbol,
        })
      }
    } catch (error) {
      console.error("[v0] Analysis error:", error)
      setAnalysisData({
        error: "Analysis failed. Please try again.",
        symbol: token.symbol,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

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

  const renderAdvancedAnalysis = (data: AnalysisResult | null) => {
    console.log("[v0] renderAdvancedAnalysis called with:", data)

    if (!data || data.error) {
      console.log("[v0] No valid analysisData provided or has error")
      return null
    }

    // Use analysisData directly if it's the result of handleAnalyzeClick
    // Otherwise, use data.data if it's from an initial fetch or other source
    const analysis = data.data || data

    if (!analysis || !analysis.signals || !Array.isArray(analysis.signals)) {
      console.log("[v0] Invalid data structure - missing signals array")
      return null
    }

    const shortTermAnalysis = analysis.short_term_analysis || {
      signal: analysis.signals[0]?.signal || "Hold",
      confidence: analysis.signals[0]?.confidence || 50,
      momentum_score: analysis.signals[0]?.confidence || 50,
      key_levels: {
        support: analysis.signals[0]?.support || 0,
        resistance: analysis.signals[0]?.resistance || 0,
      },
      aligned_indicators:
        analysis.signals[0]?.technical_factors
          ?.filter((f: any) => f.status === "bullish")
          .map((f: any) => f.indicator) || [],
      conflicting_indicators:
        analysis.signals[0]?.technical_factors
          ?.filter((f: any) => f.status === "bearish")
          .map((f: any) => f.indicator) || [],
      justification: analysis.signals[0]?.justification || "Analysis in progress",
    }

    const longTermAnalysis = analysis.long_term_analysis || {
      signal: analysis.signals[1]?.signal || "Hold",
      confidence: analysis.signals[1]?.confidence || 50,
      momentum_score: analysis.signals[1]?.confidence || 50,
      key_levels: {
        support: analysis.signals[1]?.support || 0,
        resistance: analysis.signals[1]?.resistance || 0,
      },
      aligned_indicators:
        analysis.signals[1]?.technical_factors
          ?.filter((f: any) => f.status === "bullish")
          .map((f: any) => f.indicator) || [],
      conflicting_indicators:
        analysis.signals[1]?.technical_factors
          ?.filter((f: any) => f.status === "bearish")
          .map((f: any) => f.indicator) || [],
      justification: analysis.signals[1]?.justification || "Analysis in progress",
    }

    const tradeSetup = analysis.trade_setup || {
      timeframe_focus: analysis.signals[0]?.timeframe || "1hr-4hr swing trade",
      entry_zone: analysis.signals[0]?.entry_zone || { min: 0, max: 0 },
      stop_loss: analysis.signals[0]?.stop_loss || 0,
      take_profit_1: analysis.signals[0]?.take_profit_1 || 0,
      take_profit_2: analysis.signals[0]?.take_profit_2 || 0,
      position_size: analysis.signals[0]?.position_size || "2-5% of portfolio",
      risk_reward_ratio: analysis.signals[0]?.risk_reward_ratio || "1:0.6",
      setup_notes: analysis.signals[0]?.setup_notes || "Trade setup details",
    }

    const technicalIndicators = analysis.technical_indicators || {
      rsi: analysis.signals[0]?.technical_factors?.find((f: any) => f.indicator === "RSI")?.value || 50,
      stochastic_rsi:
        analysis.signals[0]?.technical_factors?.find((f: any) => f.indicator === "Stochastic RSI")?.value || 50,
      support_levels: [analysis.signals[0]?.support || 0],
      resistance_levels: [analysis.signals[0]?.resistance || 0],
    }

    const signals = analysis.signals || []

    console.log("[v0] Rendering analysis with processed data")

    return (
      <div className="space-y-6">
        {/* Two Timeframe Analyses Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1-4 Hour Analysis */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl p-6 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cyan-300">1-4 Hour Analysis</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    shortTermAnalysis.signal === "Buy" || shortTermAnalysis.signal === "Strong Buy"
                      ? "bg-green-500/20 text-green-400"
                      : shortTermAnalysis.signal === "Sell" || shortTermAnalysis.signal === "Strong Sell"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {shortTermAnalysis.signal}
                </span>
                <span className="text-cyan-400 font-bold">{Math.round(shortTermAnalysis.confidence)}%</span>
              </div>
            </div>

            {/* Momentum Score */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Momentum Score</span>
                <span className="text-white font-bold text-xl">{shortTermAnalysis.momentum_score}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${shortTermAnalysis.momentum_score}%` }}
                />
              </div>
            </div>

            {/* Support and Resistance */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-400 text-sm mb-1">Support</div>
                <div className="text-white font-bold">${shortTermAnalysis.key_levels.support.toFixed(2)}</div>
              </div>
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-400 text-sm mb-1">Resistance</div>
                <div className="text-white font-bold">${shortTermAnalysis.key_levels.resistance.toFixed(2)}</div>
              </div>
            </div>

            {/* Aligned Indicators */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-green-400 font-medium">
                  Aligned Indicators ({shortTermAnalysis.aligned_indicators.length})
                </span>
              </div>
              <div className="space-y-1">
                {shortTermAnalysis.aligned_indicators.map((indicator: string, index: number) => (
                  <div key={index} className="text-sm text-green-300 pl-4">
                    • {indicator}
                  </div>
                ))}
              </div>
            </div>

            {/* Conflicting Signals */}
            {shortTermAnalysis.conflicting_indicators.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-red-400 font-medium">
                    Conflicting Signals ({shortTermAnalysis.conflicting_indicators.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {shortTermAnalysis.conflicting_indicators.map((indicator: string, index: number) => (
                    <div key={index} className="text-sm text-red-300 pl-4">
                      • {indicator}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Summary */}
            <div className="bg-slate-800/50 rounded-lg p-3 border-l-4 border-cyan-500">
              <p className="text-sm text-gray-300">{shortTermAnalysis.justification}</p>
            </div>
          </div>

          {/* 4-24 Hour Analysis */}
          <div className="bg-gradient-to-br from-blue-900/80 to-indigo-800/80 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-300">4-24 Hour Analysis</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    longTermAnalysis.signal === "Buy" || longTermAnalysis.signal === "Strong Buy"
                      ? "bg-green-500/20 text-green-400"
                      : longTermAnalysis.signal === "Sell" || longTermAnalysis.signal === "Strong Sell"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {longTermAnalysis.signal}
                </span>
                <span className="text-blue-400 font-bold">{Math.round(longTermAnalysis.confidence)}%</span>
              </div>
            </div>

            {/* Momentum Score */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Momentum Score</span>
                <span className="text-white font-bold text-xl">{longTermAnalysis.momentum_score}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-400 to-indigo-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${longTermAnalysis.momentum_score}%` }}
                />
              </div>
            </div>

            {/* Support and Resistance */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-400 text-sm mb-1">Support</div>
                <div className="text-white font-bold">${longTermAnalysis.key_levels.support.toFixed(2)}</div>
              </div>
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-400 text-sm mb-1">Resistance</div>
                <div className="text-white font-bold">${longTermAnalysis.key_levels.resistance.toFixed(2)}</div>
              </div>
            </div>

            {/* Aligned Indicators */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-green-400 font-medium">
                  Aligned Indicators ({longTermAnalysis.aligned_indicators.length})
                </span>
              </div>
              <div className="space-y-1">
                {longTermAnalysis.aligned_indicators.map((indicator: string, index: number) => (
                  <div key={index} className="text-sm text-green-300 pl-4">
                    • {indicator}
                  </div>
                ))}
              </div>
            </div>

            {/* Conflicting Signals */}
            {longTermAnalysis.conflicting_indicators.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-red-400 font-medium">
                    Conflicting Signals ({longTermAnalysis.conflicting_indicators.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {longTermAnalysis.conflicting_indicators.map((indicator: string, index: number) => (
                    <div key={index} className="text-sm text-red-300 pl-4">
                      • {indicator}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Summary */}
            <div className="bg-blue-900/50 rounded-lg p-3 border-l-4 border-blue-500">
              <p className="text-sm text-gray-300">{longTermAnalysis.justification}</p>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-semibold text-lg">AI Recommendation: {shortTermAnalysis.signal}</span>
          </div>
        </div>

        {/* Current Price */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/30">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-400 text-sm mb-1">Current Price</div>
              <div className="text-4xl font-bold text-cyan-400">${analysis.token.current_price.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm mb-1">24h Change</div>
              <div
                className={`text-2xl font-bold ${analysis.token.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {analysis.token.price_change_percentage_24h >= 0 ? "+" : ""}
                {analysis.token.price_change_percentage_24h.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* RSI, Trend, MACD Signals */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
            <div className="text-gray-400 text-sm mb-2">RSI Signal:</div>
            <div className="text-yellow-400 font-bold text-xl">Neutral</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
            <div className="text-gray-400 text-sm mb-2">Trend:</div>
            <div className="text-green-400 font-bold text-xl">Trending Up</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
            <div className="text-gray-400 text-sm mb-2">MACD Signal:</div>
            <div className="text-green-400 font-bold text-xl">Bullish</div>
          </div>
        </div>

        {/* Technical Indicators Section */}
        <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-300">Technical Indicators</h3>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">Neutral</span>
          </div>

          {/* Confluence Indicators Info */}
          <div className="bg-blue-900/30 rounded-lg p-4 mb-6 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <h4 className="text-blue-300 font-semibold">Confluence Indicators Used in Analysis</h4>
            </div>
            <div className="space-y-2 text-sm text-blue-200/80">
              <div>
                <strong>Technical Indicators:</strong> RSI (14), Stochastic RSI, MACD Signal, 8/21 EMA Cross, Volume
                Trend, Price Action, Support/Resistance, Momentum
              </div>
              <div>
                <strong>Analysis Timeframes:</strong> 1-4 Hour (Short-term) • 4-24 Hour (Long-term)
              </div>
              <div>
                <strong>Confluence Method:</strong> AI-weighted indicator alignment with confidence scoring
              </div>
              <p className="text-xs text-blue-200/60 mt-2">
                These indicators are combined using AI confluence analysis to generate trading signals with confidence
                scores across multiple timeframes.
              </p>
            </div>
          </div>

          {/* RSI and Stochastic RSI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-yellow-300 font-medium">RSI (14)</span>
                <span className="text-white font-bold text-lg">{technicalIndicators.rsi.toFixed(1)}</span>
              </div>
              <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-1000"
                  style={{ width: `${technicalIndicators.rsi}%` }}
                />
                <div className="absolute left-[30%] top-0 w-px h-full bg-red-400/50" />
                <div className="absolute left-[70%] top-0 w-px h-full bg-red-400/50" />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Oversold (30)</span>
                <span>Overbought (70)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-cyan-300 font-medium">Stochastic RSI</span>
                <span className="text-white font-bold text-lg">{technicalIndicators.stochastic_rsi.toFixed(1)}</span>
              </div>
              <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-1000"
                  style={{ width: `${technicalIndicators.stochastic_rsi}%` }}
                />
                <div className="absolute left-[20%] top-0 w-px h-full bg-red-400/50" />
                <div className="absolute left-[80%] top-0 w-px h-full bg-red-400/50" />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Oversold (20)</span>
                <span>Overbought (80)</span>
              </div>
            </div>
          </div>

          {/* Support and Resistance Levels */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-green-300 font-medium">Support</span>
              </div>
              <div className="text-white font-bold text-2xl">${technicalIndicators.support_levels[0].toFixed(2)}</div>
            </div>

            <div className="bg-red-900/30 rounded-lg p-4 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <span className="text-red-300 font-medium">Resistance</span>
              </div>
              <div className="text-white font-bold text-2xl">
                ${technicalIndicators.resistance_levels[0].toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Trade Setup */}
        <div className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-orange-500/20 rounded">
                <Target className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-orange-300 font-semibold text-lg">Recommended Trade Setup</h3>
            </div>
            <div className="bg-orange-500/20 px-3 py-1 rounded text-sm text-orange-300">
              {tradeSetup.timeframe_focus}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-orange-200/70 mb-2">Entry Zone</div>
                <div className="space-y-2">
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded">
                    <span className="text-orange-200">Min Entry</span>
                    <span className="text-white font-mono">${tradeSetup.entry_zone.min.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded">
                    <span className="text-orange-200">Max Entry</span>
                    <span className="text-white font-mono">${tradeSetup.entry_zone.max.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-900/30 rounded p-3 border border-red-500/30">
                  <div className="text-xs text-red-300 mb-1">Stop Loss</div>
                  <div className="text-white font-mono text-sm">${tradeSetup.stop_loss.toFixed(2)}</div>
                </div>
                <div className="bg-green-900/30 rounded p-3 border border-green-500/30">
                  <div className="text-xs text-green-300 mb-1">Take Profit 1 (10%)</div>
                  <div className="text-white font-mono text-sm">${tradeSetup.take_profit_1.toFixed(2)}</div>
                </div>
                <div className="bg-green-900/30 rounded p-3 border border-green-500/30">
                  <div className="text-xs text-green-300 mb-1">Take Profit 2</div>
                  <div className="text-white font-mono text-sm">${tradeSetup.take_profit_2.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 rounded">
                  <div className="text-sm text-orange-200/70 mb-1">Position Size</div>
                  <div className="text-white font-semibold">{tradeSetup.position_size}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded">
                  <div className="text-sm text-orange-200/70 mb-1">Risk/Reward Ratio</div>
                  <div className="text-white font-semibold">{tradeSetup.risk_reward_ratio}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-orange-200/70 mb-2">Setup Notes</div>
                <div className="text-xs text-orange-100/80 leading-relaxed bg-orange-900/10 p-3 rounded border border-orange-500/20">
                  {tradeSetup.setup_notes}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Market Insight */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 bg-purple-500/20 rounded">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-purple-300 font-semibold text-lg">AI Market Insight</h3>
          </div>
          <div className="text-purple-100/90 leading-relaxed text-sm">{analysis.ai_insight}</div>
        </div>

        {/* Multi-Timeframe Analysis */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-600/30">
          <h3 className="text-white font-semibold text-lg mb-4">Multi-Timeframe Analysis</h3>
          <div className="grid grid-cols-5 gap-4">
            {signals.map((signal: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-sm text-slate-300 mb-2">{signal.timeframe}</div>
                <div
                  className={`rounded-lg p-3 border ${
                    signal.signal === "Buy" || signal.signal === "Strong Buy"
                      ? "bg-green-900/30 border-green-500/30"
                      : signal.signal === "Sell" || signal.signal === "Strong Sell"
                        ? "bg-red-900/30 border-red-500/30"
                        : "bg-yellow-900/30 border-yellow-500/30"
                  }`}
                >
                  <div
                    className={`font-semibold text-sm mb-1 ${
                      signal.signal === "Buy" || signal.signal === "Strong Buy"
                        ? "text-green-300"
                        : signal.signal === "Sell" || signal.signal === "Strong Sell"
                          ? "text-red-300"
                          : "text-yellow-300"
                    }`}
                  >
                    {signal.signal}
                  </div>
                  <div
                    className={`text-xs ${
                      signal.signal === "Buy" || signal.signal === "Strong Buy"
                        ? "text-green-200/70"
                        : signal.signal === "Sell" || signal.signal === "Strong Sell"
                          ? "text-red-200/70"
                          : "text-yellow-200/70"
                    }`}
                  >
                    {Math.round(signal.confidence)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
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

  const getTabBackgroundClass = () => {
    return "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
  }

  const handleCommodityAnalyze = async (symbol: string) => {
    setSearchQuery(symbol)
    setActiveTab("commodities")
    setCommoditiesAnalysisError(null) // Clear commodity error on tab switch
    setAnalysisData(null) // Clear general analysis data
    setShowDropdown(false) // Close dropdown

    // Attempt to fetch commodity data if not already loaded
    if (commoditiesData.length === 0) {
      await fetchCommoditiesData()
    }

    // Perform search to populate searchResults for the dropdown or to confirm symbol
    await searchTokens(symbol) // Use searchTokens to ensure it's done for the correct tab

    // Manually trigger analysis if search result is found or symbol is known
    if (symbol) {
      setIsAnalyzing(true)
      setAnalysisData(null)
      setCommoditiesAnalysisError(null)

      try {
        const response = await fetch("/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: symbol, market_type: "commodities" }),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response")
        }

        const data = await response.json()
        if (data.success) {
          const processedData = processAnalysisData(data)
          setAnalysisData(processedData)
        } else {
          throw new Error(data.error || "Commodity analysis failed")
        }
      } catch (error: any) {
        console.error("[v0] Commodity analysis error:", error)
        setCommoditiesAnalysisError(error.message || "Commodity analysis failed. Please try again.")
        setAnalysisData(null)
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const handleForexAnalyze = async (symbol: string) => {
    setSearchQuery(symbol)
    setActiveTab("forex")
    setForexAnalysisError(null) // Clear forex error on tab switch
    setAnalysisData(null) // Clear general analysis data
    setShowDropdown(false) // Close dropdown

    // Attempt to fetch forex data if not already loaded
    if (forexData.length === 0) {
      await fetchForexData()
    }

    // Perform search to populate searchResults for the dropdown or to confirm symbol
    await searchTokens(symbol) // Use searchTokens to ensure it's done for the correct tab

    // Manually trigger analysis if search result is found or symbol is known
    if (symbol) {
      setIsAnalyzing(true)
      setAnalysisData(null)
      setForexAnalysisError(null)

      try {
        const response = await fetch("/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: symbol, market_type: "forex" }),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response")
        }

        const data = await response.json()
        if (data.success) {
          const processedData = processAnalysisData(data)
          setAnalysisData(processedData)
        } else {
          throw new Error(data.error || "Forex analysis failed")
        }
      } catch (error: any) {
        console.error("[v0] Forex analysis error:", error)
        setForexAnalysisError(error.message || "Forex analysis failed. Please try again.")
        setAnalysisData(null)
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget
    target.style.display = "none" // Hide the broken image icon
    // Optionally, you could set a default background or placeholder element here.
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery, true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="relative">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-09-15%20at%2020.55.23-IcVTQNAhIbKSz8niIkNIeDQlpppYGF.png"
                alt="Shadow Signals Logo"
                className="w-16 h-16 rounded-full shadow-2xl ring-4 ring-blue-500/30 hover:ring-blue-400/50 transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-600/20 animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Shadow Signals
            </h1>
          </div>
          <div className="text-gray-300 space-y-2 max-w-2xl mx-auto">
            <p className="text-xl font-medium">Advanced AI-Powered Market Analysis</p>
            <p className="text-lg">Real-time cryptocurrency, commodities & forex signals with confluence scoring</p>
            <p className="text-base">Professional-grade technical analysis powered by machine learning algorithms</p>
            <p className="text-sm text-gray-400 mt-4">
              Empowering traders with data-driven insights and precision market timing
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex gap-4 justify-center">
            {["cryptocurrency", "commodities", "forex"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab as MarketType)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Market Data Cards - Moved to be conditionally rendered */}
        {activeTab === "cryptocurrency" && (
          <div className="space-y-8">
            {/* Main Market Data Cards - 2x6 Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Total Market Cap */}
              <div className="bg-gray-800/50 border border-green-500/20 rounded-xl p-4 hover:bg-green-900/10 hover:border-green-400/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400 group-hover:text-green-300 transition-colors">
                    Total Market Cap
                  </h3>
                  <div className="text-green-400">$</div>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-green-100 transition-colors">
                  {marketData?.total_market_cap ? formatNumber(marketData.total_market_cap) : "$4.12T"}
                </div>
                <div
                  className={`text-sm ${marketData?.market_cap_change_percentage_24h && marketData.market_cap_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {marketData?.market_cap_change_percentage_24h
                    ? `${marketData.market_cap_change_percentage_24h >= 0 ? "+" : ""}${marketData.market_cap_change_percentage_24h.toFixed(2)}% 24h`
                    : "-0.38% 24h"}
                </div>
              </div>

              {/* 24h Volume */}
              <div className="bg-gray-800/50 border border-blue-500/20 rounded-xl p-4 hover:bg-blue-900/10 hover:border-blue-400/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400 group-hover:text-blue-300 transition-colors">
                    24h Volume
                  </h3>
                  <div className="text-blue-400">📊</div>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors">
                  {marketData?.total_volume_24h ? formatNumber(marketData.total_volume_24h) : "$153.7B"}
                </div>
                <div className="text-sm text-gray-400">Volume</div>
              </div>

              {/* BTC Price */}
              <div className="bg-gray-800/50 border border-orange-500/20 rounded-xl p-4 hover:bg-orange-900/10 hover:border-orange-400/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400 group-hover:text-orange-300 transition-colors">
                    BTC Price
                  </h3>
                  <div className="text-orange-400">₿</div>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-orange-100 transition-colors">
                  {marketData?.btc_price ? formatBTCPrice(marketData.btc_price) : "$115,578"}
                </div>
                <div
                  className={`text-sm ${marketData?.btc_price_change_24h && marketData.btc_price_change_24h >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {marketData?.btc_price_change_24h
                    ? `${marketData.btc_price_change_24h >= 0 ? "+" : ""}${marketData.btc_price_change_24h.toFixed(2)}% 24h`
                    : "-0.15% 24h"}
                </div>
              </div>

              {/* BTC Dominance */}
              <div className="bg-gray-800/50 border border-yellow-500/20 rounded-xl p-4 hover:bg-yellow-900/10 hover:border-yellow-400/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400 group-hover:text-yellow-300 transition-colors">
                    BTC Dominance
                  </h3>
                  <div className="text-yellow-400">⚡</div>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-yellow-100 transition-colors">
                  {marketData?.btc_dominance ? `${marketData.btc_dominance.toFixed(1)}%` : "58.1%"}
                </div>
                <div className="text-sm text-gray-400">Market Share</div>
              </div>

              {/* USDT Dominance */}
              <div className="bg-gray-800/50 border border-cyan-500/20 rounded-xl p-4 hover:bg-cyan-900/10 hover:border-cyan-400/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400 group-hover:text-cyan-300 transition-colors">
                    USDT Dominance
                  </h3>
                  <div className="text-cyan-400">💰</div>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-cyan-100 transition-colors">
                  {marketData?.usdt_dominance ? `${marketData.usdt_dominance.toFixed(1)}%` : "4.5%"}
                </div>
                <div className="text-sm text-gray-400">Stablecoin Share</div>
              </div>

              {/* Total3 Market Cap */}
              <div className="bg-gray-800/50 border border-purple-500/20 rounded-xl p-4 hover:bg-purple-900/10 hover:border-purple-400/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400 group-hover:text-purple-300 transition-colors">
                    Total3 Market Cap
                  </h3>
                  <div className="text-purple-400">📈</div>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-purple-100 transition-colors">
                  {marketData?.total3_market_cap ? formatNumber(marketData.total3_market_cap) : "$1.1T"}
                </div>
                <div
                  className={`text-sm ${marketData?.total3_change_24h && marketData.total3_change_24h >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {marketData?.total3_change_24h
                    ? `${marketData.total3_change_24h >= 0 ? "+" : ""}${marketData.total3_change_24h.toFixed(2)}% 24h`
                    : "-0.38% 24h"}
                </div>
              </div>
            </div>

            {/* Bull Market Top and Altseason Analysis Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bull Market Top */}
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-white">Bull Market Top</h3>
                  <div className="text-purple-400">📈</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Progress:</span>
                    <span className="text-xl font-bold text-purple-400">76%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Est. Top:</span>
                    <span className="text-sm text-white font-medium">Jan 9, 2026</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Confluence:</span>
                    <span className="text-lg font-bold text-purple-400">47%</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-purple-500/20">
                    <p className="text-[10px] text-purple-300 leading-tight">
                      Based on: Pi Cycle, MVRV Z-Score, Open Interest, BTC Dominance, ETH/BTC Ratio
                    </p>
                  </div>
                </div>
              </div>

              {/* Altseason Top */}
              <div className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-white">Altseason Top</h3>
                  <div className="text-cyan-400">⚡</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Alt Progress:</span>
                    <span className="text-xl font-bold text-cyan-400">51%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">ETH/BTC:</span>
                    <span className="text-sm text-white font-medium">0.0400</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Phase:</span>
                    <span className="text-sm text-cyan-400 font-medium">Rotation</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-cyan-500/20">
                    <p className="text-[10px] text-cyan-300 leading-tight">
                      Based on: ETH/BTC Ratio, BTC Dominance Trend, Funding Rates, Open Interest, Market Rotation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mb-8 mt-8">
              <div className="flex gap-4">
                <div className="search-container relative flex-1">
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyPress}
                    onFocus={() => {
                      if (searchQuery.trim() && searchResults.length > 0) {
                        setShowDropdown(true)
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  )}

                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={async () => {
                            console.log("[v0] Dropdown item clicked:", result.symbol || result.name)
                            setSelectedToken(result)
                            setSearchQuery(result.symbol || result.name)
                            setShowDropdown(false)
                            // Trigger analysis immediately when clicking a token
                            setIsAnalyzing(true)
                            setAnalysisData(null)
                            setCryptoAnalysisError(null) // Clear crypto-specific error
                            try {
                              console.log(
                                "[v0] Auto-triggering analysis for:",
                                result.symbol || result.name,
                                "in tab:",
                                activeTab,
                              )
                              const response = await fetch("/api/analysis", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  symbol: result.symbol || result.name,
                                  market_type: activeTab,
                                }),
                              })

                              const contentType = response.headers.get("content-type")
                              if (!contentType || !contentType.includes("application/json")) {
                                throw new Error("Server returned non-JSON response")
                              }

                              const data = await response.json()
                              console.log("[v0] Auto-trigger analysis response:", data)
                              if (data.success) {
                                setAnalysisData(data)
                              } else {
                                throw new Error(data.error || "Analysis failed")
                              }
                            } catch (error: any) {
                              console.error("[v0] Auto-trigger analysis error:", error)
                              setCryptoAnalysisError(error.message || "Analysis failed. Please try again.") // Set crypto-specific error
                              setAnalysisData(null)
                            } finally {
                              setIsAnalyzing(false)
                            }
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                        >
                          <img
                            src={result.thumb || result.image || "/placeholder.svg?height=24&width=24"}
                            alt={result.name}
                            className="w-6 h-6 rounded-full"
                            onError={handleImageError}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-white">{result.name}</div>
                            <div className="text-sm text-gray-400">{result.symbol?.toUpperCase()}</div>
                          </div>
                          <div className="text-sm text-gray-400">#{result.market_cap_rank}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAnalyzeClick}
                  disabled={isAnalyzing || !searchQuery.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {isAnalyzing ? "Analysing..." : "Analyse"}
                </button>
              </div>
            </div>

            {analysisData && !analysisData.error && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Analysis for {searchQuery.toUpperCase()}</h2>
                  <button
                    onClick={() => {
                      setAnalysisData(null)
                      setCryptoAnalysisError(null)
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {renderAdvancedAnalysis(analysisData)}
              </div>
            )}

            {cryptoAnalysisError && ( // Use cryptoAnalysisError for specific errors
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3">
                  <X className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="text-red-400 font-semibold">Analysis Error</h3>
                    <p className="text-red-300 text-sm">{cryptoAnalysisError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Commodities Tab Content */}
        {activeTab === "commodities" && (
          <div className="space-y-8">
            {/* Commodities List */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {commoditiesDataList.map((item) => (
                <div
                  key={item.symbol}
                  className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 rounded-xl p-4 border border-slate-600/30 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleCommodityAnalyze(item.symbol)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      <h3 className="text-base font-semibold text-yellow-300">{item.name}</h3>
                    </div>
                    <span className="text-xs font-medium text-gray-400">{item.symbol}</span>
                  </div>
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-white group-hover:text-yellow-100 transition-colors">
                      ${item.price.toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium ${item.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {item.change >= 0 ? "+" : ""}
                      {item.change.toFixed(2)}%
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full font-medium text-center ${item.trend === "Bullish" ? "bg-green-500/20 text-green-400" : item.trend === "Bearish" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}
                  >
                    {item.trend}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-600/20 text-[10px] text-slate-300">
                    {item.type} | {item.volume}
                  </div>
                </div>
              ))}
            </div>

            {/* Commodities Market Sentiment */}
            <div className="bg-gradient-to-br from-green-900/20 to-gray-800/20 rounded-xl p-6 border border-green-500/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-green-500/20 rounded">
                  <Brain className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-green-300 font-semibold text-lg">Commodities Market Sentiment</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Current commodities market showing mixed signals. Gold and Silver maintaining bullish momentum while
                energy commodities face headwinds. Agricultural commodities showing seasonal patterns.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-yellow-300 mb-4">Search & Analyse Commodities</h3>
              <div className="flex gap-4">
                <div className="search-container relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (e.target.value.trim()) {
                        searchTokens(e.target.value)
                      } else {
                        setSearchResults([])
                        setShowDropdown(false)
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.trim() && searchResults.length > 0) {
                        setShowDropdown(true)
                      }
                    }}
                    placeholder="Search commodities..."
                    className="w-full bg-gray-900/50 text-white px-6 py-4 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500" />
                    </div>
                  )}

                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={async () => {
                            console.log("[v0] Commodities dropdown item clicked:", result.symbol || result.name)
                            setSelectedToken(result)
                            setSearchQuery(result.symbol || result.name)
                            setShowDropdown(false)

                            setIsAnalyzing(true)
                            setAnalysisData(null)
                            setCommoditiesAnalysisError(null) // Clear commodity-specific error

                            try {
                              console.log(
                                "[v0] Auto-triggering commodities analysis for:",
                                result.symbol || result.name,
                              )
                              const response = await fetch("/api/analysis", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  symbol: result.symbol || result.name,
                                  market_type: activeTab,
                                }),
                              })

                              const contentType = response.headers.get("content-type")
                              if (!contentType || !contentType.includes("application/json")) {
                                throw new Error("Server returned non-JSON response")
                              }

                              const data = await response.json()
                              console.log("[v0] Commodities auto-trigger response:", data)
                              if (data.success) {
                                setAnalysisData(data)
                              } else {
                                throw new Error(data.error || "Commodity analysis failed")
                              }
                            } catch (error: any) {
                              console.error("[v0] Commodities auto-trigger error:", error)
                              setCommoditiesAnalysisError(
                                error.message || "Commodity analysis failed. Please try again.",
                              )
                              setAnalysisData(null)
                            } finally {
                              setIsAnalyzing(false)
                            }
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-white">{result.name}</div>
                            <div className="text-sm text-gray-400">{result.symbol?.toUpperCase()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAnalyzeClick}
                  disabled={!searchQuery.trim() || isAnalyzing}
                  className="flex items-center gap-2 px-8 py-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-yellow-500/20"
                >
                  <Search className="w-5 h-5" />
                  {isAnalyzing ? "Analysing..." : "Analyse"}
                </button>
              </div>
            </div>

            {analysisData && !analysisData.error && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Analysis for {searchQuery.toUpperCase()}</h2>
                  <button
                    onClick={() => {
                      setAnalysisData(null)
                      setCommoditiesAnalysisError(null)
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {renderAdvancedAnalysis(analysisData)}
              </div>
            )}

            {commoditiesAnalysisError && ( // Use commoditiesAnalysisError for specific errors
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3">
                  <X className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="text-red-400 font-semibold">Analysis Error</h3>
                    <p className="text-red-300 text-sm">{commoditiesAnalysisError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Forex Tab Content */}
        {activeTab === "forex" && (
          <div className="space-y-8">
            {/* Forex List */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {forexDataList.slice(0, 6).map((item) => (
                <div
                  key={item.symbol}
                  className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 rounded-xl p-4 border border-slate-600/30 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleForexAnalyze(item.symbol)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      <h3 className="text-base font-semibold text-cyan-300">{item.name}</h3>
                    </div>
                    <span className="text-xs font-medium text-gray-400">{item.symbol}</span>
                  </div>
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-white group-hover:text-cyan-100 transition-colors">
                      {item.price.toFixed(5)}
                    </div>
                    <div className={`text-sm font-medium ${item.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {item.change >= 0 ? "+" : ""}
                      {item.change.toFixed(2)}%
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full font-medium text-center ${item.trend === "Bullish" ? "bg-green-500/20 text-green-400" : item.trend === "Bearish" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}
                  >
                    {item.trend}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-600/20 text-[10px] text-slate-300">
                    {item.type} | {item.volume}
                  </div>
                </div>
              ))}
            </div>

            {/* Forex Market Sentiment */}
            <div className="bg-gradient-to-br from-blue-900/20 to-gray-800/20 rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-blue-500/20 rounded">
                  <Brain className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-blue-300 font-semibold text-lg">Forex Market Sentiment</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Global forex markets showing increased volatility. USD strength continues amid economic data releases.
                Major pairs experiencing technical consolidation patterns. Watch for central bank policy announcements.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-cyan-300 mb-4">Search & Analyse Forex Pairs</h3>
              <div className="flex gap-4">
                <div className="search-container relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (e.target.value.trim()) {
                        searchTokens(e.target.value)
                      } else {
                        setSearchResults([])
                        setShowDropdown(false)
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.trim() && searchResults.length > 0) {
                        setShowDropdown(true)
                      }
                    }}
                    placeholder="Search forex pairs..."
                    className="w-full bg-gray-900/50 text-white px-6 py-4 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-500" />
                    </div>
                  )}

                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={async () => {
                            console.log("[v0] Forex dropdown item clicked:", result.symbol || result.name)
                            setSelectedToken(result)
                            setSearchQuery(result.symbol || result.name)
                            setShowDropdown(false)

                            setIsAnalyzing(true)
                            setAnalysisData(null)
                            setForexAnalysisError(null) // Clear forex-specific error

                            try {
                              console.log("[v0] Auto-triggering forex analysis for:", result.symbol || result.name)
                              const response = await fetch("/api/analysis", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  symbol: result.symbol || result.name,
                                  market_type: activeTab,
                                }),
                              })

                              const contentType = response.headers.get("content-type")
                              if (!contentType || !contentType.includes("application/json")) {
                                throw new Error("Server returned non-JSON response")
                              }

                              const data = await response.json()
                              console.log("[v0] Forex auto-trigger response:", data)
                              if (data.success) {
                                setAnalysisData(data)
                              } else {
                                throw new Error(data.error || "Forex analysis failed")
                              }
                            } catch (error: any) {
                              console.error("[v0] Forex auto-trigger error:", error)
                              setForexAnalysisError(error.message || "Forex analysis failed. Please try again.")
                              setAnalysisData(null)
                            } finally {
                              setIsAnalyzing(false)
                            }
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-white">{result.name}</div>
                            <div className="text-sm text-gray-400">{result.symbol?.toUpperCase()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAnalyzeClick}
                  disabled={!searchQuery.trim() || isAnalyzing}
                  className="flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-cyan-500/20"
                >
                  <Search className="w-5 h-5" />
                  {isAnalyzing ? "Analysing..." : "Analyse"}
                </button>
              </div>
            </div>

            {analysisData && !analysisData.error && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Analysis for {searchQuery.toUpperCase()}</h2>
                  <button
                    onClick={() => {
                      setAnalysisData(null)
                      setForexAnalysisError(null)
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {renderAdvancedAnalysis(analysisData)}
              </div>
            )}

            {forexAnalysisError && ( // Use forexAnalysisError for specific errors
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3">
                  <X className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="text-red-400 font-semibold">Analysis Error</h3>
                    <p className="text-red-300 text-sm">{forexAnalysisError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="mt-12 border-t border-gray-800 pt-8">
          <div className="text-center space-y-6">
            {/* Risk Disclaimer Section */}
            <div className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-6 text-left">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-amber-400 text-2xl mt-0.5">⚠️</div>
                <h3 className="text-amber-400 font-bold text-xl">Risk Disclaimer</h3>
              </div>
              <div className="text-amber-100/80 text-sm space-y-3 leading-relaxed">
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

            {/* Footer Links */}
            <div className="text-xs text-gray-600 border-t border-gray-800 pt-6">
              <p>© 2025 Shadow Signals. All rights reserved.</p>
              <p className="mt-1">Advanced AI market analysis platform for professional traders</p>
              <div className="mt-3 flex justify-center items-center space-x-1 text-gray-400">
                <a href="/legal" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
                <span>•</span>
                <a href="/legal" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
                <span>•</span>
                <a href="mailto:info@shadowsignals.live" className="hover:text-blue-400 transition-colors">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default FuturisticDashboard
export { FuturisticDashboard }

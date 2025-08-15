"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  TrendingUp,
  DollarSign,
  Activity,
  Search,
  RefreshCw,
  Zap,
  BarChart3,
  Target,
  Shield,
  AlertTriangle,
  Clock,
  Calendar,
  TrendingDown,
  Calculator,
} from "lucide-react"

interface MarketOverview {
  total_market_cap: number
  total_volume_24h: number
  market_cap_change_percentage_24h: number
  active_cryptocurrencies: number
  usdt_pairs_count: number
  active_analysis_count: number
}

interface SearchResult {
  id: string
  symbol: string
  name: string
  market_cap_rank: number
  thumb: string
}

interface AnalysisResult {
  token: any
  signals: any[]
  technical_indicators: any
  trade_setup: any
  ai_insight: string
  last_analysis: string
}

export function FuturisticDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [marketData, setMarketData] = useState<MarketOverview | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")

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
      const response = await fetch("/api/market-overview")
      const data = await response.json()
      if (data.success) {
        setMarketData(data.data)
        setLastUpdated(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error("Failed to fetch market data:", error)
    }
  }

  const performSearch = async (query: string, selectFirst = true) => {
    if (!query.trim()) {
      setSelectedToken(null)
      setSearchResults([])
      setAnalysisData(null)
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    try {
      // Search for tokens
      const searchResponse = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`)
      const searchData = await searchResponse.json()

      if (searchData.success && searchData.data.length > 0) {
        setSearchResults(searchData.data)
        setShowDropdown(!selectFirst)

        if (selectFirst) {
          const firstResult = searchData.data[0]
          await selectToken(firstResult)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
      setShowDropdown(false)
    } finally {
      setIsSearching(false)
    }
  }

  const selectToken = async (token: SearchResult) => {
    setSelectedToken(token.symbol.toUpperCase())
    setSearchQuery(`${token.symbol.toUpperCase()} - ${token.name}`)
    setShowDropdown(false)
    setIsSearching(true)

    try {
      // Get analysis for the selected token
      const analysisResponse = await fetch(`/api/analysis?id=${encodeURIComponent(token.id)}`)
      const analysisData = await analysisResponse.json()

      if (analysisData.success) {
        setAnalysisData(analysisData.data)
      }
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

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

  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    return `$${num.toLocaleString()}`
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Shadow Signals</h1>
              <p className="text-slate-400 text-sm">USDT Trading Pairs & Confluence Analysis</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">Last updated: {lastUpdated || "Loading..."}</span>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                onClick={fetchMarketData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800 hover:border-green-500/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Total Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {marketData ? formatNumber(marketData.total_market_cap) : "Loading..."}
                  </div>
                  <div
                    className={`text-sm ${marketData?.market_cap_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {marketData
                      ? `${marketData.market_cap_change_percentage_24h >= 0 ? "+" : ""}${marketData.market_cap_change_percentage_24h.toFixed(2)}% 24h`
                      : "..."}
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">24h Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {marketData ? formatNumber(marketData.total_volume_24h) : "Loading..."}
                  </div>
                  <div className="text-sm text-slate-400">Volume</div>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">USDT Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {marketData ? marketData.usdt_pairs_count.toLocaleString() : "Loading..."}
                  </div>
                  <div className="text-sm text-slate-400">Active</div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Active Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {marketData ? marketData.active_analysis_count.toLocaleString() : "Loading..."}
                  </div>
                  <div className="text-sm text-slate-400">Running</div>
                </div>
                <Zap className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search Bar with Dropdown */}
        <div className="relative search-container">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 z-10" />
          <Input
            type="text"
            placeholder="Search USDT pairs (e.g., BTC, ETH, SUPER, SONIC)..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            className="w-full pl-12 pr-4 py-4 text-lg bg-slate-900/50 border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20 text-white placeholder:text-slate-400"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
              <RefreshCw className="h-5 w-5 text-cyan-400 animate-spin" />
            </div>
          )}

          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
              {searchResults.slice(0, 10).map((result) => (
                <button
                  key={result.id}
                  onClick={() => selectToken(result)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-b-0 flex items-center gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold text-sm">{result.symbol.slice(0, 1)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{result.symbol.toUpperCase()}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400 text-sm">{result.name}</span>
                    </div>
                    <div className="text-xs text-slate-500">Rank #{result.market_cap_rank}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Confluence Analysis Results */}
        {analysisData && selectedToken && !isSearching && (
          <div className="space-y-6">
            {/* Token Header */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <span className="text-cyan-400 font-bold text-sm">{selectedToken.slice(0, 1)}</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">{selectedToken}/USDT Confluence Analysis</CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {analysisData.signals.length > 0 && (
                      <>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          {analysisData.signals[0].confidence}% confidence
                        </Badge>
                        <Badge
                          className={`${
                            analysisData.signals[0].signal.includes("Buy")
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : analysisData.signals[0].signal.includes("Sell")
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {analysisData.signals[0].signal}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* AI Recommendation */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <CardTitle className="text-green-400">
                    AI Recommendation: {analysisData.signals[0]?.signal || "Hold"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">RSI Signal:</div>
                    <div className="text-white font-medium">
                      {analysisData.technical_indicators.rsi < 30
                        ? "Oversold"
                        : analysisData.technical_indicators.rsi > 70
                          ? "Overbought"
                          : "Neutral"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Trend:</div>
                    <div className="text-white font-medium">{analysisData.technical_indicators.trend_direction}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">24h Change:</div>
                    <div
                      className={`font-medium ${analysisData.token.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {analysisData.token.price_change_percentage_24h >= 0 ? "+" : ""}
                      {analysisData.token.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-yellow-400" />
                    <CardTitle className="text-white">Technical Indicators</CardTitle>
                  </div>
                  <Badge
                    className={`${
                      analysisData.technical_indicators.rsi < 30
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : analysisData.technical_indicators.rsi > 70
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }`}
                  >
                    {analysisData.technical_indicators.rsi < 30
                      ? "Oversold"
                      : analysisData.technical_indicators.rsi > 70
                        ? "Overbought"
                        : "Neutral"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* RSI and Stochastic RSI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">RSI (14)</span>
                      <span className="text-yellow-400 font-bold">
                        {analysisData.technical_indicators.rsi.toFixed(1)}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={analysisData.technical_indicators.rsi} className="h-3 bg-slate-800" />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Oversold (30)</span>
                        <span>Overbought (70)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Stochastic RSI</span>
                      <span className="text-cyan-400 font-bold">
                        {analysisData.technical_indicators.stochastic_rsi?.toFixed(1) || "50.0"}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={analysisData.technical_indicators.stochastic_rsi || 50}
                        className="h-3 bg-slate-800"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Oversold (20)</span>
                        <span>Overbought (80)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support & Resistance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-medium">Support</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {formatPrice(analysisData.technical_indicators.support_level)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-500/10 border-red-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <span className="text-red-400 font-medium">Resistance</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {formatPrice(analysisData.technical_indicators.resistance_level)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <CardTitle className="text-blue-400">Short-Term Outlook</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {analysisData.technical_indicators.short_term_outlook}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <CardTitle className="text-purple-400">Long-Term Outlook</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {analysisData.technical_indicators.long_term_outlook}
                  </p>
                </CardContent>
              </Card>
            </div>

            {analysisData.trade_setup && (
              <Card className="bg-orange-500/10 border-orange-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-orange-400" />
                      <CardTitle className="text-orange-400">Recommended Trade Setup</CardTitle>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {analysisData.trade_setup.timeframe_focus || "1hr-4hr setup"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Entry Zone */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Entry Zone</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-sm text-slate-400">Min Entry</div>
                        <div className="text-lg font-bold text-white">
                          {formatPrice(analysisData.trade_setup.entry_zone.min)}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-sm text-slate-400">Max Entry</div>
                        <div className="text-lg font-bold text-white">
                          {formatPrice(analysisData.trade_setup.entry_zone.max)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stop Loss and Take Profits */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="h-4 w-4 text-red-400" />
                        <span className="text-red-400 font-medium text-sm">Stop Loss</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {formatPrice(analysisData.trade_setup.stop_loss)}
                      </div>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-medium text-sm">Take Profit 1 (10%)</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {formatPrice(analysisData.trade_setup.take_profit_1)}
                      </div>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-medium text-sm">Take Profit 2</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {formatPrice(analysisData.trade_setup.take_profit_2)}
                      </div>
                    </div>
                  </div>

                  {/* Risk Management */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">Position Size</div>
                      <div className="text-white font-medium">{analysisData.trade_setup.position_size}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">Risk/Reward Ratio</div>
                      <div className="text-white font-medium">{analysisData.trade_setup.risk_reward_ratio}</div>
                    </div>
                  </div>

                  {/* Setup Notes */}
                  <div className="bg-slate-800/30 p-4 rounded-lg border-l-4 border-orange-400">
                    <h5 className="text-orange-400 font-medium mb-2">Setup Notes</h5>
                    <p className="text-sm text-slate-300">{analysisData.trade_setup.setup_notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insight */}
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-purple-400">AI Market Insight</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 leading-relaxed">{analysisData.ai_insight}</p>
              </CardContent>
            </Card>

            {/* Multi-timeframe Signals */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Multi-Timeframe Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {analysisData.signals.map((signal: any, index: number) => (
                    <div key={index} className="text-center">
                      <div className="text-sm text-slate-400 mb-1">{signal.timeframe}</div>
                      <Badge
                        className={`${
                          signal.signal.includes("Buy")
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : signal.signal.includes("Sell")
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }`}
                      >
                        {signal.signal}
                      </Badge>
                      <div className="text-xs text-slate-500 mt-1">{signal.confidence}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!selectedToken && !isSearching && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">Search for a token to begin analysis</h3>
            <p className="text-slate-500">Enter a token symbol above to get AI-powered confluence analysis</p>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm mt-12">
        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-red-400 font-semibold mb-2">Risk Disclaimer</h3>
                <div className="text-sm text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>
                      Cryptocurrency trading involves substantial risk and may result in significant financial losses.
                    </strong>{" "}
                    All analysis, signals, and recommendations provided by Shadow Signals are for educational and
                    informational purposes only and should not be considered as financial advice.
                  </p>
                  <p>
                    Past performance does not guarantee future results. The volatile nature of cryptocurrency markets
                    means that prices can fluctuate dramatically within short periods. You should never invest more than
                    you can afford to lose.
                  </p>
                  <p>
                    Our AI-powered analysis uses technical indicators and market data to generate trading signals, but
                    these are not guarantees of future price movements. Market conditions can change rapidly, and
                    external factors may significantly impact cryptocurrency prices.
                  </p>
                  <p>
                    <strong>
                      Always conduct your own research and consider consulting with a qualified financial advisor before
                      making any investment decisions.
                    </strong>{" "}
                    Shadow Signals and its operators are not responsible for any trading losses incurred based on the
                    information provided on this platform.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <a href="/legal" className="hover:text-cyan-400 transition-colors">
                    Privacy Policy
                  </a>
                  <span>•</span>
                  <a href="/legal" className="hover:text-cyan-400 transition-colors">
                    Terms of Service
                  </a>
                  <span>•</span>
                  <a href="mailto:info@shadowsignals.live" className="hover:text-cyan-400 transition-colors">
                    Contact Support
                  </a>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  © 2024 Shadow Signals. All rights reserved. | Trade responsibly and never risk more than you can
                  afford to lose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

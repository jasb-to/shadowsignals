"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TokenAnalysis } from "@/components/token-analysis"
import { apiClient } from "@/lib/enhanced-multi-api-client"
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Database,
  BarChart3,
  Globe,
  Zap,
  Clock,
  Target,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"
import type { MarketOverview, SearchResult, AnalysisResult } from "@/lib/types"

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [marketData, setMarketData] = useState<MarketOverview>({
    total_market_cap: 1800000000000,
    total_volume_24h: 85000000000,
    market_cap_change_percentage_24h: 1.8,
    active_cryptocurrencies: 2500,
    usdt_pairs_count: 850,
    active_analysis_count: 200,
  })
  const [isLoadingMarket, setIsLoadingMarket] = useState(false)

  useEffect(() => {
    loadMarketData()
    const interval = setInterval(loadMarketData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const loadMarketData = async () => {
    setIsLoadingMarket(true)
    try {
      const response = await apiClient.getMarketOverview()
      if (response.success && response.data) {
        setMarketData(response.data)
      }
    } catch (error) {
      console.warn("Failed to load market data:", error)
    } finally {
      setIsLoadingMarket(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)
    setSearchResults([])

    try {
      const response = await apiClient.searchTokens(searchQuery)
      if (response.success && response.data) {
        setSearchResults(response.data)
        if (response.data.length === 0) {
          setError("No tokens found matching your search.")
        }
      } else {
        setError(response.error || "Search failed. Please try again.")
      }
    } catch (error) {
      setError("Search service is temporarily unavailable.")
    } finally {
      setIsSearching(false)
    }
  }

  const analyzeToken = async (tokenId: string) => {
    setSelectedToken(tokenId)
    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)

    try {
      const response = await fetch(`/api/analysis?id=${encodeURIComponent(tokenId)}`)
      const data = await response.json()

      if (data.success && data.data) {
        setAnalysisResult(data.data)
        setSearchResults([]) // Clear search results after successful analysis
      } else {
        setError(data.error || "Analysis failed. Please try again.")
      }
    } catch (error) {
      setError("Analysis service is temporarily unavailable.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleQuickSearch = (token: string) => {
    setSearchQuery(token)
    analyzeToken(token.toLowerCase())
  }

  const clearResults = () => {
    setAnalysisResult(null)
    setSelectedToken(null)
    setSearchResults([])
    setError(null)
    setSearchQuery("")
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${value.toLocaleString()}`
  }

  const popularTokens = [
    "BTC",
    "ETH",
    "AI16Z",
    "THETA",
    "VIRTUALS",
    "SEI",
    "SUPER",
    "SONIC",
    "PEPE",
    "SHIB",
    "DOGE",
    "RENDER",
    "FET",
    "OCEAN",
    "UNI",
    "AAVE",
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "grid-move 20s linear infinite",
          }}
        />
      </div>

      {/* Header - Full Width */}
      <header className="relative z-10 border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl sticky top-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                    <Activity className="h-8 w-8 text-cyan-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Shadow Signals
                  </h1>
                  <p className="text-xs text-cyan-300/70">AI-Powered Trading Analysis</p>
                </div>
              </div>
              <Badge className="hidden sm:flex items-center space-x-1 bg-green-500/20 border-green-400/30 text-green-300">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400/50" />
                <span>Live Data</span>
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMarketData}
                disabled={isLoadingMarket}
                className="hidden md:flex items-center space-x-2 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingMarket ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <div className="hidden md:flex items-center space-x-2 text-sm text-cyan-300/70">
                <Clock className="h-4 w-4" />
                <span>Real-time Analysis</span>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">Futuristic Mode</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Market Overview Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
          <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-300/80">Total Market Cap</CardTitle>
              <div className="p-1 rounded bg-cyan-500/20">
                <DollarSign className="h-4 w-4 text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(marketData.total_market_cap)}</div>
              <div className="flex items-center space-x-1 text-xs">
                {marketData.market_cap_change_percentage_24h > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span className={marketData.market_cap_change_percentage_24h > 0 ? "text-green-400" : "text-red-400"}>
                  {marketData.market_cap_change_percentage_24h > 0 ? "+" : ""}
                  {marketData.market_cap_change_percentage_24h.toFixed(1)}%
                </span>
                <span className="text-cyan-300/60">24h</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-300/80">24h Volume</CardTitle>
              <div className="p-1 rounded bg-blue-500/20">
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(marketData.total_volume_24h)}</div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-green-400">+5.2%</span>
                <span className="text-blue-300/60">vs yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300/80">Active Tokens</CardTitle>
              <div className="p-1 rounded bg-purple-500/20">
                <Globe className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{marketData.active_cryptocurrencies.toLocaleString()}</div>
              <p className="text-xs text-purple-300/60">Cryptocurrencies tracked</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-300/80">USDT Pairs</CardTitle>
              <div className="p-1 rounded bg-yellow-500/20">
                <Database className="h-4 w-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{marketData.usdt_pairs_count}</div>
              <p className="text-xs text-yellow-300/60">Active trading pairs</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-300/80">AI Analysis</CardTitle>
              <div className="p-1 rounded bg-orange-500/20">
                <Zap className="h-4 w-4 text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{marketData.active_analysis_count}+</div>
              <p className="text-xs text-orange-300/60">Tokens analyzed</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300 shadow-lg shadow-green-500/10 hover:shadow-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-300/80">Confidence</CardTitle>
              <div className="p-1 rounded bg-green-500/20">
                <Target className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">92%</div>
              <p className="text-xs text-green-300/60">Average accuracy</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search Interface */}
        <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                  <Search className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <span className="text-lg text-white">Token Analysis Search</span>
                  <p className="text-sm text-cyan-300/70 font-normal">
                    Get AI-powered trading signals and technical analysis
                  </p>
                </div>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className="bg-cyan-500/20 border-cyan-400/30 text-cyan-300">200+ Tokens</Badge>
                {(analysisResult || searchResults.length > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearResults}
                    className="border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300"
                  >
                    Clear Results
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
                <Input
                  placeholder="Search tokens (BTC, ETH, AI16Z, THETA, VIRTUALS, PEPE...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 h-12 bg-black/50 border-cyan-500/30 focus:border-cyan-400/50 focus:ring-cyan-400/20 text-white placeholder:text-cyan-300/50"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="h-12 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-medium shadow-lg shadow-cyan-500/30"
              >
                {isSearching ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>Search Tokens</span>
                  </div>
                )}
              </Button>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-cyan-300/80">Search Results:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchResults.map((result) => (
                    <Card
                      key={result.id}
                      className="cursor-pointer bg-black/40 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-200 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20"
                      onClick={() => analyzeToken(result.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={result.thumb || "/placeholder.svg"}
                            alt={result.name}
                            className="w-8 h-8 rounded-full border border-cyan-500/30"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-white">{result.name}</p>
                            <p className="text-sm text-cyan-300/70">
                              {result.symbol.toUpperCase()} • #{result.market_cap_rank}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" className="text-cyan-400 hover:bg-cyan-500/20">
                            Analyze
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Tokens */}
            {!analysisResult && searchResults.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-cyan-300/80">Popular Tokens:</p>
                <div className="flex flex-wrap gap-2">
                  {popularTokens.map((token) => (
                    <Button
                      key={token}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSearch(token)}
                      className="h-8 px-3 bg-black/30 border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-300 transition-all duration-200"
                    >
                      {token}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Features List */}
            {!analysisResult && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-cyan-500/20">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 bg-green-400 rounded-full shadow-sm shadow-green-400/50" />
                  <span className="text-cyan-300/70">Multi-timeframe Analysis</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 bg-blue-400 rounded-full shadow-sm shadow-blue-400/50" />
                  <span className="text-cyan-300/70">85-95% Confidence</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 bg-purple-400 rounded-full shadow-sm shadow-purple-400/50" />
                  <span className="text-cyan-300/70">Technical Indicators</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 bg-orange-400 rounded-full shadow-sm shadow-orange-400/50" />
                  <span className="text-cyan-300/70">AI-Powered Insights</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isAnalyzing && (
          <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
                    <div className="absolute inset-0 h-12 w-12 border-2 border-cyan-400/20 rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Analyzing Token...</h3>
                  <p className="text-cyan-300/70">
                    Generating AI-powered trading signals and technical analysis for {selectedToken?.toUpperCase()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {analysisResult && <TokenAnalysis analysis={analysisResult} />}

        {/* Welcome Section - Only show when no results */}
        {!analysisResult && !isAnalyzing && searchResults.length === 0 && (
          <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Welcome to Shadow Signals
                  </h2>
                  <p className="text-cyan-300/80 text-lg max-w-3xl mx-auto leading-relaxed">
                    Advanced cryptocurrency analysis platform powered by artificial intelligence. Get comprehensive
                    trading signals, technical analysis, and market insights with industry-leading accuracy.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                      <TrendingUp className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-white">Trading Signals</h3>
                    <p className="text-sm text-cyan-300/70">
                      AI-generated buy/sell recommendations with confidence scores
                    </p>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/20">
                      <BarChart3 className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white">Technical Analysis</h3>
                    <p className="text-sm text-cyan-300/70">RSI, support/resistance levels, and volume indicators</p>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/20">
                      <Clock className="h-6 w-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white">Multi-Timeframe</h3>
                    <p className="text-sm text-cyan-300/70">1h scalping to long-term investment strategies</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  )
}

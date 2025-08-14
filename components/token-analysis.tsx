"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  BarChart3,
  Clock,
  Brain,
  DollarSign,
  Zap,
  AlertTriangle,
} from "lucide-react"
import type { AnalysisResult } from "@/lib/types"

interface TokenAnalysisProps {
  analysis: AnalysisResult
}

export function TokenAnalysis({ analysis }: TokenAnalysisProps) {
  const { token, signals, technical_indicators, ai_insight } = analysis

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "Strong Buy":
        return "bg-green-500/20 text-green-300 border-green-400/30 shadow-lg shadow-green-500/20"
      case "Buy":
        return "bg-green-500/15 text-green-300 border-green-400/25 shadow-lg shadow-green-500/15"
      case "Hold":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30 shadow-lg shadow-yellow-500/20"
      case "Sell":
        return "bg-red-500/15 text-red-300 border-red-400/25 shadow-lg shadow-red-500/15"
      case "Strong Sell":
        return "bg-red-500/20 text-red-300 border-red-400/30 shadow-lg shadow-red-500/20"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/30"
    }
  }

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "Strong Buy":
      case "Buy":
        return <TrendingUp className="h-4 w-4" />
      case "Sell":
      case "Strong Sell":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {/* Token Header */}
      <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <img
                  src={token.image || "/placeholder.svg"}
                  alt={token.name}
                  className="w-12 h-12 rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling?.classList.remove("hidden")
                  }}
                />
                <div className="hidden w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-cyan-400">{token.symbol.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl text-white">{token.name}</CardTitle>
                <p className="text-cyan-300/70">
                  {token.symbol.toUpperCase()} • Rank #{token.market_cap_rank}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">${token.current_price.toLocaleString()}</div>
              <div className="flex items-center space-x-2">
                {token.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <span className={token.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}>
                  {formatPercentage(token.price_change_percentage_24h)} 24h
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-cyan-300/70">Market Cap</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(token.market_cap)}</p>
            </div>
            <div>
              <p className="text-sm text-cyan-300/70">24h Volume</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(token.total_volume)}</p>
            </div>
            <div>
              <p className="text-sm text-cyan-300/70">7d Change</p>
              <p
                className={`text-lg font-semibold ${token.price_change_percentage_7d >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {formatPercentage(token.price_change_percentage_7d)}
              </p>
            </div>
            <div>
              <p className="text-sm text-cyan-300/70">All-Time High</p>
              <p className="text-lg font-semibold text-white">${token.ath.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Signals */}
      <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-1 rounded bg-cyan-500/20 border border-cyan-500/30">
              <Target className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-white">AI Trading Signals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {signals.map((signal, index) => (
              <div key={index} className="space-y-3 p-4 rounded-lg bg-black/30 border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-cyan-300/80">{signal.timeframe}</span>
                  <Badge className={getSignalColor(signal.signal)}>
                    {getSignalIcon(signal.signal)}
                    <span className="ml-1">{signal.signal}</span>
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyan-300/70">Confidence</span>
                    <span className="font-medium text-white">{signal.confidence}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={signal.confidence} className="h-2 bg-black/50 border border-cyan-500/20" />
                    <div
                      className="absolute top-0 left-0 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full shadow-sm shadow-cyan-400/50"
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-cyan-300/60 line-clamp-3">{signal.justification}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30 shadow-2xl shadow-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-1 rounded bg-blue-500/20 border border-blue-500/30">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-white">Technical Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3 p-4 rounded-lg bg-black/30 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-300/80">RSI (14)</span>
                <span className="text-lg font-bold text-white">{technical_indicators.rsi.toFixed(1)}</span>
              </div>
              <div className="relative">
                <div className="h-3 bg-black/50 rounded-full border border-blue-500/20" />
                <div
                  className={`absolute top-0 left-0 h-3 rounded-full shadow-sm ${
                    technical_indicators.rsi < 30
                      ? "bg-gradient-to-r from-red-500 to-red-400 shadow-red-400/50"
                      : technical_indicators.rsi > 70
                        ? "bg-gradient-to-r from-red-500 to-red-400 shadow-red-400/50"
                        : "bg-gradient-to-r from-green-500 to-green-400 shadow-green-400/50"
                  }`}
                  style={{ width: `${technical_indicators.rsi}%` }}
                />
              </div>
              <p className="text-xs text-blue-300/60">
                {technical_indicators.rsi < 30 ? "Oversold" : technical_indicators.rsi > 70 ? "Overbought" : "Neutral"}
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-black/30 border border-green-500/20">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-green-500/20">
                  <DollarSign className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-sm font-medium text-green-300/80">Support Level</span>
              </div>
              <p className="text-lg font-bold text-green-400">${technical_indicators.support_level.toFixed(2)}</p>
              <p className="text-xs text-green-300/60">
                {(((token.current_price - technical_indicators.support_level) / token.current_price) * 100).toFixed(1)}%
                above
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-black/30 border border-red-500/20">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-red-500/20">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                </div>
                <span className="text-sm font-medium text-red-300/80">Resistance Level</span>
              </div>
              <p className="text-lg font-bold text-red-400">${technical_indicators.resistance_level.toFixed(2)}</p>
              <p className="text-xs text-red-300/60">
                {(((technical_indicators.resistance_level - token.current_price) / token.current_price) * 100).toFixed(
                  1,
                )}
                % above
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-black/30 border border-purple-500/20">
              <span className="text-sm font-medium text-purple-300/80">Volume</span>
              <Badge
                className={`${
                  technical_indicators.volume_indicator === "High"
                    ? "bg-purple-500/20 text-purple-300 border-purple-400/30"
                    : "bg-gray-500/20 text-gray-300 border-gray-400/30"
                }`}
              >
                {technical_indicators.volume_indicator}
              </Badge>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-black/30 border border-yellow-500/20">
              <span className="text-sm font-medium text-yellow-300/80">Liquidity</span>
              <Badge
                className={`${
                  technical_indicators.liquidity_metric === "High"
                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                    : "bg-gray-500/20 text-gray-300 border-gray-400/30"
                }`}
              >
                {technical_indicators.liquidity_metric}
              </Badge>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-black/30 border border-orange-500/20">
              <span className="text-sm font-medium text-orange-300/80">Trend</span>
              <Badge
                className={
                  technical_indicators.trend_direction === "Bullish"
                    ? "bg-green-500/20 text-green-300 border-green-400/30"
                    : technical_indicators.trend_direction === "Bearish"
                      ? "bg-red-500/20 text-red-300 border-red-400/30"
                      : "bg-gray-500/20 text-gray-300 border-gray-400/30"
                }
              >
                {technical_indicators.trend_direction}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insight */}
      <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-1 rounded bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
              <Brain className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-white">AI Market Insight</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-cyan-100 leading-relaxed">{ai_insight}</p>
          <Separator className="my-4 bg-cyan-500/20" />
          <div className="flex items-center justify-between text-sm text-cyan-300/70">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date(analysis.last_analysis).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-cyan-500/20">
                <Zap className="h-4 w-4 text-cyan-400" />
              </div>
              <span>Powered by Shadow Signals AI</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

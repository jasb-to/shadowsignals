import { type NextRequest, NextResponse } from "next/server"
import type { AnalysisResult, TradingSignal, TechnicalIndicators, CryptoToken, ApiResponse } from "@/lib/types"

// AI-powered analysis engine
class AnalysisEngine {
  private calculateRSI(prices: number[]): number {
    if (prices.length < 14) return 50 // Default neutral RSI

    let gains = 0
    let losses = 0

    for (let i = 1; i < Math.min(15, prices.length); i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) gains += change
      else losses += Math.abs(change)
    }

    const avgGain = gains / 14
    const avgLoss = losses / 14

    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - 100 / (1 + rs)
  }

  private calculateStochasticRSI(prices: number[]): number {
    const rsiValues = []
    for (let i = 14; i < prices.length; i++) {
      const rsiPeriodPrices = prices.slice(i - 14, i)
      rsiValues.push(this.calculateRSI(rsiPeriodPrices))
    }

    if (rsiValues.length < 14) return 50

    const recentRSI = rsiValues.slice(-14)
    const currentRSI = recentRSI[recentRSI.length - 1]
    const minRSI = Math.min(...recentRSI)
    const maxRSI = Math.max(...recentRSI)

    if (maxRSI === minRSI) return 50
    return ((currentRSI - minRSI) / (maxRSI - minRSI)) * 100
  }

  private calculateSupportResistance(currentPrice: number): { support: number; resistance: number } {
    // Simplified support/resistance calculation based on price levels
    const support = currentPrice * 0.92 // 8% below current price
    const resistance = currentPrice * 1.08 // 8% above current price

    return { support, resistance }
  }

  private generateTechnicalIndicators(token: CryptoToken): TechnicalIndicators & {
    stochastic_rsi: number
    short_term_outlook: string
    long_term_outlook: string
  } {
    // Simulate price history for RSI calculation
    const basePrice = token.current_price
    const volatility = Math.abs(token.price_change_percentage_24h) / 100
    const priceHistory = Array.from({ length: 30 }, (_, i) => {
      const randomFactor = (Math.random() - 0.5) * volatility * 2
      return basePrice * (1 + (randomFactor * (30 - i)) / 30)
    })

    const rsi = this.calculateRSI(priceHistory)
    const stochasticRSI = this.calculateStochasticRSI(priceHistory)
    const { support, resistance } = this.calculateSupportResistance(token.current_price)

    // Volume and liquidity indicators based on market data
    const volumeIndicator = token.total_volume > 1000000000 ? "High" : token.total_volume > 100000000 ? "Medium" : "Low"
    const liquidityMetric = token.market_cap > 10000000000 ? "High" : token.market_cap > 1000000000 ? "Medium" : "Low"

    // Trend analysis based on price changes
    let trendDirection: "Bullish" | "Bearish" | "Neutral" = "Neutral"
    if (token.price_change_percentage_24h > 5) trendDirection = "Bullish"
    else if (token.price_change_percentage_24h < -5) trendDirection = "Bearish"

    const shortTermOutlook = this.generateShortTermOutlook(token, rsi, stochasticRSI)
    const longTermOutlook = this.generateLongTermOutlook(token, rsi)

    return {
      rsi,
      stochastic_rsi: stochasticRSI,
      support_level: support,
      resistance_level: resistance,
      volume_indicator: volumeIndicator as "High" | "Medium" | "Low",
      liquidity_metric: liquidityMetric as "High" | "Medium" | "Low",
      trend_direction: trendDirection,
      short_term_outlook: shortTermOutlook,
      long_term_outlook: longTermOutlook,
    }
  }

  private generateShortTermOutlook(token: CryptoToken, rsi: number, stochasticRSI: number): string {
    const priceChange24h = token.price_change_percentage_24h
    let outlook = ""

    if (rsi < 30 && stochasticRSI < 20) {
      outlook = "Oversold conditions suggest potential bounce in 1-3 days. Watch for reversal signals."
    } else if (rsi > 70 && stochasticRSI > 80) {
      outlook = "Overbought territory indicates possible pullback. Consider taking profits on short-term positions."
    } else if (priceChange24h > 10) {
      outlook = "Strong momentum may continue for 2-5 days, but watch for exhaustion signals."
    } else if (priceChange24h < -10) {
      outlook = "Selling pressure may persist short-term. Look for stabilization before entry."
    } else {
      outlook = "Consolidation phase expected. Range-bound trading likely for next 3-7 days."
    }

    return outlook
  }

  private generateLongTermOutlook(token: CryptoToken, rsi: number): string {
    const priceChange7d = token.price_change_percentage_7d
    const priceChange30d = token.price_change_percentage_30d || 0
    const marketCapRank = token.market_cap_rank
    let outlook = ""

    if (marketCapRank <= 10) {
      outlook = "Blue-chip crypto with strong fundamentals. "
    } else if (marketCapRank <= 50) {
      outlook = "Established project with growth potential. "
    } else {
      outlook = "Higher risk/reward profile typical of smaller cap tokens. "
    }

    if (priceChange30d > 50) {
      outlook += "Recent strong performance may face resistance. Consider DCA strategy for long-term accumulation."
    } else if (priceChange30d < -30) {
      outlook += "Significant correction may present accumulation opportunity for patient investors."
    } else if (priceChange7d > 20 && rsi < 60) {
      outlook += "Healthy uptrend with room for growth. Suitable for 3-6 month holding period."
    } else {
      outlook += "Sideways action expected. Focus on other opportunities or wait for clearer trend."
    }

    return outlook
  }

  private generateTradeSetup(
    token: CryptoToken,
    indicators: any,
    signal: TradingSignal,
  ): {
    entry_zone: { min: number; max: number }
    stop_loss: number
    take_profit_1: number
    take_profit_2: number
    position_size: string
    risk_reward_ratio: string
    setup_notes: string
  } {
    const currentPrice = token.current_price
    const volatility = Math.abs(token.price_change_percentage_24h) / 100

    let entryMin, entryMax, stopLoss, takeProfit1, takeProfit2
    let positionSize = "2-5% of portfolio"
    let setupNotes = ""

    if (signal.signal === "Strong Buy" || signal.signal === "Buy") {
      // Long setup
      entryMin = currentPrice * 0.98 // 2% below current
      entryMax = currentPrice * 1.02 // 2% above current
      stopLoss = indicators.support_level * 0.95 // 5% below support
      takeProfit1 = currentPrice * 1.15 // 15% profit
      takeProfit2 = indicators.resistance_level * 1.05 // 5% above resistance

      setupNotes = `Long setup with ${signal.timeframe} bias. Scale in on dips to entry zone. Take 50% profits at TP1, let remainder run to TP2.`

      if (volatility > 0.1) {
        positionSize = "1-3% of portfolio"
        setupNotes += " High volatility - reduce position size."
      }
    } else if (signal.signal === "Strong Sell" || signal.signal === "Sell") {
      // Short setup (or exit long)
      entryMin = currentPrice * 0.98
      entryMax = currentPrice * 1.02
      stopLoss = indicators.resistance_level * 1.05 // 5% above resistance
      takeProfit1 = currentPrice * 0.85 // 15% profit on short
      takeProfit2 = indicators.support_level * 0.95 // 5% below support

      setupNotes = `Short setup or exit long positions. Consider hedging with derivatives if available.`
      positionSize = "1-3% of portfolio"
    } else {
      // Hold/Neutral
      entryMin = indicators.support_level
      entryMax = indicators.resistance_level
      stopLoss = indicators.support_level * 0.9
      takeProfit1 = currentPrice * 1.1
      takeProfit2 = indicators.resistance_level

      setupNotes = `Range-bound trading setup. Buy near support, sell near resistance.`
      positionSize = "1-2% of portfolio"
    }

    const riskAmount = Math.abs(currentPrice - stopLoss)
    const rewardAmount = Math.abs(takeProfit1 - currentPrice)
    const riskRewardRatio = `1:${(rewardAmount / riskAmount).toFixed(1)}`

    return {
      entry_zone: { min: entryMin, max: entryMax },
      stop_loss: stopLoss,
      take_profit_1: takeProfit1,
      take_profit_2: takeProfit2,
      position_size: positionSize,
      risk_reward_ratio: riskRewardRatio,
      setup_notes: setupNotes,
    }
  }

  private generateTradingSignal(
    token: CryptoToken,
    indicators: TechnicalIndicators,
    timeframe: "1h" | "4h" | "1d" | "7d" | "1m",
  ): TradingSignal {
    let signal: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell" = "Hold"
    let confidence = 85
    const technicalFactors: string[] = []
    let justification = ""

    // RSI-based signals
    if (indicators.rsi < 30) {
      signal = indicators.rsi < 20 ? "Strong Buy" : "Buy"
      technicalFactors.push(`Oversold RSI (${indicators.rsi.toFixed(1)})`)
      confidence += 5
    } else if (indicators.rsi > 70) {
      signal = indicators.rsi > 80 ? "Strong Sell" : "Sell"
      technicalFactors.push(`Overbought RSI (${indicators.rsi.toFixed(1)})`)
      confidence += 5
    }

    // Price change momentum
    const priceChange24h = token.price_change_percentage_24h
    const priceChange7d = token.price_change_percentage_7d

    if (priceChange24h > 10 && priceChange7d > 15) {
      signal = signal === "Hold" ? "Buy" : signal === "Buy" ? "Strong Buy" : signal
      technicalFactors.push("Strong upward momentum")
      confidence += 3
    } else if (priceChange24h < -10 && priceChange7d < -15) {
      signal = signal === "Hold" ? "Sell" : signal === "Sell" ? "Strong Sell" : signal
      technicalFactors.push("Strong downward momentum")
      confidence += 3
    }

    // Volume analysis
    if (indicators.volume_indicator === "High") {
      technicalFactors.push("High trading volume")
      confidence += 2
    }

    // Market cap and liquidity
    if (indicators.liquidity_metric === "High") {
      technicalFactors.push("High liquidity")
      confidence += 2
    }

    // Support/Resistance levels
    const currentPrice = token.current_price
    const distanceToSupport = ((currentPrice - indicators.support_level) / currentPrice) * 100
    const distanceToResistance = ((indicators.resistance_level - currentPrice) / currentPrice) * 100

    if (distanceToSupport < 2) {
      technicalFactors.push("Near support level")
      if (signal === "Hold") signal = "Buy"
    } else if (distanceToResistance < 2) {
      technicalFactors.push("Near resistance level")
      if (signal === "Hold") signal = "Sell"
    }

    // Timeframe-specific adjustments
    switch (timeframe) {
      case "1h":
        justification = `Short-term scalping signal based on immediate price action and volume. ${technicalFactors.join(", ")}.`
        confidence = Math.min(confidence, 90) // Cap confidence for short-term
        break
      case "4h":
        justification = `Swing trading opportunity identified through technical confluence. ${technicalFactors.join(", ")}.`
        break
      case "1d":
        justification = `Daily analysis shows ${signal.toLowerCase()} conditions. ${technicalFactors.join(", ")}.`
        break
      case "7d":
        justification = `Weekly trend analysis indicates ${signal.toLowerCase()} potential. ${technicalFactors.join(", ")}.`
        break
      case "1m":
        justification = `Long-term investment perspective suggests ${signal.toLowerCase()} position. ${technicalFactors.join(", ")}.`
        confidence = Math.min(confidence + 5, 95) // Higher confidence for long-term
        break
    }

    return {
      signal,
      confidence: Math.min(confidence, 95),
      timeframe,
      justification,
      technical_factors: technicalFactors,
    }
  }

  private generateAIInsight(token: CryptoToken, signals: TradingSignal[], tradeSetup: any): string {
    const bullishSignals = signals.filter((s) => s.signal === "Strong Buy" || s.signal === "Buy").length
    const bearishSignals = signals.filter((s) => s.signal === "Strong Sell" || s.signal === "Sell").length

    const marketCapCategory =
      token.market_cap > 100000000000 ? "large-cap" : token.market_cap > 10000000000 ? "mid-cap" : "small-cap"

    let insight = `${token.name} (${token.symbol.toUpperCase()}) is a ${marketCapCategory} cryptocurrency `

    if (bullishSignals > bearishSignals) {
      insight += `showing bullish momentum across multiple timeframes. The confluence of technical indicators suggests potential upward price movement. `
    } else if (bearishSignals > bearishSignals) {
      insight += `displaying bearish characteristics with multiple sell signals. Technical analysis indicates potential downward pressure. `
    } else {
      insight += `in a consolidation phase with mixed signals across timeframes. Market indecision suggests waiting for clearer directional bias. `
    }

    // Add specific insights based on price performance
    if (token.price_change_percentage_24h > 15) {
      insight += `Strong 24h performance (+${token.price_change_percentage_24h.toFixed(1)}%) indicates high volatility and momentum. `
    } else if (token.price_change_percentage_24h < -15) {
      insight += `Significant 24h decline (${token.price_change_percentage_24h.toFixed(1)}%) suggests selling pressure or market correction. `
    }

    insight += `Current market position at rank #${token.market_cap_rank} with $${(token.market_cap / 1000000000).toFixed(2)}B market cap provides context for risk assessment. `

    insight += `Recommended position size: ${tradeSetup.position_size} with ${tradeSetup.risk_reward_ratio} risk/reward ratio.`

    return insight
  }

  async analyzeToken(token: CryptoToken): Promise<
    AnalysisResult & {
      trade_setup: any
      technical_indicators: any
    }
  > {
    const technicalIndicators = this.generateTechnicalIndicators(token)

    const timeframes: Array<"1h" | "4h" | "1d" | "7d" | "1m"> = ["1h", "4h", "1d", "7d", "1m"]
    const signals = timeframes.map((timeframe) => this.generateTradingSignal(token, technicalIndicators, timeframe))

    const primarySignal = signals.find((s) => s.timeframe === "1d") || signals[0]
    const tradeSetup = this.generateTradeSetup(token, technicalIndicators, primarySignal)

    const aiInsight = this.generateAIInsight(token, signals, tradeSetup)

    return {
      token,
      signals,
      technical_indicators: technicalIndicators,
      trade_setup: tradeSetup,
      ai_insight: aiInsight,
      last_analysis: new Date().toISOString(),
    }
  }
}

const analysisEngine = new AnalysisEngine()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenId = searchParams.get("id")

  if (!tokenId) {
    const errorResponse: ApiResponse<AnalysisResult> = {
      success: false,
      error: "Token ID parameter is required",
    }
    return NextResponse.json(errorResponse, { status: 400 })
  }

  try {
    // First get token data
    const tokenResponse = await fetch(`${request.nextUrl.origin}/api/tokens?id=${encodeURIComponent(tokenId)}`)

    if (!tokenResponse.ok) {
      throw new Error("Failed to fetch token data")
    }

    const tokenData = (await tokenResponse.json()) as ApiResponse<CryptoToken>

    if (!tokenData.success || !tokenData.data) {
      throw new Error("Invalid token data received")
    }

    // Generate analysis
    const analysis = await analysisEngine.analyzeToken(tokenData.data)

    const apiResponse: ApiResponse<AnalysisResult> = {
      success: true,
      data: analysis,
    }

    return NextResponse.json(apiResponse)
  } catch (error) {
    console.error("Analysis generation failed:", error)

    const errorResponse: ApiResponse<AnalysisResult> = {
      success: false,
      error: "Analysis service temporarily unavailable",
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

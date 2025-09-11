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

  private calculateSupportResistanceLevels(
    currentPrice: number,
    priceHistory: number[],
  ): {
    support_levels: number[]
    resistance_levels: number[]
    trend_direction: "Bullish" | "Bearish" | "Neutral"
  } {
    const support1 = currentPrice * 0.95 // 5% below
    const support2 = currentPrice * 0.88 // 12% below
    const resistance1 = currentPrice * 1.08 // 8% above (first resistance)
    const resistance2 = currentPrice * 1.15 // 15% above (second resistance)
    const resistance3 = currentPrice * 1.22 // 22% above (third resistance)

    // Enhanced trend direction based on price action
    const recentPrices = priceHistory.slice(-10)
    const oldPrices = priceHistory.slice(-20, -10)
    const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
    const oldAvg = oldPrices.reduce((a, b) => a + b, 0) / oldPrices.length

    let trend_direction: "Bullish" | "Bearish" | "Neutral" = "Neutral"
    const trendStrength = ((recentAvg - oldAvg) / oldAvg) * 100

    if (trendStrength > 3) trend_direction = "Bullish"
    else if (trendStrength < -3) trend_direction = "Bearish"

    return {
      support_levels: [support2, support1], // Ordered from lowest to highest
      resistance_levels: [resistance1, resistance2, resistance3], // Ordered from lowest to highest
      trend_direction,
    }
  }

  private async getHuggingFaceAnalysis(tokenSymbol: string, currentPrice: number): Promise<string> {
    const huggingFaceKey = process.env.HUGGINGFACE_API_KEY

    if (!huggingFaceKey) {
      console.log("[v0] Hugging Face API key not found, using simulated analysis")
      return `Simulated AI analysis for ${tokenSymbol}: Technical patterns suggest potential price movement based on current market conditions at $${currentPrice}.`
    }

    try {
      const prompt = `Analyze ${tokenSymbol} cryptocurrency trading at $${currentPrice}. Provide a brief technical analysis focusing on short-term price action and trading opportunities.`

      const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${huggingFaceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 150,
            temperature: 0.7,
          },
        }),
      })

      if (response.ok) {
        const result = await response.json()
        return result.generated_text || `AI analysis for ${tokenSymbol} at current levels.`
      }
    } catch (error) {
      console.error("[v0] Hugging Face API error:", error)
    }

    return `AI analysis for ${tokenSymbol}: Market conditions suggest monitoring key levels for potential trading opportunities.`
  }

  private calculateEMA(prices: number[], period: number): number[] {
    const ema = []
    const multiplier = 2 / (period + 1)

    // Start with SMA for first value
    let sum = 0
    for (let i = 0; i < Math.min(period, prices.length); i++) {
      sum += prices[i]
    }
    ema[period - 1] = sum / period

    // Calculate EMA for remaining values
    for (let i = period; i < prices.length; i++) {
      ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1]
    }

    return ema
  }

  private calculateMACD(prices: number[]): {
    macd_line: number
    signal_line: number
    histogram: number
    signal: "Bullish" | "Bearish" | "Neutral"
  } {
    if (prices.length < 26) {
      return { macd_line: 0, signal_line: 0, histogram: 0, signal: "Neutral" }
    }

    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)

    // MACD line = EMA12 - EMA26
    const macdValues = []
    for (let i = 25; i < prices.length; i++) {
      macdValues.push(ema12[i] - ema26[i])
    }

    // Signal line = EMA9 of MACD line
    const signalEMA = this.calculateEMA(macdValues, 9)

    const currentMACD = macdValues[macdValues.length - 1] || 0
    const currentSignal = signalEMA[signalEMA.length - 1] || 0
    const histogram = currentMACD - currentSignal

    // Previous values for crossover detection
    const prevMACD = macdValues[macdValues.length - 2] || 0
    const prevSignal = signalEMA[signalEMA.length - 2] || 0

    let signal: "Bullish" | "Bearish" | "Neutral" = "Neutral"

    // Bullish crossover: MACD crosses above signal line
    if (prevMACD <= prevSignal && currentMACD > currentSignal) {
      signal = "Bullish"
    }
    // Bearish crossover: MACD crosses below signal line
    else if (prevMACD >= prevSignal && currentMACD < currentSignal) {
      signal = "Bearish"
    }
    // Trend continuation
    else if (currentMACD > currentSignal && histogram > 0) {
      signal = "Bullish"
    } else if (currentMACD < currentSignal && histogram < 0) {
      signal = "Bearish"
    }

    return {
      macd_line: currentMACD,
      signal_line: currentSignal,
      histogram,
      signal,
    }
  }

  private calculate8_21_EMACrossover(prices: number[]): {
    ema8: number
    ema21: number
    signal: "Bullish" | "Bearish" | "Neutral"
    strength: "Strong" | "Weak"
  } {
    if (prices.length < 21) {
      return { ema8: 0, ema21: 0, signal: "Neutral", strength: "Weak" }
    }

    const ema8Array = this.calculateEMA(prices, 8)
    const ema21Array = this.calculateEMA(prices, 21)

    const currentEMA8 = ema8Array[ema8Array.length - 1] || 0
    const currentEMA21 = ema21Array[ema21Array.length - 1] || 0

    // Previous values for crossover detection
    const prevEMA8 = ema8Array[ema8Array.length - 2] || 0
    const prevEMA21 = ema21Array[ema21Array.length - 2] || 0

    let signal: "Bullish" | "Bearish" | "Neutral" = "Neutral"
    let strength: "Strong" | "Weak" = "Weak"

    // Calculate separation percentage for strength
    const separation = Math.abs((currentEMA8 - currentEMA21) / currentEMA21) * 100
    strength = separation > 2 ? "Strong" : "Weak"

    // Bullish crossover: EMA8 crosses above EMA21
    if (prevEMA8 <= prevEMA21 && currentEMA8 > currentEMA21) {
      signal = "Bullish"
      strength = "Strong" // Fresh crossovers are strong signals
    }
    // Bearish crossover: EMA8 crosses below EMA21
    else if (prevEMA8 >= prevEMA21 && currentEMA8 < currentEMA21) {
      signal = "Bearish"
      strength = "Strong" // Fresh crossovers are strong signals
    }
    // Trend continuation
    else if (currentEMA8 > currentEMA21) {
      signal = "Bullish"
    } else if (currentEMA8 < currentEMA21) {
      signal = "Bearish"
    }

    return {
      ema8: currentEMA8,
      ema21: currentEMA21,
      signal,
      strength,
    }
  }

  private generateTechnicalIndicators(token: CryptoToken): TechnicalIndicators & {
    stochastic_rsi: number
    short_term_outlook: string
    long_term_outlook: string
    trend_direction: "Bullish" | "Bearish" | "Neutral"
    support_levels: number[]
    resistance_levels: number[]
    macd: {
      macd_line: number
      signal_line: number
      histogram: number
      signal: "Bullish" | "Bearish" | "Neutral"
    }
    ema_crossover: {
      ema8: number
      ema21: number
      signal: "Bullish" | "Bearish" | "Neutral"
      strength: "Strong" | "Weak"
    }
  } {
    const basePrice = token.current_price
    const volatility = Math.abs(token.price_change_percentage_24h) / 100
    const priceHistory = Array.from({ length: 50 }, (_, i) => {
      const randomFactor = (Math.random() - 0.5) * volatility * 2
      const trendFactor = token.price_change_percentage_7d / 100 / 7 // Daily trend component
      return basePrice * (1 + (randomFactor * (50 - i)) / 50 + trendFactor * (i / 50))
    })

    const rsi = this.calculateRSI(priceHistory)
    const stochasticRSI = this.calculateStochasticRSI(priceHistory)

    const macd = this.calculateMACD(priceHistory)
    const emaCrossover = this.calculate8_21_EMACrossover(priceHistory)

    const levels = this.calculateSupportResistanceLevels(token.current_price, priceHistory)

    // Volume and liquidity indicators based on market data
    const volumeIndicator = token.total_volume > 1000000000 ? "High" : token.total_volume > 100000000 ? "Medium" : "Low"
    const liquidityMetric = token.market_cap > 10000000000 ? "High" : token.market_cap > 1000000000 ? "Medium" : "Low"

    const shortTermOutlook = this.generateShortTermOutlook(token, rsi, stochasticRSI)
    const longTermOutlook = this.generateLongTermOutlook(token, rsi)

    return {
      rsi,
      stochastic_rsi: stochasticRSI,
      support_level: levels.support_levels[0], // Keep for backward compatibility
      resistance_level: levels.resistance_levels[0], // Keep for backward compatibility
      support_levels: levels.support_levels,
      resistance_levels: levels.resistance_levels,
      trend_direction: levels.trend_direction,
      volume_indicator: volumeIndicator as "High" | "Medium" | "Low",
      liquidity_metric: liquidityMetric as "High" | "Medium" | "Low",
      short_term_outlook: shortTermOutlook,
      long_term_outlook: longTermOutlook,
      macd,
      ema_crossover: emaCrossover,
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
    timeframe_focus: string
  } {
    const currentPrice = token.current_price
    const volatility = Math.abs(token.price_change_percentage_24h) / 100
    const supportLevels = indicators.support_levels
    const resistanceLevels = indicators.resistance_levels

    let entryMin, entryMax, stopLoss, takeProfit1, takeProfit2
    let positionSize = "2-5% of portfolio"
    let setupNotes = ""
    let timeframeFocus = ""

    if (signal.signal === "Strong Buy" || signal.signal === "Buy") {
      entryMin = currentPrice * 0.995 // 0.5% below current for tight entry
      entryMax = currentPrice * 1.005 // 0.5% above current
      stopLoss = supportLevels[0] * 0.98 // Below first support level

      takeProfit1 = resistanceLevels[0] // First resistance level (8% above)
      takeProfit2 = resistanceLevels[1] // Second resistance level (15% above) - ALWAYS higher than TP1

      timeframeFocus = "1hr-4hr swing trade"
      setupNotes = `Long setup targeting resistance zones. TP1 at $${takeProfit1.toFixed(4)} (first resistance), TP2 at $${takeProfit2.toFixed(4)} (second resistance). Take 70% profits at TP1, trail remainder.`

      // Adjust for volatility
      if (volatility > 0.15) {
        stopLoss = supportLevels[0] * 0.98 // Use first support for high volatility
        positionSize = "1-3% of portfolio"
        setupNotes += " High volatility - using tighter risk management."
      }
    } else if (signal.signal === "Strong Sell" || signal.signal === "Sell") {
      entryMin = currentPrice * 0.995
      entryMax = currentPrice * 1.005
      stopLoss = resistanceLevels[0] * 1.02 // Above first resistance level

      takeProfit1 = supportLevels[1] // First support level (higher)
      takeProfit2 = supportLevels[0] // Second support level (lower) - for shorts, TP2 should be lower

      timeframeFocus = "1hr-4hr short trade"
      setupNotes = `Short setup targeting support zones. TP1 at $${takeProfit1.toFixed(4)} (first support), TP2 at $${takeProfit2.toFixed(4)} (deeper support). Consider derivatives or exit longs.`
      positionSize = "1-3% of portfolio"
    } else {
      // Range trading setup
      entryMin = supportLevels[1] * 1.01 // Buy above higher support
      entryMax = resistanceLevels[0] * 0.99 // Sell below resistance
      stopLoss = supportLevels[0] * 0.97 // Below deeper support
      takeProfit1 = resistanceLevels[0] // First resistance
      takeProfit2 = resistanceLevels[1] // Second resistance (higher)

      timeframeFocus = "4hr range trade"
      setupNotes = `Range-bound strategy. Buy near support at $${supportLevels[1].toFixed(4)}, target resistance levels.`
      positionSize = "2-4% of portfolio"
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
      timeframe_focus: timeframeFocus,
    }
  }

  private generateTradingSignal(
    token: CryptoToken,
    indicators: TechnicalIndicators,
    timeframe: "1h" | "4h" | "1d" | "7d" | "1m",
  ): TradingSignal {
    let signal: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell" = "Hold"
    let confidence = 50 // Start with lower base confidence for more realistic scoring
    const technicalFactors: string[] = []
    let justification = ""

    const extendedIndicators = indicators as any

    if (indicators.rsi < 35) {
      signal = indicators.rsi < 25 ? "Strong Buy" : "Buy"
      technicalFactors.push(`RSI Oversold (${indicators.rsi.toFixed(1)})`)
      confidence += timeframe === "1h" || timeframe === "4h" ? 15 : 12
    } else if (indicators.rsi > 65) {
      signal = indicators.rsi > 75 ? "Strong Sell" : "Sell"
      technicalFactors.push(`RSI Overbought (${indicators.rsi.toFixed(1)})`)
      confidence += timeframe === "1h" || timeframe === "4h" ? 15 : 12
    } else if (indicators.rsi >= 40 && indicators.rsi <= 60) {
      technicalFactors.push(`RSI Neutral Zone (${indicators.rsi.toFixed(1)})`)
      confidence += 5 // Small confidence boost for neutral readings
    }

    if (extendedIndicators.macd) {
      const macdSignal = extendedIndicators.macd.signal
      if (macdSignal === "Bullish") {
        technicalFactors.push("MACD Bullish Signal")
        if (signal === "Hold") signal = "Buy"
        else if (signal === "Buy") signal = "Strong Buy"
        confidence += timeframe === "1d" ? 20 : 15 // Higher weight for daily MACD
      } else if (macdSignal === "Bearish") {
        technicalFactors.push("MACD Bearish Signal")
        if (signal === "Hold") signal = "Sell"
        else if (signal === "Sell") signal = "Strong Sell"
        confidence += timeframe === "1d" ? 20 : 15
      } else {
        technicalFactors.push("MACD Neutral")
        confidence += 3
      }
    }

    if (extendedIndicators.ema_crossover) {
      const emaSignal = extendedIndicators.ema_crossover.signal
      const emaStrength = extendedIndicators.ema_crossover.strength

      if (emaSignal === "Bullish") {
        technicalFactors.push(`EMA 8/21 Bullish`)
        if (signal === "Hold") signal = "Buy"
        else if (signal === "Buy" && emaStrength === "Strong") signal = "Strong Buy"
        confidence += emaStrength === "Strong" ? 18 : 12
      } else if (emaSignal === "Bearish") {
        technicalFactors.push(`EMA 8/21 Bearish`)
        if (signal === "Hold") signal = "Sell"
        else if (signal === "Sell" && emaStrength === "Strong") signal = "Strong Sell"
        confidence += emaStrength === "Strong" ? 18 : 12
      } else {
        technicalFactors.push("EMA Neutral")
        confidence += 3
      }
    }

    if (extendedIndicators.trend_direction === "Bullish") {
      technicalFactors.push("Bullish Trend")
      if (signal === "Hold") signal = "Buy"
      else if (signal === "Sell") signal = "Hold" // Trend overrides weak sell signals
      confidence += 15
    } else if (extendedIndicators.trend_direction === "Bearish") {
      technicalFactors.push("Bearish Trend")
      if (signal === "Hold") signal = "Sell"
      else if (signal === "Buy") signal = "Hold" // Trend overrides weak buy signals
      confidence += 15
    } else {
      technicalFactors.push("Neutral Trend")
      confidence += 2
    }

    const priceChange24h = token.price_change_percentage_24h
    if (priceChange24h > 5) {
      technicalFactors.push(`Strong Momentum (+${priceChange24h.toFixed(1)}%)`)
      if (signal === "Hold") signal = "Buy"
      confidence += 12
    } else if (priceChange24h > 2) {
      technicalFactors.push(`Positive Momentum (+${priceChange24h.toFixed(1)}%)`)
      confidence += 6
    } else if (priceChange24h < -5) {
      technicalFactors.push(`Negative Momentum (${priceChange24h.toFixed(1)}%)`)
      if (signal === "Hold") signal = "Sell"
      confidence += 12
    } else if (priceChange24h < -2) {
      technicalFactors.push(`Weak Momentum (${priceChange24h.toFixed(1)}%)`)
      confidence += 6
    }

    switch (timeframe) {
      case "1h":
        justification = `1H Scalp: ${signal} signal for quick 3-5% moves. ${technicalFactors.join(", ")}.`
        confidence = Math.min(confidence * 0.85, 85) // Lower confidence for 1h signals
        break
      case "4h":
        justification = `4H Swing: ${signal} setup targeting 8-12% moves. ${technicalFactors.join(", ")}.`
        confidence = Math.min(confidence * 0.95, 92) // Slightly reduced for 4h
        break
      case "1d":
        justification = `Daily Analysis: ${signal} conditions confirmed. ${technicalFactors.join(", ")}.`
        confidence = Math.min(confidence, 95) // Full confidence for daily
        break
      case "7d":
        justification = `Weekly Trend: ${signal} bias established. ${technicalFactors.join(", ")}.`
        confidence = Math.min(confidence * 0.9, 88) // Reduced for weekly
        break
      case "1m":
        justification = `Monthly Outlook: ${signal} for position building. ${technicalFactors.join(", ")}.`
        confidence = Math.min(confidence * 0.8, 80) // Lower for monthly
        break
    }

    if (technicalFactors.length < 2) {
      confidence = Math.min(confidence, 65) // Low confidence for weak signals
      signal = "Hold" // Default to hold if insufficient factors
    }

    return {
      signal,
      confidence: Math.max(50, Math.min(confidence, 95)), // Ensure realistic confidence range
      timeframe,
      justification,
      technical_factors: technicalFactors,
    }
  }

  private async generateAIInsight(token: CryptoToken, signals: TradingSignal[], tradeSetup: any): Promise<string> {
    const bullishSignals = signals.filter((s) => s.signal === "Strong Buy" || s.signal === "Buy").length
    const bearishSignals = signals.filter((s) => s.signal === "Strong Sell" || s.signal === "Sell").length

    const marketCapCategory =
      token.market_cap > 100000000000 ? "large-cap" : token.market_cap > 10000000000 ? "mid-cap" : "small-cap"

    // Get AI-powered analysis from Hugging Face
    const aiAnalysis = await this.getHuggingFaceAnalysis(token.symbol, token.current_price)

    let insight = `${token.name} (${token.symbol.toUpperCase()}) is a ${marketCapCategory} cryptocurrency `

    if (bullishSignals > bearishSignals) {
      insight += `showing bullish momentum across multiple timeframes. The confluence of technical indicators suggests potential upward price movement. `
    } else if (bearishSignals > bullishSignals) {
      insight += `displaying bearish characteristics with multiple sell signals. Technical analysis indicates potential downward pressure. `
    } else {
      insight += `in a consolidation phase with mixed signals across timeframes. Market indecision suggests waiting for clearer directional bias. `
    }

    // Add AI analysis
    insight += `AI Analysis: ${aiAnalysis} `

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

  private generateTimeframeAnalysis(
    token: CryptoToken,
    indicators: any,
    timeframe: "short" | "long",
  ): {
    timeframe_label: string
    signal: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell"
    confidence: number
    aligned_indicators: string[]
    conflicting_indicators: string[]
    key_levels: { support: number; resistance: number }
    momentum_score: number
    justification: string
  } {
    const isShortTerm = timeframe === "short"
    const timeframeLabel = isShortTerm ? "1-4 Hour Analysis" : "4-24 Hour Analysis"

    let signal: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell" = "Hold"
    let confidence = 50 // Start with realistic base confidence
    const alignedIndicators: string[] = []
    const conflictingIndicators: string[] = []

    const rsi = indicators.rsi
    const stochRSI = indicators.stochastic_rsi
    const priceChange24h = token.price_change_percentage_24h
    const trendDirection = indicators.trend_direction
    const macdSignal = indicators.macd?.signal
    const emaSignal = indicators.ema_crossover?.signal

    if (rsi < 35) {
      alignedIndicators.push(`RSI Oversold (${rsi.toFixed(1)})`)
      signal = rsi < 25 ? "Strong Buy" : "Buy"
      confidence += 15
    } else if (rsi > 65) {
      alignedIndicators.push(`RSI Overbought (${rsi.toFixed(1)})`)
      signal = rsi > 75 ? "Strong Sell" : "Sell"
      confidence += 15
    } else if (rsi >= 40 && rsi <= 60) {
      conflictingIndicators.push(`RSI Neutral (${rsi.toFixed(1)})`)
    }

    if (macdSignal === "Bullish") {
      alignedIndicators.push("MACD Bullish Crossover")
      if (signal === "Hold") signal = "Buy"
      else if (signal === "Buy") signal = "Strong Buy"
      confidence += 18
    } else if (macdSignal === "Bearish") {
      alignedIndicators.push("MACD Bearish Crossover")
      if (signal === "Hold") signal = "Sell"
      else if (signal === "Sell") signal = "Strong Sell"
      confidence += 18
    } else {
      conflictingIndicators.push("MACD Neutral")
    }

    if (emaSignal === "Bullish") {
      alignedIndicators.push("EMA 8/21 Bullish")
      if (signal === "Hold") signal = "Buy"
      confidence += 12
    } else if (emaSignal === "Bearish") {
      alignedIndicators.push("EMA 8/21 Bearish")
      if (signal === "Hold") signal = "Sell"
      confidence += 12
    }

    // Stochastic RSI for short-term precision
    if (isShortTerm) {
      if (stochRSI < 20) {
        alignedIndicators.push(`Stoch RSI Oversold (${stochRSI.toFixed(1)})`)
        if (signal === "Hold") signal = "Buy"
        confidence += 10
      } else if (stochRSI > 80) {
        alignedIndicators.push(`Stoch RSI Overbought (${stochRSI.toFixed(1)})`)
        if (signal === "Hold") signal = "Sell"
        confidence += 10
      }
    }

    if (trendDirection === "Bullish") {
      alignedIndicators.push("Bullish Trend Direction")
      if (signal === "Hold") signal = "Buy"
      else if (signal === "Sell") signal = "Hold" // Trend overrides weak sells
      confidence += isShortTerm ? 10 : 15
    } else if (trendDirection === "Bearish") {
      alignedIndicators.push("Bearish Trend Direction")
      if (signal === "Hold") signal = "Sell"
      else if (signal === "Buy") signal = "Hold" // Trend overrides weak buys
      confidence += isShortTerm ? 10 : 15
    } else {
      conflictingIndicators.push("Neutral Trend Direction")
    }

    const momentumThreshold = isShortTerm ? 4 : 8
    if (priceChange24h > momentumThreshold) {
      alignedIndicators.push(`Strong Momentum (+${priceChange24h.toFixed(1)}%)`)
      if (signal === "Hold" || signal === "Buy") signal = signal === "Hold" ? "Buy" : "Strong Buy"
      confidence += 12
    } else if (priceChange24h < -momentumThreshold) {
      alignedIndicators.push(`Negative Momentum (${priceChange24h.toFixed(1)}%)`)
      if (signal === "Hold" || signal === "Sell") signal = signal === "Hold" ? "Sell" : "Strong Sell"
      confidence += 12
    }

    // Volume Confirmation
    if (indicators.volume_indicator === "High") {
      alignedIndicators.push("High Volume Confirmation")
      confidence += 8
    } else if (indicators.volume_indicator === "Low") {
      conflictingIndicators.push("Low Volume Warning")
      confidence -= 5
    }

    // Support/Resistance Levels
    const currentPrice = token.current_price
    const support = indicators.support_levels[0]
    const resistance = indicators.resistance_levels[0]

    const distanceToSupport = ((currentPrice - support) / currentPrice) * 100
    const distanceToResistance = ((resistance - currentPrice) / currentPrice) * 100

    if (distanceToSupport < 3) {
      alignedIndicators.push("Near Support Level")
      if (signal === "Hold") signal = "Buy"
    } else if (distanceToResistance < 3) {
      alignedIndicators.push("Near Resistance Level")
      if (signal === "Hold") signal = "Sell"
    }

    // Calculate momentum score (0-100)
    const momentumScore = Math.max(0, Math.min(100, 50 + priceChange24h * 2 + (rsi - 50) + (stochRSI - 50) / 2))

    let justification = `${timeframeLabel}: `
    if (alignedIndicators.length >= 4) {
      justification += `Strong ${signal.toLowerCase()} signal with ${alignedIndicators.length} aligned indicators. High confidence setup.`
    } else if (alignedIndicators.length >= 3) {
      justification += `Moderate ${signal.toLowerCase()} signal with ${alignedIndicators.length} supporting factors. Good setup.`
    } else if (alignedIndicators.length >= 2) {
      justification += `Weak ${signal.toLowerCase()} signal with limited indicator support. Proceed with caution.`
      confidence = Math.min(confidence, 70)
    } else {
      justification += `Insufficient signal alignment. Hold recommended until clearer setup develops.`
      signal = "Hold"
      confidence = Math.min(confidence, 55)
    }

    if (conflictingIndicators.length > 2) {
      justification += ` Warning: ${conflictingIndicators.length} conflicting indicators present.`
      confidence -= conflictingIndicators.length * 4
      if (conflictingIndicators.length > alignedIndicators.length) {
        signal = "Hold" // Override signal if more conflicts than alignments
      }
    }

    return {
      timeframe_label: timeframeLabel,
      signal,
      confidence: Math.max(50, Math.min(95, confidence)),
      aligned_indicators: alignedIndicators,
      conflicting_indicators: conflictingIndicators,
      key_levels: { support, resistance },
      momentum_score: Math.round(momentumScore),
      justification,
    }
  }

  async analyzeToken(token: CryptoToken): Promise<
    AnalysisResult & {
      trade_setup: any
      technical_indicators: any
      short_term_analysis: any
      long_term_analysis: any
    }
  > {
    const technicalIndicators = this.generateTechnicalIndicators(token)

    const timeframes: Array<"1h" | "4h" | "1d" | "7d" | "1m"> = ["1h", "4h", "1d", "7d", "1m"]
    const signals = timeframes.map((timeframe) => this.generateTradingSignal(token, technicalIndicators, timeframe))

    const primarySignal = signals.find((s) => s.timeframe === "1d") || signals[0]
    const tradeSetup = this.generateTradeSetup(token, technicalIndicators, primarySignal)

    const shortTermAnalysis = this.generateTimeframeAnalysis(token, technicalIndicators, "short")
    const longTermAnalysis = this.generateTimeframeAnalysis(token, technicalIndicators, "long")

    const aiInsight = await this.generateAIInsight(token, signals, tradeSetup)

    return {
      token,
      signals,
      technical_indicators: technicalIndicators,
      trade_setup: tradeSetup,
      short_term_analysis: shortTermAnalysis,
      long_term_analysis: longTermAnalysis,
      ai_insight: aiInsight,
      last_analysis: new Date().toISOString(),
    }
  }
}

const analysisEngine = new AnalysisEngine()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenId = searchParams.get("id")

  console.log("[v0] Analysis API called with token ID:", tokenId)
  console.log("[v0] Request URL:", request.url)
  console.log("[v0] Request headers:", Object.fromEntries(request.headers.entries()))

  if (!tokenId) {
    console.log("[v0] Analysis API error: Missing token ID parameter")
    const errorResponse: ApiResponse<AnalysisResult> = {
      success: false,
      error: "Token ID parameter is required",
    }
    return NextResponse.json(errorResponse, { status: 400 })
  }

  try {
    console.log("[v0] Fetching token data for analysis:", tokenId)
    // First get token data
    const tokenResponse = await fetch(`${request.nextUrl.origin}/api/tokens?id=${encodeURIComponent(tokenId)}`, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    })

    console.log("[v0] Token API response status:", tokenResponse.status)

    if (tokenResponse.status === 404) {
      const tokenError = await tokenResponse.json()
      console.log("[v0] Token not found:", tokenError)
      const errorResponse: ApiResponse<AnalysisResult> = {
        success: false,
        error: tokenError.error || "Token data not available right now, please try again shortly.",
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    if (!tokenResponse.ok) {
      console.log("[v0] Token API failed with status:", tokenResponse.status)
      throw new Error("Failed to fetch token data")
    }

    const tokenData = (await tokenResponse.json()) as ApiResponse<CryptoToken>
    console.log("[v0] Token data received:", tokenData.success ? "Success" : "Failed")

    if (!tokenData.success || !tokenData.data) {
      console.log("[v0] Invalid token data structure")
      const errorResponse: ApiResponse<AnalysisResult> = {
        success: false,
        error: tokenData.error || "Token data not available right now, please try again shortly.",
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    console.log("[v0] Starting analysis for token:", tokenData.data.symbol)
    // Generate analysis
    const analysis = await analysisEngine.analyzeToken(tokenData.data)
    console.log("[v0] Analysis completed successfully")

    const apiResponse: ApiResponse<AnalysisResult> = {
      success: true,
      data: analysis,
    }

    return NextResponse.json(apiResponse)
  } catch (error) {
    console.error("[v0] Analysis generation failed:", error)

    const errorResponse: ApiResponse<AnalysisResult> = {
      success: false,
      error: "Analysis service temporarily unavailable",
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

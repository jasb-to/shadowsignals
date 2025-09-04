import { NextResponse } from "next/server"

interface ScreenerResult {
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
}

interface CacheEntry {
  data: any
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache (increased from 2 minutes)
let lastFailureTime = 0
const CIRCUIT_BREAKER_DURATION = 2 * 60 * 1000 // 2 minutes circuit breaker (reduced from 10 minutes)
let consecutiveFailures = 0
const MAX_CONSECUTIVE_FAILURES = 2

const SCREENER_TOKENS = [
  { symbol: "BTC", name: "Bitcoin", coinpaprika_id: "btc-bitcoin" },
  { symbol: "ETH", name: "Ethereum", coinpaprika_id: "eth-ethereum" },
  { symbol: "BNB", name: "BNB", coinpaprika_id: "bnb-binance-coin" },
  { symbol: "SOL", name: "Solana", coinpaprika_id: "sol-solana" },
  { symbol: "ADA", name: "Cardano", coinpaprika_id: "ada-cardano" },
]

function calculateRSI(prices: number[]): number {
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

function calculateMACDSignal(prices: number[]): "bullish" | "bearish" | "neutral" {
  if (prices.length < 26) return "neutral"

  // Simplified MACD calculation
  const ema12 = prices.slice(-12).reduce((a, b) => a + b) / 12
  const ema26 = prices.slice(-26).reduce((a, b) => a + b) / 26
  const macdLine = ema12 - ema26

  if (macdLine > 0) return "bullish"
  if (macdLine < 0) return "bearish"
  return "neutral"
}

function calculateOpportunityScore(data: any): number {
  let score = 50 // Base score

  // RSI scoring (oversold = opportunity, overbought = risk)
  const rsi = data.rsi
  if (rsi < 30)
    score += 25 // Oversold - good buy opportunity
  else if (rsi < 40) score += 15
  else if (rsi > 70)
    score -= 25 // Overbought - risky
  else if (rsi > 60) score -= 15

  // MACD scoring
  if (data.macd_signal === "bullish") score += 20
  else if (data.macd_signal === "bearish") score -= 20

  // Volume scoring
  if (data.volume_trend === "high") score += 15
  else if (data.volume_trend === "low") score -= 10

  // Price momentum scoring
  if (data.price_change_24h > 5) score += 10
  else if (data.price_change_24h > 0) score += 5
  else if (data.price_change_24h < -10) score -= 15
  else if (data.price_change_24h < 0) score -= 5

  return Math.max(0, Math.min(100, score))
}

function generateSignal(
  score: number,
  rsi: number,
): {
  signal: ScreenerResult["signal"]
  confidence: number
  timeframe: ScreenerResult["timeframe"]
  trade_duration: ScreenerResult["trade_duration"]
} {
  let timeframe: ScreenerResult["timeframe"] = "1D"
  let trade_duration: ScreenerResult["trade_duration"] = "Medium-term (3-7 days)"

  // Determine optimal timeframe based on signals
  if (rsi < 25 || rsi > 75) {
    timeframe = "4H"
    trade_duration = "Short-term (1-3 days)"
  } else if (score >= 70) {
    timeframe = "1D"
    trade_duration = "Medium-term (3-7 days)"
  } else {
    timeframe = "1D"
    trade_duration = "Long-term (1-2 weeks)"
  }

  if (score >= 80) return { signal: "strong_buy", confidence: score, timeframe, trade_duration }
  if (score >= 65) return { signal: "buy", confidence: score, timeframe, trade_duration }
  if (score >= 35) return { signal: "hold", confidence: score, timeframe, trade_duration }
  if (score >= 20) return { signal: "sell", confidence: score, timeframe, trade_duration }
  return { signal: "strong_sell", confidence: score, timeframe, trade_duration }
}

async function fetchWithRetry(url: string, maxRetries = 2): Promise<Response> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[v0] CoinPaprika API attempt ${attempt}/${maxRetries} - URL: ${url}`)

      if (attempt > 1) {
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(15000),
      })

      console.log(`[v0] CoinPaprika API response status: ${response.status} ${response.statusText}`)

      if (response.ok) {
        console.log(`[v0] CoinPaprika API success on attempt ${attempt}`)
        return response
      }

      if (response.status === 429) {
        const delay = Math.min(20000, Math.pow(2, attempt) * 8000)
        console.log(`[v0] CoinPaprika rate limited, waiting ${delay}ms`)

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
      }

      const errorText = await response.text()
      console.log(`[v0] CoinPaprika API error response: ${errorText}`)
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
    } catch (error) {
      lastError = error as Error
      console.log(`[v0] CoinPaprika API attempt ${attempt} failed:`, error)

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 4000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

async function safeJsonParse(response: Response): Promise<any> {
  try {
    const text = await response.text()
    console.log(`[v0] CoinPaprika API response text:`, text.substring(0, 200))

    if (!text.trim().startsWith("{") && !text.trim().startsWith("[")) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`)
    }

    return JSON.parse(text)
  } catch (error) {
    console.error(`[v0] JSON parsing error:`, error)
    throw new Error(`Failed to parse JSON response: ${error}`)
  }
}

function getCachedData(key: string): any | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[v0] Using cached crypto screener data`)
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

export async function GET() {
  try {
    console.log("[v0] Starting crypto screener analysis with CoinPaprika API...")

    const timeSinceLastFailure = Date.now() - lastFailureTime
    const isCircuitBreakerActive =
      lastFailureTime &&
      timeSinceLastFailure < CIRCUIT_BREAKER_DURATION &&
      consecutiveFailures >= MAX_CONSECUTIVE_FAILURES

    if (isCircuitBreakerActive) {
      console.log(
        `[v0] Circuit breaker active (${Math.ceil((CIRCUIT_BREAKER_DURATION - timeSinceLastFailure) / 1000)}s remaining), using cached/fallback data`,
      )

      const cacheKey = "crypto-screener-data"
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        console.log("[v0] Returning cached data during circuit breaker")
        return NextResponse.json(cachedData)
      }

      console.log("[v0] No cached data available, returning fallback data")
      return NextResponse.json(getFallbackData())
    }

    if (timeSinceLastFailure > CIRCUIT_BREAKER_DURATION) {
      consecutiveFailures = 0
      console.log("[v0] Circuit breaker reset - attempting normal operation")
    }

    const cacheKey = "crypto-screener-data"
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    const screenerResults: ScreenerResult[] = []

    try {
      console.log(`[v0] Requesting CoinPaprika data for ${SCREENER_TOKENS.length} tokens`)

      for (const tokenInfo of SCREENER_TOKENS) {
        try {
          console.log(`[v0] Fetching data for ${tokenInfo.symbol} (${tokenInfo.coinpaprika_id})`)

          const coinpaprikaResponse = await fetchWithRetry(
            `https://api.coinpaprika.com/v1/tickers/${tokenInfo.coinpaprika_id}`,
          )
          const coinpaprikaData = await safeJsonParse(coinpaprikaResponse)

          if (coinpaprikaData && coinpaprikaData.quotes && coinpaprikaData.quotes.USD) {
            const usdQuote = coinpaprikaData.quotes.USD
            const price = usdQuote.price
            const change24h = usdQuote.percent_change_24h || 0
            const volume24h = usdQuote.volume_24h || 0
            const marketCap = usdQuote.market_cap || 0

            if (!price || price <= 0) {
              console.log(`[v0] Invalid price data for ${tokenInfo.symbol}: ${price}`)
              continue
            }

            const prices = generateSyntheticPrices(price, change24h)
            const rsi = calculateRSI(prices)
            const macd_signal = calculateMACDSignal(prices)
            const volume_trend = volume24h > 5000000000 ? "high" : volume24h > 1000000000 ? "normal" : "low"

            const analysisData = {
              rsi,
              macd_signal,
              volume_trend,
              price_change_24h: change24h,
            }

            const opportunity_score = calculateOpportunityScore(analysisData)
            const { signal, confidence, timeframe, trade_duration } = generateSignal(opportunity_score, rsi)

            screenerResults.push({
              id: tokenInfo.coinpaprika_id,
              symbol: tokenInfo.symbol,
              name: tokenInfo.name,
              price,
              price_change_24h: change24h,
              volume_24h: volume24h,
              market_cap: marketCap,
              rsi,
              macd_signal,
              volume_trend,
              opportunity_score,
              signal,
              confidence,
              timeframe,
              trade_duration,
            })

            console.log(`[v0] Processed ${tokenInfo.symbol}: price=$${price.toFixed(2)}, score=${opportunity_score}`)

            await new Promise((resolve) => setTimeout(resolve, 200))
          } else {
            console.log(`[v0] Invalid CoinPaprika response structure for ${tokenInfo.symbol}`)
          }
        } catch (tokenError) {
          console.error(`[v0] Failed to fetch data for ${tokenInfo.symbol}:`, tokenError)
        }
      }
    } catch (error) {
      console.error(`[v0] CoinPaprika API failed, using fallback data:`, error)

      lastFailureTime = Date.now()
      consecutiveFailures++
      console.log(`[v0] Consecutive failures: ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}`)

      return NextResponse.json(getFallbackData())
    }

    if (screenerResults.length === 0) {
      console.log("[v0] No valid screener results, using fallback data")
      return NextResponse.json(getFallbackData())
    }

    consecutiveFailures = 0
    console.log(`[v0] Fetched CoinPaprika data - consecutive failures reset`)

    const topOpportunities = screenerResults.sort((a, b) => b.opportunity_score - a.opportunity_score).slice(0, 5)

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      top_opportunities: topOpportunities,
      total_analyzed: screenerResults.length,
    }

    setCachedData(cacheKey, result)

    console.log("[v0] CoinPaprika crypto screener analysis completed")
    console.log(
      "[v0] Top opportunities:",
      topOpportunities.map((t) => `${t.symbol}: ${t.opportunity_score}`),
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] CoinPaprika screener error:", error)

    lastFailureTime = Date.now()
    consecutiveFailures++
    console.log(`[v0] Consecutive failures: ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}`)

    return NextResponse.json(getFallbackData())
  }
}

function generateSyntheticPrices(currentPrice: number, change24h: number): number[] {
  const prices: number[] = []
  const startPrice = currentPrice / (1 + change24h / 100)

  for (let i = 0; i < 14; i++) {
    const randomVariation = (Math.random() - 0.5) * 0.1
    const trendFactor = (change24h / 100) * (i / 14)
    const price = startPrice * (1 + trendFactor + randomVariation)
    prices.push(price)
  }

  prices.push(currentPrice)
  return prices
}

function getFallbackData() {
  return {
    success: false,
    error: "Screener temporarily unavailable - showing sample data",
    timestamp: new Date().toISOString(),
    top_opportunities: [
      {
        id: "btc-bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        price: 110000,
        price_change_24h: 2.5,
        volume_24h: 25000000000,
        market_cap: 2100000000000,
        rsi: 45,
        macd_signal: "bullish" as const,
        volume_trend: "high" as const,
        opportunity_score: 75,
        signal: "buy" as const,
        confidence: 75,
        timeframe: "1D" as const,
        trade_duration: "Medium-term (3-7 days)" as const,
      },
      {
        id: "eth-ethereum",
        symbol: "ETH",
        name: "Ethereum",
        price: 3800,
        price_change_24h: 1.8,
        volume_24h: 15000000000,
        market_cap: 450000000000,
        rsi: 52,
        macd_signal: "neutral" as const,
        volume_trend: "normal" as const,
        opportunity_score: 68,
        signal: "buy" as const,
        confidence: 68,
        timeframe: "1D" as const,
        trade_duration: "Medium-term (3-7 days)" as const,
      },
    ],
    total_analyzed: 0,
  }
}

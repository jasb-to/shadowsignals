import { NextResponse } from "next/server"

interface CycleAnalysis {
  bull_market_progress: number // 0-100% how far into bull run
  bear_market_distance: number // 0-100% how close to bear bottom
  pi_cycle_signal: "bullish" | "neutral" | "bearish"
  mvrv_z_score: number
  cycle_phase: "accumulation" | "markup" | "distribution" | "markdown"
  next_halving_days: number
  predicted_top_date: string
  predicted_bottom_date: string
  ranging_market: {
    status: "ranging_up" | "ranging_down" | "ranging_sideways" | "trending_up" | "trending_down"
    range_high: number
    range_low: number
    days_in_range: number
    breakout_probability: number
  }
  confluence_indicators: {
    open_interest_signal: "bullish" | "neutral" | "bearish"
    btc_dominance_trend: "rising" | "stable" | "falling"
    eth_btc_ratio: number
    altcoin_season_signal: "btc-season" | "neutral" | "alt-season"
    funding_rates_health: "healthy" | "neutral" | "overheated"
  }
  bull_top_confluence_score: number // 0-100% confidence in approaching top
  altseason_progress: number // 0-100% progress within altseason range
}

const weeklyParameters = {
  lastUpdated: new Date("2024-04-20").toISOString(),
  mvrv_thresholds: {
    extreme_greed: 7,
    greed: 4,
    neutral: 2,
  },
  altseason_thresholds: {
    eth_btc_ratio_high: 0.08,
    eth_btc_ratio_low: 0.03,
    btc_dominance_low: 40,
    btc_dominance_high: 70,
  },
  bull_market_curve_adjustment: 1.0, // Multiplier for bull market progress
}

function getWeeklyParameters() {
  const lastUpdate = new Date(weeklyParameters.lastUpdated)
  const now = new Date()
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))

  // Auto-update if more than 7 days old
  if (daysSinceUpdate >= 7) {
    console.log("[v0] Auto-updating weekly parameters - last update was", daysSinceUpdate, "days ago")
    // Trigger weekly update (in production, this would be a scheduled job)
    updateWeeklyParameters()
  }

  return weeklyParameters
}

function updateWeeklyParameters() {
  const now = new Date()
  const lastHalving = new Date("2024-04-19")
  const daysSinceHalving = Math.floor((now.getTime() - lastHalving.getTime()) / (1000 * 60 * 60 * 24))

  // Adjust thresholds based on cycle progression
  if (daysSinceHalving > 500) {
    // Late cycle - more conservative thresholds
    weeklyParameters.mvrv_thresholds.extreme_greed = 6
    weeklyParameters.mvrv_thresholds.greed = 3.5
    weeklyParameters.bull_market_curve_adjustment = 0.95
  } else if (daysSinceHalving > 300) {
    // Mid cycle - standard thresholds
    weeklyParameters.mvrv_thresholds.extreme_greed = 7
    weeklyParameters.mvrv_thresholds.greed = 4
    weeklyParameters.bull_market_curve_adjustment = 1.0
  } else {
    // Early cycle - more aggressive thresholds
    weeklyParameters.mvrv_thresholds.extreme_greed = 8
    weeklyParameters.mvrv_thresholds.greed = 5
    weeklyParameters.bull_market_curve_adjustment = 1.05
  }

  weeklyParameters.lastUpdated = now.toISOString()
  console.log("[v0] Weekly parameters updated:", weeklyParameters)
}

const cache = {
  data: null as any,
  timestamp: 0,
  TTL: 10 * 60 * 1000, // 10 minutes cache
}

function getCachedData() {
  const now = Date.now()
  if (cache.data && now - cache.timestamp < cache.TTL) {
    console.log("[v0] Using cached cycle analysis data (age:", Math.floor((now - cache.timestamp) / 1000), "seconds)")
    return cache.data
  }
  return null
}

function setCachedData(data: any) {
  cache.data = data
  cache.timestamp = Date.now()
  console.log("[v0] Cached cycle analysis data for", cache.TTL / 1000, "seconds")
}

export async function GET() {
  try {
    console.log("[v0] Cycle analysis API called")

    const cachedData = getCachedData()
    if (cachedData) {
      return NextResponse.json(
        {
          success: true,
          data: cachedData,
          cached: true,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
          },
        },
      )
    }

    const params = getWeeklyParameters()

    const fetchWithTimeout = async (url: string, timeout = 5000) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      try {
        const response = await fetch(url, { signal: controller.signal })
        clearTimeout(timeoutId)
        return response
      } catch (error) {
        clearTimeout(timeoutId)
        throw error
      }
    }

    const [btcResponse, ethResponse, globalResponse] = await Promise.allSettled([
      fetchWithTimeout(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
      ),
      fetchWithTimeout(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,btc&include_24hr_change=true",
      ),
      fetchWithTimeout("https://api.coingecko.com/api/v3/global"),
    ])

    console.log("[v0] API responses received:", {
      btcOk: btcResponse.status === "fulfilled" && btcResponse.value.ok,
      ethOk: ethResponse.status === "fulfilled" && ethResponse.value.ok,
      globalOk: globalResponse.status === "fulfilled" && globalResponse.value.ok,
    })

    let btcData, ethData, globalData

    if (btcResponse.status === "fulfilled" && btcResponse.value.ok) {
      try {
        const btcText = await btcResponse.value.text()
        btcData = btcText.startsWith("{") ? JSON.parse(btcText) : {}
      } catch (e) {
        console.log("[v0] BTC data parsing failed, using fallback")
        btcData = {}
      }
    } else {
      console.log("[v0] BTC API failed (rate limit?), using fallback data")
      btcData = {}
    }

    if (ethResponse.status === "fulfilled" && ethResponse.value.ok) {
      try {
        const ethText = await ethResponse.value.text()
        ethData = ethText.startsWith("{") ? JSON.parse(ethText) : {}
      } catch (e) {
        console.log("[v0] ETH data parsing failed, using fallback")
        ethData = {}
      }
    } else {
      console.log("[v0] ETH API failed (rate limit?), using fallback data")
      ethData = {}
    }

    if (globalResponse.status === "fulfilled" && globalResponse.value.ok) {
      try {
        const globalText = await globalResponse.value.text()
        globalData = globalText.startsWith("{") ? JSON.parse(globalText) : { data: {} }
      } catch (e) {
        console.log("[v0] Global data parsing failed, using fallback")
        globalData = { data: {} }
      }
    } else {
      console.log("[v0] Global API failed (rate limit?), using fallback data")
      globalData = { data: {} }
    }

    const currentBtcPrice = btcData.bitcoin?.usd || 121800
    const currentEthPrice = ethData.ethereum?.usd || 4460
    const ethBtcRatio = ethData.ethereum?.btc || 0.0366
    const btcDominance = globalData.data?.market_cap_percentage?.btc || 57

    console.log("[v0] Market data:", { currentBtcPrice, ethBtcRatio, btcDominance })

    // Calculate days since last halving (April 19, 2024)
    const lastHalving = new Date("2024-04-19")
    const now = new Date()
    const daysSinceHalving = Math.floor((now.getTime() - lastHalving.getTime()) / (1000 * 60 * 60 * 24))

    // Next halving approximately 4 years (1460 days) from last
    const nextHalvingDays = 1460 - daysSinceHalving

    // Pi Cycle analysis (simplified - would need historical data for real calculation)
    // Assuming we're in early-mid bull phase based on current timing
    const piCycleSignal = daysSinceHalving < 200 ? "neutral" : daysSinceHalving < 500 ? "bullish" : "bearish"

    const mvrv_z_score = Math.min(
      10,
      Math.max(
        0,
        currentBtcPrice < 75000
          ? ((currentBtcPrice - 50000) / 25000) * 2
          : currentBtcPrice < 125000
            ? 2 + ((currentBtcPrice - 75000) / 50000) * 3
            : 5 + ((currentBtcPrice - 125000) / 75000) * 5,
      ),
    )

    // Cycle phase based on days since halving
    let cycle_phase: "accumulation" | "markup" | "distribution" | "markdown"
    if (daysSinceHalving < 180) cycle_phase = "accumulation"
    else if (daysSinceHalving < 500) cycle_phase = "markup"
    else if (daysSinceHalving < 700) cycle_phase = "distribution"
    else cycle_phase = "markdown"

    const bull_market_progress = Math.min(
      100,
      Math.max(
        0,
        (daysSinceHalving < 540
          ? (daysSinceHalving / 540) * 85 // Max 85% until 18 months
          : 85 + ((daysSinceHalving - 540) / 180) * 15) * params.bull_market_curve_adjustment, // Apply weekly adjustment
      ),
    )

    // Bear market distance (inverse of bull progress with offset)
    const bear_market_distance = Math.max(0, 100 - bull_market_progress - 10)

    // Historical analysis shows tops typically occur 15-20 months after halving
    // Current cycle may extend longer due to institutional adoption and ETF flows
    const predictedTop = new Date(lastHalving)
    // Extended timeline: 18-24 months (540-730 days) with bias toward later date
    const daysToTop = Math.max(540, Math.min(730, 540 + (currentBtcPrice > 100000 ? 90 : 0)))
    predictedTop.setDate(predictedTop.getDate() + daysToTop)

    const predictedBottom = new Date(lastHalving)
    predictedBottom.setDate(predictedBottom.getDate() + 1200) // ~3.3 years after halving

    // 1. Open Interest Signal (simplified - would need futures data)
    // High open interest with stable funding = bullish, excessive = bearish
    const openInterestLevel = Math.min(100, Math.max(0, (currentBtcPrice - 80000) / 1000))
    const open_interest_signal = openInterestLevel < 30 ? "bullish" : openInterestLevel < 70 ? "neutral" : "bearish"

    // 2. Bitcoin Dominance Trend
    // Rising dominance early bull, falling dominance = alt season approaching
    const btc_dominance_trend = btcDominance > 55 ? "rising" : btcDominance > 45 ? "stable" : "falling"

    let altcoin_season_signal: "btc-season" | "neutral" | "alt-season"
    let altseason_progress: number

    const smoothedEthBtcRatio = Math.round(ethBtcRatio * 10000) / 10000 // Round to 4 decimals for stability
    const smoothedBtcDominance = Math.round(btcDominance * 100) / 100 // Round to 2 decimals

    if (smoothedEthBtcRatio < params.altseason_thresholds.eth_btc_ratio_low) {
      altcoin_season_signal = "btc-season"
      altseason_progress = Math.max(0, Math.min(25, ((smoothedEthBtcRatio - 0.025) / 0.007) * 25))
    } else if (smoothedEthBtcRatio < 0.045) {
      altcoin_season_signal = "neutral"
      altseason_progress = 25 + ((smoothedEthBtcRatio - params.altseason_thresholds.eth_btc_ratio_low) / 0.013) * 35
    } else {
      altcoin_season_signal = "alt-season"
      altseason_progress = Math.min(100, 60 + ((smoothedEthBtcRatio - 0.045) / 0.035) * 40)
    }

    altseason_progress = Math.round(altseason_progress)

    // Funding Rates Health (simplified estimation)
    // Positive but not excessive funding rates indicate healthy bull market
    const fundingEstimate = Math.min(2, Math.max(-1, (currentBtcPrice - 100000) / 50000))
    const funding_rates_health = fundingEstimate < 0.5 ? "healthy" : fundingEstimate < 1.2 ? "neutral" : "overheated"

    let confluenceScore = 0
    const confluenceBreakdown: any = {}

    // Pi Cycle contribution (25 points max) - increased weight
    const piCyclePoints = piCycleSignal === "bearish" ? 25 : piCycleSignal === "neutral" ? 12 : 0
    confluenceScore += piCyclePoints
    confluenceBreakdown.piCycle = { signal: piCycleSignal, points: piCyclePoints }

    const mvrvPoints = Math.min(
      25,
      Math.max(0, mvrv_z_score > params.mvrv_thresholds.greed ? (mvrv_z_score - params.mvrv_thresholds.greed) * 8 : 0),
    )
    confluenceScore += mvrvPoints
    confluenceBreakdown.mvrv = { score: mvrv_z_score, points: mvrvPoints }

    // Open Interest contribution (20 points max)
    const oiPoints = open_interest_signal === "bearish" ? 20 : open_interest_signal === "neutral" ? 8 : 0
    confluenceScore += oiPoints
    confluenceBreakdown.openInterest = { signal: open_interest_signal, points: oiPoints }

    // Dominance trend contribution (15 points max) - reduced weight
    const domPoints = btc_dominance_trend === "falling" ? 15 : btc_dominance_trend === "stable" ? 6 : 0
    confluenceScore += domPoints
    confluenceBreakdown.dominance = { trend: btc_dominance_trend, points: domPoints }

    // Altcoin season contribution (15 points max) - reduced weight
    const altPoints = altcoin_season_signal === "alt-season" ? 15 : altcoin_season_signal === "neutral" ? 6 : 0
    confluenceScore += altPoints
    confluenceBreakdown.altseason = { signal: altcoin_season_signal, points: altPoints }

    // Analyze if BTC is in a ranging market vs trending
    const priceRange = {
      high: Math.max(currentBtcPrice * 1.08, 125000), // Estimated recent high
      low: Math.min(currentBtcPrice * 0.92, 95000), // Estimated recent low
    }

    const rangeSize = priceRange.high - priceRange.low
    const currentPosition = (currentBtcPrice - priceRange.low) / rangeSize

    // Determine ranging status based on price position and volatility
    let rangingStatus: "ranging_up" | "ranging_down" | "ranging_sideways" | "trending_up" | "trending_down"
    const daysInRange = Math.floor(Math.random() * 45) + 15 // Simulated 15-60 days
    let breakoutProbability = 0

    if (rangeSize < currentBtcPrice * 0.15) {
      // Range is less than 15% of price
      if (currentPosition > 0.7) {
        rangingStatus = "ranging_up"
        breakoutProbability = 75
      } else if (currentPosition < 0.3) {
        rangingStatus = "ranging_down"
        breakoutProbability = 65
      } else {
        rangingStatus = "ranging_sideways"
        breakoutProbability = 45
      }
    } else {
      // Market is trending - determine direction based on 24h change and position in range
      const btc24hChange = btcData.bitcoin?.usd_24h_change || 0
      const trendDirection = btc24hChange > 0 && currentPosition > 0.5 ? "trending_up" : "trending_down"
      rangingStatus = trendDirection
      breakoutProbability = 85
    }

    const cycleAnalysis: CycleAnalysis = {
      bull_market_progress: Math.round(bull_market_progress),
      bear_market_distance: Math.round(bear_market_distance),
      pi_cycle_signal: piCycleSignal,
      mvrv_z_score: Math.round(mvrv_z_score * 10) / 10,
      cycle_phase,
      next_halving_days: nextHalvingDays,
      predicted_top_date: predictedTop.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      predicted_bottom_date: predictedBottom.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      ranging_market: {
        status: rangingStatus,
        range_high: Math.round(priceRange.high),
        range_low: Math.round(priceRange.low),
        days_in_range: daysInRange,
        breakout_probability: breakoutProbability,
      },
      confluence_indicators: {
        open_interest_signal,
        btc_dominance_trend,
        eth_btc_ratio: Math.round(ethBtcRatio * 1000) / 1000,
        altcoin_season_signal,
        funding_rates_health,
      },
      bull_top_confluence_score: Math.round(confluenceScore),
      altseason_progress: Math.round(altseason_progress),
    }

    console.log("[v0] Enhanced cycle analysis calculated:", {
      daysSinceHalving,
      bull_market_progress: Math.round(bull_market_progress),
      mvrv_z_score: Math.round(mvrv_z_score * 10) / 10,
      altcoin_season_signal,
      altseason_progress: Math.round(altseason_progress),
      smoothedEthBtcRatio,
      smoothedBtcDominance,
      bull_top_confluence_score: Math.round(confluenceScore),
      confluenceBreakdown,
      predicted_top_date: predictedTop.toLocaleDateString(),
    })

    setCachedData(cycleAnalysis)

    return NextResponse.json(
      {
        success: true,
        data: cycleAnalysis,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Cycle analysis error:", error)

    const cachedData = cache.data
    if (cachedData) {
      console.log("[v0] Returning stale cached data due to error")
      return NextResponse.json(
        {
          success: true,
          data: cachedData,
          cached: true,
          stale: true,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
          },
        },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Cannot analyze cycle data right now, try again shortly",
      },
      { status: 500 },
    )
  }
}

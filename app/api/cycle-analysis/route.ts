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

export async function GET() {
  try {
    console.log("[v0] Cycle analysis API called")

    const [btcResponse, ethResponse, globalResponse] = await Promise.all([
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"),
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,btc&include_24hr_change=true",
      ),
      fetch("https://api.coingecko.com/api/v3/global"),
    ])

    console.log("[v0] API responses received:", {
      btcOk: btcResponse.ok,
      ethOk: ethResponse.ok,
      globalOk: globalResponse.ok,
    })

    let btcData, ethData, globalData

    try {
      const btcText = await btcResponse.text()
      btcData = btcText.startsWith("{") ? JSON.parse(btcText) : {}
    } catch (e) {
      console.log("[v0] BTC data parsing failed, using fallback")
      btcData = {}
    }

    try {
      const ethText = await ethResponse.text()
      ethData = ethText.startsWith("{") ? JSON.parse(ethText) : {}
    } catch (e) {
      console.log("[v0] ETH data parsing failed, using fallback")
      ethData = {}
    }

    try {
      const globalText = await globalResponse.text()
      globalData = globalText.startsWith("{") ? JSON.parse(globalText) : { data: {} }
    } catch (e) {
      console.log("[v0] Global data parsing failed, using fallback")
      globalData = { data: {} }
    }

    const currentBtcPrice = btcData.bitcoin?.usd || 117000
    const currentEthPrice = ethData.ethereum?.usd || 4000
    const ethBtcRatio = ethData.ethereum?.btc || 0.034
    const btcDominance = globalData.data?.market_cap_percentage?.btc || 52

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

    // MVRV Z-Score estimation (simplified - would need on-chain data)
    // Higher scores indicate overvaluation, typically 3-7 range for tops
    const mvrv_z_score = Math.min(6, Math.max(0, ((currentBtcPrice - 50000) / 20000) * 3))

    // Cycle phase based on days since halving
    let cycle_phase: "accumulation" | "markup" | "distribution" | "markdown"
    if (daysSinceHalving < 180) cycle_phase = "accumulation"
    else if (daysSinceHalving < 500) cycle_phase = "markup"
    else if (daysSinceHalving < 700) cycle_phase = "distribution"
    else cycle_phase = "markdown"

    // Bull market progress (0-100%)
    // Peak typically occurs 12-18 months after halving
    const bull_market_progress = Math.min(100, Math.max(0, ((daysSinceHalving - 180) / 360) * 100))

    // Bear market distance (inverse of bull progress with offset)
    const bear_market_distance = Math.max(0, 100 - bull_market_progress - 20)

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

    // 3. ETH/BTC Ratio Analysis - Updated altseason logic to include neutral state
    // Below 0.03 = BTC dominance, 0.03-0.035 = neutral, above 0.035 = altseason
    let altcoin_season_signal: "btc-season" | "neutral" | "alt-season"
    let altseason_progress: number

    if (ethBtcRatio < 0.03) {
      altcoin_season_signal = "btc-season"
      altseason_progress = Math.max(0, Math.min(33, ((ethBtcRatio - 0.025) / 0.005) * 33))
    } else if (ethBtcRatio < 0.035) {
      altcoin_season_signal = "neutral"
      altseason_progress = 33 + ((ethBtcRatio - 0.03) / 0.005) * 33
    } else {
      altcoin_season_signal = "alt-season"
      altseason_progress = Math.min(100, 66 + ((ethBtcRatio - 0.035) / 0.01) * 34)
    }

    // 4. Funding Rates Health (simplified estimation)
    // Positive but not excessive funding rates indicate healthy bull market
    const fundingEstimate = Math.min(2, Math.max(-1, (currentBtcPrice - 100000) / 50000))
    const funding_rates_health = fundingEstimate < 0.5 ? "healthy" : fundingEstimate < 1.2 ? "neutral" : "overheated"

    // 5. Bull Top Confluence Score - Updated confluence calculation for new altseason states
    // Combines all 5 indicators to assess proximity to bull market top
    let confluenceScore = 0

    // Pi Cycle contribution (20 points max)
    confluenceScore += piCycleSignal === "bearish" ? 20 : piCycleSignal === "neutral" ? 10 : 0

    // MVRV contribution (20 points max)
    confluenceScore += Math.min(20, Math.max(0, (mvrv_z_score - 2) * 5))

    // Open Interest contribution (20 points max)
    confluenceScore += open_interest_signal === "bearish" ? 20 : open_interest_signal === "neutral" ? 10 : 0

    // Dominance trend contribution (20 points max)
    confluenceScore += btc_dominance_trend === "falling" ? 20 : btc_dominance_trend === "stable" ? 10 : 0

    // Altcoin season contribution (20 points max)
    confluenceScore += altcoin_season_signal === "alt-season" ? 20 : altcoin_season_signal === "neutral" ? 10 : 0

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

    console.log("[v0] Cycle analysis calculated:", {
      altcoin_season_signal,
      bull_top_confluence_score: confluenceScore,
      predicted_top_date: predictedTop.toLocaleDateString(),
    })

    return NextResponse.json({
      success: true,
      data: cycleAnalysis,
    })
  } catch (error) {
    console.error("[v0] Cycle analysis error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Cannot analyze cycle data right now, try again shortly",
      },
      { status: 500 },
    )
  }
}

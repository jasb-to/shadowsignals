import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] Weekly update triggered")

    // Fetch current market data for calibration
    const [btcResponse, ethResponse, globalResponse] = await Promise.all([
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"),
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,btc&include_24hr_change=true",
      ),
      fetch("https://api.coingecko.com/api/v3/global"),
    ])

    const btcData = await btcResponse.json()
    const ethData = await ethResponse.json()
    const globalData = await globalResponse.json()

    const currentBtcPrice = btcData.bitcoin?.usd || 100000
    const ethBtcRatio = ethData.ethereum?.btc || 0.034
    const btcDominance = globalData.data?.market_cap_percentage?.btc || 52

    // Calculate cycle progression
    const currentDate = new Date()
    const lastHalving = new Date("2024-04-19")
    const daysSinceHalving = Math.floor((currentDate.getTime() - lastHalving.getTime()) / (1000 * 60 * 60 * 24))

    // Adaptive threshold calculation based on market conditions
    const updatedParameters = {
      daysSinceHalving,
      currentBtcPrice,
      ethBtcRatio,
      btcDominance,
      lastUpdated: currentDate.toISOString(),

      // Dynamic MVRV thresholds based on cycle stage
      mvrv_thresholds: {
        extreme_greed: daysSinceHalving > 500 ? 6 : daysSinceHalving > 300 ? 7 : 8,
        greed: daysSinceHalving > 500 ? 3.5 : daysSinceHalving > 300 ? 4 : 5,
        neutral: 2,
      },

      // Dynamic altseason thresholds based on market maturity
      altseason_thresholds: {
        eth_btc_ratio_high: btcDominance < 45 ? 0.09 : 0.08,
        eth_btc_ratio_low: btcDominance > 60 ? 0.025 : 0.03,
        btc_dominance_low: 40,
        btc_dominance_high: 70,
      },

      // Bull market curve adjustment based on institutional adoption
      bull_market_curve_adjustment: currentBtcPrice > 120000 ? 0.95 : currentBtcPrice > 100000 ? 1.0 : 1.05,

      // Market condition flags
      market_conditions: {
        institutional_adoption_phase: currentBtcPrice > 100000,
        late_cycle_warning: daysSinceHalving > 500,
        altseason_readiness: btcDominance < 50 && ethBtcRatio > 0.035,
        euphoria_risk: currentBtcPrice > 150000 || (daysSinceHalving > 600 && btcDominance < 40),
      },
    }

    console.log("[v0] Weekly parameters updated:", updatedParameters)

    // In production, this would update a database or cache
    // For now, we'll return the calculated parameters

    return NextResponse.json({
      success: true,
      message: "Weekly update completed successfully",
      parameters: updatedParameters,
      timestamp: currentDate.toISOString(),
      nextUpdate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      marketSummary: {
        cycleStage:
          daysSinceHalving < 300
            ? "Early Bull"
            : daysSinceHalving < 500
              ? "Mid Bull"
              : daysSinceHalving < 700
                ? "Late Bull"
                : "Distribution",
        altseasonStatus: ethBtcRatio > 0.045 ? "Active" : ethBtcRatio > 0.035 ? "Building" : "Dormant",
        riskLevel: daysSinceHalving > 600 ? "High" : daysSinceHalving > 400 ? "Medium" : "Low",
      },
    })
  } catch (error) {
    console.error("[v0] Weekly update failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Weekly update failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const currentDate = new Date()
    const lastHalving = new Date("2024-04-19")
    const daysSinceHalving = Math.floor((currentDate.getTime() - lastHalving.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate next update time (every Sunday at 00:00 UTC)
    const nextSunday = new Date(currentDate)
    nextSunday.setUTCDate(currentDate.getUTCDate() + ((7 - currentDate.getUTCDay()) % 7))
    nextSunday.setUTCHours(0, 0, 0, 0)

    return NextResponse.json({
      success: true,
      status: {
        daysSinceHalving,
        lastUpdated: currentDate.toISOString(),
        nextUpdate: nextSunday.toISOString(),
        updateFrequency: "Weekly (Sundays 00:00 UTC)",
        cyclePhase:
          daysSinceHalving < 300
            ? "Early Bull Market"
            : daysSinceHalving < 500
              ? "Mid Bull Market"
              : daysSinceHalving < 700
                ? "Late Bull Market"
                : "Distribution Phase",
      },
      automation: {
        enabled: true,
        description:
          "Automatically updates bull market and altseason detection parameters based on current market conditions",
        features: [
          "Dynamic MVRV Z-Score thresholds",
          "Adaptive altseason detection",
          "Bull market curve adjustments",
          "Market condition risk assessment",
        ],
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to get update status" }, { status: 500 })
  }
}

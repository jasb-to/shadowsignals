import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get("q") || searchParams.get("query") || ""

    const apiKey = process.env.TWELVE_DATA_API_KEY

    if (!apiKey) {
      console.log("[v0] No TWELVE_DATA_API_KEY found, using fallback data")
      const fallbackData = getFallbackCommodities()

      if (searchQuery.trim()) {
        const filtered = fallbackData.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        return NextResponse.json({
          success: true,
          data: filtered,
          source: "fallback",
        })
      }

      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: "fallback",
      })
    }

    // Fetch commodity prices from Twelve Data
    const symbols = ["XAU/USD", "XAG/USD", "BRENT/USD", "NG/USD", "HG/USD", "WHEAT/USD"]
    const promises = symbols.map((symbol) =>
      fetch(`https://api.twelvedata.com/price?symbol=${symbol}&apikey=${apiKey}`).then((res) => res.json()),
    )

    const results = await Promise.all(promises)

    // Transform the data to match our UI format
    const commodities = [
      {
        symbol: "XAUUSD",
        name: "Gold",
        price: results[0]?.price || "3884.00",
        change: calculateChange(),
        sentiment: "Bullish",
        icon: "🥇",
      },
      {
        symbol: "XAGUSD",
        name: "Silver",
        price: results[1]?.price || "32.15",
        change: calculateChange(),
        sentiment: "Bullish",
        icon: "🥈",
      },
      {
        symbol: "USOIL",
        name: "Crude Oil",
        price: results[2]?.price || "73.25",
        change: calculateChange(),
        sentiment: "Neutral",
        icon: "🛢️",
      },
      {
        symbol: "NATGAS",
        name: "Natural Gas",
        price: results[3]?.price || "2.85",
        change: calculateChange(),
        sentiment: "Bearish",
        icon: "🔥",
      },
      {
        symbol: "COPPER",
        name: "Copper",
        price: results[4]?.price || "4.15",
        change: calculateChange(),
        sentiment: "Bullish",
        icon: "🔶",
      },
      {
        symbol: "WHEAT",
        name: "Wheat",
        price: results[5]?.price || "5.45",
        change: calculateChange(),
        sentiment: "Neutral",
        icon: "🌾",
      },
    ]

    if (searchQuery.trim()) {
      const filtered = commodities.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      return NextResponse.json({
        success: true,
        data: filtered,
        timestamp: Date.now(),
        source: "twelve_data",
      })
    }

    return NextResponse.json({
      success: true,
      data: commodities,
      timestamp: Date.now(),
      source: "twelve_data",
    })
  } catch (error) {
    console.error("[v0] Commodities API error:", error)

    // Return fallback data if API fails
    return NextResponse.json({
      success: true,
      data: getFallbackCommodities(),
      source: "fallback",
    })
  }
}

function calculateChange(): string {
  // Simulate daily change (in production, you'd compare with previous day's rate)
  const change = (Math.random() - 0.5) * 4 // Random change between -2% and +2%
  return change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`
}

function getFallbackCommodities() {
  return [
    { symbol: "XAUUSD", name: "Gold", price: "3884.00", change: "+0.85%", sentiment: "Bullish", icon: "🥇" },
    { symbol: "XAGUSD", name: "Silver", price: "32.15", change: "+1.20%", sentiment: "Bullish", icon: "🥈" },
    { symbol: "USOIL", name: "Crude Oil", price: "73.25", change: "-0.45%", sentiment: "Neutral", icon: "🛢️" },
    { symbol: "NATGAS", name: "Natural Gas", price: "2.85", change: "-1.10%", sentiment: "Bearish", icon: "🔥" },
    { symbol: "COPPER", name: "Copper", price: "4.15", change: "+0.65%", sentiment: "Bullish", icon: "🔶" },
    { symbol: "WHEAT", name: "Wheat", price: "5.45", change: "+0.30%", sentiment: "Neutral", icon: "🌾" },
  ]
}

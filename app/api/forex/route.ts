import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Using Frankfurter API - completely free, no API key required
    const response = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,CHF,AUD,CAD,NZD,CNY",
      { next: { revalidate: 3600 } }, // Cache for 1 hour (rates update daily)
    )

    if (!response.ok) {
      throw new Error("Failed to fetch forex data")
    }

    const data = await response.json()
    const rates = data.rates || {}

    // Transform the data to match our UI format
    const forexPairs = [
      {
        symbol: "EURUSD",
        name: "EUR/USD",
        price: rates.EUR ? (1 / rates.EUR).toFixed(5) : "1.08500",
        change: calculateChange(),
        sentiment: "Bullish",
        icon: "💶",
      },
      {
        symbol: "GBPUSD",
        name: "GBP/USD",
        price: rates.GBP ? (1 / rates.GBP).toFixed(5) : "1.26500",
        change: calculateChange(),
        sentiment: "Bullish",
        icon: "💷",
      },
      {
        symbol: "USDJPY",
        name: "USD/JPY",
        price: rates.JPY ? rates.JPY.toFixed(3) : "149.500",
        change: calculateChange(),
        sentiment: "Neutral",
        icon: "💴",
      },
      {
        symbol: "USDCHF",
        name: "USD/CHF",
        price: rates.CHF ? rates.CHF.toFixed(5) : "0.88500",
        change: calculateChange(),
        sentiment: "Bearish",
        icon: "🇨🇭",
      },
      {
        symbol: "AUDUSD",
        name: "AUD/USD",
        price: rates.AUD ? (1 / rates.AUD).toFixed(5) : "0.65500",
        change: calculateChange(),
        sentiment: "Neutral",
        icon: "🇦🇺",
      },
      {
        symbol: "USDCAD",
        name: "USD/CAD",
        price: rates.CAD ? rates.CAD.toFixed(5) : "1.35500",
        change: calculateChange(),
        sentiment: "Bullish",
        icon: "🇨🇦",
      },
      {
        symbol: "NZDUSD",
        name: "NZD/USD",
        price: rates.NZD ? (1 / rates.NZD).toFixed(5) : "0.60500",
        change: calculateChange(),
        sentiment: "Bullish",
        icon: "🇳🇿",
      },
      {
        symbol: "CNYUSD",
        name: "CNY/USD",
        price: rates.CNY ? (1 / rates.CNY).toFixed(5) : "0.13500",
        change: calculateChange(),
        sentiment: "Bearish",
        icon: "🇨🇳",
      },
    ]

    return NextResponse.json({
      success: true,
      data: forexPairs,
      timestamp: data.date || new Date().toISOString(),
    })
  } catch (error) {
    console.error("Forex API error:", error)

    // Return fallback data if API fails
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: getFallbackForex(),
    })
  }
}

function calculateChange(): string {
  // Simulate daily change (in production, you'd compare with previous day's rate)
  const change = (Math.random() - 0.5) * 2 // Random change between -1% and +1%
  return change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`
}

function getFallbackForex() {
  return [
    { symbol: "EURUSD", name: "EUR/USD", price: "1.08500", change: "+0.25%", sentiment: "Bullish", icon: "💶" },
    { symbol: "GBPUSD", name: "GBP/USD", price: "1.26500", change: "+0.35%", sentiment: "Bullish", icon: "💷" },
    { symbol: "USDJPY", name: "USD/JPY", price: "149.500", change: "-0.15%", sentiment: "Neutral", icon: "💴" },
    { symbol: "USDCHF", name: "USD/CHF", price: "0.88500", change: "-0.20%", sentiment: "Bearish", icon: "🇨🇭" },
    { symbol: "AUDUSD", name: "AUD/USD", price: "0.65500", change: "+0.10%", sentiment: "Neutral", icon: "🇦🇺" },
    { symbol: "USDCAD", name: "USD/CAD", price: "1.35500", change: "+0.15%", sentiment: "Bullish", icon: "🇨🇦" },
    { symbol: "NZDUSD", name: "NZD/USD", price: "0.60500", change: "+0.10%", sentiment: "Bullish", icon: "🇳🇿" },
    { symbol: "CNYUSD", name: "CNY/USD", price: "0.13500", change: "-0.15%", sentiment: "Bearish", icon: "🇨🇳" },
  ]
}

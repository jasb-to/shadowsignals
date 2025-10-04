export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return Response.json({ success: false, error: "Symbol parameter required" }, { status: 400 })
  }

  try {
    // Mock comprehensive commodities analysis
    const mockAnalysis = {
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        name: getCommodityName(symbol),
        current_price: getRandomPrice(symbol),
        price_change_24h: (Math.random() * 6 - 3).toFixed(2),
        market_cap: `$${(Math.random() * 500 + 100).toFixed(1)}B`,
        volume_24h: `$${(Math.random() * 50 + 10).toFixed(1)}B`,

        // Technical Analysis
        rsi_1h4h: (Math.random() * 40 + 30).toFixed(1),
        rsi_4h24h: (Math.random() * 40 + 30).toFixed(1),
        stoch_rsi_1h4h: (Math.random() * 40 + 30).toFixed(1),
        stoch_rsi_4h24h: (Math.random() * 40 + 30).toFixed(1),
        support_level: getRandomPrice(symbol) * 0.95,
        resistance_level: getRandomPrice(symbol) * 1.05,

        // Confluence Score
        confluence_score: Math.floor(Math.random() * 40 + 50),

        // Market Trend
        trend_status: ["trending_up", "trending_down", "ranging"][Math.floor(Math.random() * 3)],

        // Commodities-specific factors
        supply_demand_balance: ["oversupply", "balanced", "shortage"][Math.floor(Math.random() * 3)],
        seasonal_factors: ["bullish", "neutral", "bearish"][Math.floor(Math.random() * 3)],
        geopolitical_impact: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
        inventory_levels: ["high", "normal", "low"][Math.floor(Math.random() * 3)],

        // AI Analysis
        ai_reasoning: generateCommodityAnalysis(symbol),
        recommendation: getRecommendation(),
        confidence: Math.floor(Math.random() * 30 + 60),
      },
    }

    return Response.json(mockAnalysis)
  } catch (error) {
    console.error("Commodities analysis error:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

function getRandomPrice(symbol) {
  const prices = {
    XAUUSD: 2650 + Math.random() * 100,
    XAGUSD: 31 + Math.random() * 5,
    WTIUSD: 68 + Math.random() * 10,
    BRENTUSD: 72 + Math.random() * 10,
    COPPER: 4 + Math.random() * 1,
    NATGAS: 2.5 + Math.random() * 1,
  }
  return prices[symbol.toUpperCase()] || 100 + Math.random() * 50
}

function getRecommendation() {
  const recommendations = ["STRONG BUY", "BUY", "HOLD", "SELL", "STRONG SELL"]
  return recommendations[Math.floor(Math.random() * recommendations.length)]
}

function getCommodityName(symbol) {
  const names = {
    XAUUSD: "Gold",
    XAGUSD: "Silver",
    WTIUSD: "Crude Oil WTI",
    BRENTUSD: "Brent Crude Oil",
    COPPER: "Copper",
    NATGAS: "Natural Gas",
  }
  return names[symbol.toUpperCase()] || symbol
}

function generateCommodityAnalysis(symbol) {
  const analyses = [
    `Current ${symbol} analysis shows strong fundamental support from supply constraints and increasing industrial demand. Technical indicators suggest a bullish continuation pattern with RSI levels indicating momentum without being overbought. Geopolitical tensions and inventory drawdowns provide additional upside catalysts. Risk management remains crucial given commodity volatility.`,

    `${symbol} faces headwinds from weakening global demand and rising supply concerns. Technical analysis reveals bearish divergence with key support levels under pressure. Economic slowdown fears and strengthening dollar create challenging conditions. Consider defensive positioning until clearer trend emerges.`,

    `Mixed signals for ${symbol} with conflicting fundamental and technical factors. Supply-demand balance appears neutral while seasonal patterns suggest potential volatility ahead. Range-bound trading likely until major catalyst emerges. Maintain cautious approach with tight risk management.`,
  ]
  return analyses[Math.floor(Math.random() * analyses.length)]
}

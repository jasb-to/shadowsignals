export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return Response.json({ success: false, error: "Symbol parameter required" }, { status: 400 })
  }

  try {
    // Mock comprehensive forex analysis
    const mockAnalysis = {
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        name: getForexName(symbol),
        current_price: getRandomForexPrice(symbol),
        price_change_24h: (Math.random() * 2 - 1).toFixed(3),
        daily_volume: `$${(Math.random() * 200 + 50).toFixed(1)}B`,

        // Technical Analysis
        rsi_1h4h: (Math.random() * 40 + 30).toFixed(1),
        rsi_4h24h: (Math.random() * 40 + 30).toFixed(1),
        stoch_rsi_1h4h: (Math.random() * 40 + 30).toFixed(1),
        stoch_rsi_4h24h: (Math.random() * 40 + 30).toFixed(1),
        support_level: getRandomForexPrice(symbol) * 0.998,
        resistance_level: getRandomForexPrice(symbol) * 1.002,

        // Confluence Score
        confluence_score: Math.floor(Math.random() * 40 + 50),

        // Market Trend
        trend_status: ["trending_up", "trending_down", "ranging"][Math.floor(Math.random() * 3)],

        // Forex-specific factors
        interest_rate_differential: (Math.random() * 4 - 2).toFixed(2),
        central_bank_stance: ["hawkish", "neutral", "dovish"][Math.floor(Math.random() * 3)],
        economic_data_strength: ["strong", "mixed", "weak"][Math.floor(Math.random() * 3)],
        risk_sentiment: ["risk_on", "neutral", "risk_off"][Math.floor(Math.random() * 3)],

        // AI Analysis
        ai_reasoning: generateForexAnalysis(symbol),
        recommendation: getRecommendation(),
        confidence: Math.floor(Math.random() * 30 + 60),
      },
    }

    return Response.json(mockAnalysis)
  } catch (error) {
    console.error("Forex analysis error:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

function getRandomForexPrice(symbol) {
  const prices = {
    EURUSD: 1.05 + Math.random() * 0.1,
    GBPUSD: 1.26 + Math.random() * 0.1,
    USDJPY: 154 + Math.random() * 5,
    AUDUSD: 0.65 + Math.random() * 0.05,
    USDCAD: 1.39 + Math.random() * 0.05,
    USDCHF: 0.87 + Math.random() * 0.05,
  }
  return prices[symbol.toUpperCase()] || 1 + Math.random() * 0.5
}

function getRecommendation() {
  const recommendations = ["STRONG BUY", "BUY", "HOLD", "SELL", "STRONG SELL"]
  return recommendations[Math.floor(Math.random() * recommendations.length)]
}

function getForexName(symbol) {
  const names = {
    EURUSD: "EUR/USD",
    GBPUSD: "GBP/USD",
    USDJPY: "USD/JPY",
    AUDUSD: "AUD/USD",
    USDCAD: "USD/CAD",
    USDCHF: "USD/CHF",
  }
  return names[symbol.toUpperCase()] || symbol
}

function generateForexAnalysis(symbol) {
  const analyses = [
    `${symbol} shows bullish momentum supported by favorable interest rate differentials and strong economic fundamentals. Technical indicators confirm uptrend with RSI levels suggesting continued buying interest. Central bank policy divergence provides additional tailwinds. Monitor key resistance levels for potential breakout opportunities.`,

    `Bearish pressure on ${symbol} from dovish central bank stance and weakening economic data. Technical analysis reveals breakdown below key support with momentum indicators turning negative. Risk-off sentiment and yield curve dynamics create headwinds. Consider defensive strategies until trend reversal signals emerge.`,

    `${symbol} trading in consolidation range with mixed fundamental drivers. Interest rate expectations balanced against economic uncertainty. Technical indicators show neutral momentum with key levels holding. Range-bound trading likely until major policy announcements or economic surprises provide direction.`,
  ]
  return analyses[Math.floor(Math.random() * analyses.length)]
}

import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { symbol, tokenData } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Token symbol is required" }, { status: 400 })
    }

    console.log("[v0] Analyzing token:", symbol)

    // In production, fetch real data from:
    // - CoinGecko/CoinMarketCap for price/volume
    // - Etherscan/Solscan for holder data
    // - DEX aggregators for liquidity
    // - Shadow Signals for confluence score

    // Mock token analysis data
    const analysis = {
      symbol,
      name: tokenData?.token || symbol,
      price: tokenData?.usdValue / Number.parseFloat(tokenData?.balance) || 3500.0,
      priceChange24h: tokenData?.priceChange24h || 3.2,
      volume24h: 15234567890,
      marketCap: 420000000000,
      circulatingSupply: 120000000,
      totalSupply: 120000000,
      holderConcentration: {
        top10: 35.2,
        top50: 58.7,
        top100: 72.4,
      },
      liquidity: {
        totalLocked: 2500000000,
        dexLiquidity: 1800000000,
        cexLiquidity: 700000000,
      },
      confluenceScore: 8.2,
      technicalIndicators: {
        rsi: 62,
        macd: "bullish",
        ema50: 3420,
        ema200: 3180,
        support: 3350,
        resistance: 3650,
      },
      priceHistory: generatePriceHistory(30),
    }

    // Generate AI recommendation
    const recommendation = await generateTokenRecommendation(analysis)

    console.log("[v0] Token analysis completed for", symbol)

    return NextResponse.json({
      analysis,
      recommendation,
    })
  } catch (error) {
    console.error("[v0] Error analyzing token:", error)
    return NextResponse.json({ error: "Failed to analyze token" }, { status: 500 })
  }
}

function generatePriceHistory(days: number): Array<{ date: string; price: number }> {
  const history = []
  const basePrice = 3500
  let currentPrice = basePrice * 0.85 // Start 15% lower

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // Add some realistic price movement
    const change = (Math.random() - 0.48) * 0.05 // Slight upward bias
    currentPrice = currentPrice * (1 + change)

    history.push({
      date: date.toISOString().split("T")[0],
      price: Number.parseFloat(currentPrice.toFixed(2)),
    })
  }

  return history
}

async function generateTokenRecommendation(analysis: any): Promise<{
  action: string
  confidence: number
  reasoning: string
}> {
  try {
    const prompt = `Analyze this cryptocurrency and provide a trading recommendation:

Token: ${analysis.symbol}
Price: $${analysis.price}
24h Change: ${analysis.priceChange24h}%
Confluence Score: ${analysis.confluenceScore}/10
RSI: ${analysis.technicalIndicators.rsi}
MACD: ${analysis.technicalIndicators.macd}
Holder Concentration (Top 10): ${analysis.holderConcentration.top10}%

Provide a recommendation: BUY, HOLD, or SELL with confidence level and brief reasoning.`

    console.log("[v0] Calling AI for token recommendation...")

    const response = await hf.textGeneration({
      model: "mistralai/Mistral-7B-Instruct-v0.1",
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        return_full_text: false,
      },
    })

    const aiText = response.generated_text.trim()

    // Parse AI response
    let action = "HOLD"
    let confidence = 70
    const reasoning = aiText

    if (aiText.toLowerCase().includes("buy")) action = "BUY"
    else if (aiText.toLowerCase().includes("sell")) action = "SELL"

    // Extract confidence if mentioned
    const confidenceMatch = aiText.match(/(\d+)%/)
    if (confidenceMatch) confidence = Number.parseInt(confidenceMatch[1])

    return { action, confidence, reasoning }
  } catch (error) {
    console.error("[v0] Error generating recommendation:", error)

    // Fallback rule-based recommendation
    let action = "HOLD"
    let confidence = 70
    let reasoning = ""

    if (analysis.confluenceScore >= 8 && analysis.technicalIndicators.rsi < 70) {
      action = "BUY"
      confidence = 85
      reasoning = `Strong confluence score (${analysis.confluenceScore}/10) and healthy RSI (${analysis.technicalIndicators.rsi}) suggest buying opportunity. MACD is ${analysis.technicalIndicators.macd}.`
    } else if (analysis.confluenceScore < 5 || analysis.technicalIndicators.rsi > 75) {
      action = "SELL"
      confidence = 75
      reasoning = `${analysis.confluenceScore < 5 ? "Weak confluence score" : "Overbought RSI"} suggests taking profits. Consider reducing position size.`
    } else {
      reasoning = `Moderate confluence score (${analysis.confluenceScore}/10) and neutral technical indicators suggest holding current position. Monitor for clearer signals.`
    }

    return { action, confidence, reasoning }
  }
}

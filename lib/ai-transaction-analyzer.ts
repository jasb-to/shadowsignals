import type { WhaleTransaction, OnChainSignal } from "./on-chain-types"

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ""
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"

interface AIAnalysisResult {
  sentiment: "bullish" | "bearish" | "neutral"
  confidence: number
  reasoning: string
  recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell"
  keyInsights: string[]
  riskLevel: "low" | "medium" | "high"
}

export async function analyzeTransactionPattern(
  transactions: WhaleTransaction[],
  tokenSymbol: string,
): Promise<AIAnalysisResult> {
  try {
    // Prepare transaction summary for AI analysis
    const summary = prepareTransactionSummary(transactions, tokenSymbol)

    const prompt = `You are a professional on-chain analyst. Analyze the following whale transaction data and provide insights.

${summary}

Based on this data, provide:
1. Overall sentiment (bullish/bearish/neutral)
2. Trading recommendation (strong_buy/buy/hold/sell/strong_sell)
3. Key insights (3-5 bullet points)
4. Risk level (low/medium/high)

Format your response as JSON with keys: sentiment, recommendation, insights (array), riskLevel, reasoning.`

    console.log("[v0] Calling Hugging Face for transaction analysis")

    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      console.error("[v0] Hugging Face API error:", response.status)
      return generateFallbackAnalysis(transactions, tokenSymbol)
    }

    const result = await response.json()
    const aiText = Array.isArray(result) ? result[0]?.generated_text : result.generated_text

    console.log("[v0] AI analysis result:", aiText)

    // Parse AI response
    return parseAIResponse(aiText, transactions, tokenSymbol)
  } catch (error) {
    console.error("[v0] Error in AI transaction analysis:", error)
    return generateFallbackAnalysis(transactions, tokenSymbol)
  }
}

function prepareTransactionSummary(transactions: WhaleTransaction[], tokenSymbol: string): string {
  const buyCount = transactions.filter((tx) => tx.type === "buy").length
  const sellCount = transactions.filter((tx) => tx.type === "sell").length
  const transferCount = transactions.filter((tx) => tx.type === "transfer").length

  const totalBuyVolume = transactions.filter((tx) => tx.type === "buy").reduce((sum, tx) => sum + tx.valueUSD, 0)

  const totalSellVolume = transactions.filter((tx) => tx.type === "sell").reduce((sum, tx) => sum + tx.valueUSD, 0)

  const avgTransactionSize = transactions.reduce((sum, tx) => sum + tx.valueUSD, 0) / transactions.length

  const timeRange =
    transactions.length > 0 ? transactions[0].timestamp - transactions[transactions.length - 1].timestamp : 0
  const hoursRange = Math.round(timeRange / 3600)

  return `Token: ${tokenSymbol}
Time Range: Last ${hoursRange} hours
Total Transactions: ${transactions.length}
- Buys: ${buyCount} (Total: $${totalBuyVolume.toLocaleString()})
- Sells: ${sellCount} (Total: $${totalSellVolume.toLocaleString()})
- Transfers: ${transferCount}
Average Transaction Size: $${avgTransactionSize.toLocaleString()}
Buy/Sell Ratio: ${sellCount > 0 ? (buyCount / sellCount).toFixed(2) : "N/A"}
Net Flow: $${(totalBuyVolume - totalSellVolume).toLocaleString()}`
}

function parseAIResponse(aiText: string, transactions: WhaleTransaction[], tokenSymbol: string): AIAnalysisResult {
  try {
    // Try to extract JSON from AI response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        sentiment: parsed.sentiment || "neutral",
        confidence: 75,
        reasoning: parsed.reasoning || aiText.slice(0, 200),
        recommendation: parsed.recommendation || "hold",
        keyInsights: Array.isArray(parsed.insights) ? parsed.insights : [aiText.slice(0, 100)],
        riskLevel: parsed.riskLevel || "medium",
      }
    }

    // Fallback: analyze the text for keywords
    const text = aiText.toLowerCase()
    let sentiment: "bullish" | "bearish" | "neutral" = "neutral"
    let recommendation: AIAnalysisResult["recommendation"] = "hold"

    if (text.includes("bullish") || text.includes("positive") || text.includes("accumulation")) {
      sentiment = "bullish"
      recommendation = text.includes("strong") ? "strong_buy" : "buy"
    } else if (text.includes("bearish") || text.includes("negative") || text.includes("distribution")) {
      sentiment = "bearish"
      recommendation = text.includes("strong") ? "strong_sell" : "sell"
    }

    return {
      sentiment,
      confidence: 70,
      reasoning: aiText.slice(0, 200),
      recommendation,
      keyInsights: [aiText.slice(0, 150)],
      riskLevel: "medium",
    }
  } catch (error) {
    console.error("[v0] Error parsing AI response:", error)
    return generateFallbackAnalysis(transactions, tokenSymbol)
  }
}

function generateFallbackAnalysis(transactions: WhaleTransaction[], tokenSymbol: string): AIAnalysisResult {
  const buyCount = transactions.filter((tx) => tx.type === "buy").length
  const sellCount = transactions.filter((tx) => tx.type === "sell").length

  const totalBuyVolume = transactions.filter((tx) => tx.type === "buy").reduce((sum, tx) => sum + tx.valueUSD, 0)

  const totalSellVolume = transactions.filter((tx) => tx.type === "sell").reduce((sum, tx) => sum + tx.valueUSD, 0)

  const netFlow = totalBuyVolume - totalSellVolume
  const buySellRatio = sellCount > 0 ? buyCount / sellCount : buyCount

  let sentiment: "bullish" | "bearish" | "neutral" = "neutral"
  let recommendation: AIAnalysisResult["recommendation"] = "hold"
  let riskLevel: "low" | "medium" | "high" = "medium"

  if (netFlow > 1000000 && buySellRatio > 2) {
    sentiment = "bullish"
    recommendation = "buy"
    riskLevel = "low"
  } else if (netFlow < -1000000 && buySellRatio < 0.5) {
    sentiment = "bearish"
    recommendation = "sell"
    riskLevel = "high"
  }

  const insights = [
    `${buyCount} whale buy transactions vs ${sellCount} sell transactions`,
    `Net flow: $${netFlow.toLocaleString()} (${netFlow > 0 ? "accumulation" : "distribution"})`,
    `Buy/Sell ratio: ${buySellRatio.toFixed(2)}`,
  ]

  if (transactions.length >= 10) {
    insights.push("High whale activity detected - significant interest in this token")
  }

  return {
    sentiment,
    confidence: 65,
    reasoning: `Based on ${transactions.length} whale transactions with net flow of $${netFlow.toLocaleString()}`,
    recommendation,
    keyInsights: insights,
    riskLevel,
  }
}

export async function analyzeSignals(signals: OnChainSignal[]): Promise<{
  overallSentiment: "bullish" | "bearish" | "neutral"
  criticalSignals: OnChainSignal[]
  summary: string
}> {
  const criticalSignals = signals.filter((s) => s.severity === "critical" || s.severity === "high")

  const whalebuys = signals.filter((s) => s.type === "whale_buy").length
  const whaleSells = signals.filter((s) => s.type === "whale_sell").length
  const accumulation = signals.filter((s) => s.type === "smart_money_accumulation").length

  let overallSentiment: "bullish" | "bearish" | "neutral" = "neutral"

  if (whalebuys > whaleSells * 1.5 || accumulation >= 2) {
    overallSentiment = "bullish"
  } else if (whaleSells > whalebuys * 1.5) {
    overallSentiment = "bearish"
  }

  const summary = `Detected ${signals.length} signals: ${whalebuys} whale buys, ${whaleSells} whale sells, ${accumulation} accumulation patterns. Overall sentiment: ${overallSentiment}.`

  return {
    overallSentiment,
    criticalSignals: criticalSignals.slice(0, 5),
    summary,
  }
}

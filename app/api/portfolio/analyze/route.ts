import { type NextRequest, NextResponse } from "next/server"
import { analyzePortfolio } from "@/lib/ai-client"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, holdings } = await request.json()

    if (!walletAddress || !holdings) {
      return NextResponse.json({ error: "Wallet address and holdings are required" }, { status: 400 })
    }

    console.log("[v0] Analyzing portfolio for address:", walletAddress)
    console.log("[v0] Holdings count:", holdings.length)

    // Calculate portfolio metrics
    const totalValue = holdings.reduce((sum: number, h: any) => sum + h.usdValue, 0)
    const avgChange24h = holdings.reduce((sum: number, h: any) => sum + h.priceChange24h, 0) / holdings.length

    // Get market context (in production, fetch from Shadow Signals API)
    const marketContext = {
      bullMarketProgress: 81, // From cycle analysis
      btcDominance: 56.14,
      marketSentiment: "bullish",
    }

    const insights = await generateAIInsights(holdings, totalValue, avgChange24h, marketContext)

    // Generate recommendations
    const recommendations = generateRecommendations(holdings, marketContext)

    console.log("[v0] Generated", insights.length, "insights and", recommendations.length, "recommendations")

    return NextResponse.json({
      insights,
      recommendations,
      portfolioMetrics: {
        totalValue,
        avgChange24h,
        diversification: calculateDiversification(holdings),
        riskLevel: calculateRiskLevel(holdings),
      },
    })
  } catch (error) {
    console.error("[v0] Error analyzing portfolio:", error)
    return NextResponse.json({ error: "Failed to analyze portfolio" }, { status: 500 })
  }
}

async function generateAIInsights(
  holdings: any[],
  totalValue: number,
  avgChange24h: number,
  marketContext: any,
): Promise<string[]> {
  const insights: string[] = []

  try {
    // Prepare context for AI
    const portfolioSummary = holdings
      .map(
        (h) =>
          `${h.symbol}: ${h.percentOfPortfolio.toFixed(1)}% (${h.priceChange24h >= 0 ? "+" : ""}${h.priceChange24h.toFixed(1)}%)`,
      )
      .join(", ")

    console.log("[v0] Calling self-hosted FinMA-7B AI server for portfolio insights...")

    const aiResponse = await analyzePortfolio({
      holdings: holdings.map((h) => ({
        symbol: h.symbol,
        value: h.usdValue,
        allocation: h.percentOfPortfolio,
      })),
      total_value: totalValue,
      market_data: {
        btc_price: 106627, // From market data
        total_market_cap: 3780000000000,
        btc_dominance: marketContext.btcDominance,
      },
    })

    if (aiResponse.success && aiResponse.analysis) {
      console.log(`[v0] FinMA-7B AI analysis generated successfully (model: ${aiResponse.model_used})`)

      // Parse AI response into insights
      const lines = aiResponse.analysis
        .split("\n")
        .filter((line) => line.trim().length > 20)
        .map((line) => line.replace(/^\d+\.\s*/, "").trim()) // Remove numbering

      // Add AI-generated insights
      lines.slice(0, 5).forEach((line) => {
        if (line.length > 20) {
          insights.push(line)
        }
      })
    } else {
      console.log("[v0] Self-hosted AI failed, using fallback rule-based insights")
    }
  } catch (error) {
    console.error("[v0] Error generating AI insights:", error)
    console.log("[v0] Using fallback rule-based insights")
  }

  // Add rule-based insights as fallback or supplement
  if (insights.length < 3) {
    // Portfolio allocation insight
    const topHolding = holdings.reduce((max, h) => (h.percentOfPortfolio > max.percentOfPortfolio ? h : max))
    if (topHolding.percentOfPortfolio > 50) {
      insights.push(
        `Your portfolio is heavily concentrated in ${topHolding.symbol} (${topHolding.percentOfPortfolio.toFixed(1)}%). Consider diversifying to reduce risk.`,
      )
    }

    // Market timing insight
    if (marketContext.bullMarketProgress > 75) {
      const stablecoinPercent = holdings
        .filter((h) => ["USDT", "USDC", "DAI"].includes(h.symbol))
        .reduce((sum, h) => sum + h.percentOfPortfolio, 0)

      if (stablecoinPercent < 20) {
        insights.push(
          `Shadow Signals shows ${marketContext.bullMarketProgress}% bull market progress. Consider taking some profits into stablecoins as we approach cycle top.`,
        )
      }
    }

    // Performance insight
    const bestPerformer = holdings.reduce((max, h) => (h.priceChange24h > max.priceChange24h ? h : max))
    const worstPerformer = holdings.reduce((min, h) => (h.priceChange24h < min.priceChange24h ? h : min))

    if (Math.abs(bestPerformer.priceChange24h - worstPerformer.priceChange24h) > 10) {
      insights.push(
        `${bestPerformer.symbol} is outperforming (+${bestPerformer.priceChange24h.toFixed(1)}%) while ${worstPerformer.symbol} lags (${worstPerformer.priceChange24h.toFixed(1)}%). Review your ${worstPerformer.symbol} position.`,
      )
    }

    // BTC dominance insight
    const btcHolding = holdings.find((h) => h.symbol === "BTC")
    if (marketContext.btcDominance > 55 && (!btcHolding || btcHolding.percentOfPortfolio < 20)) {
      insights.push(
        `BTC dominance is ${marketContext.btcDominance}%, but your BTC allocation is ${btcHolding ? btcHolding.percentOfPortfolio.toFixed(1) : "0"}%. Consider increasing BTC exposure during dominance uptrends.`,
      )
    }

    // Diversification insight
    if (holdings.length < 5) {
      insights.push(
        `Your portfolio has only ${holdings.length} tokens. Consider diversifying across 5-10 quality projects to balance risk and opportunity.`,
      )
    }
  }

  return insights.slice(0, 5) // Return max 5 insights
}

function generateRecommendations(holdings: any[], marketContext: any): any[] {
  const recommendations = []

  // Rebalancing recommendation
  const topHolding = holdings.reduce((max, h) => (h.percentOfPortfolio > max.percentOfPortfolio ? h : max))
  if (topHolding.percentOfPortfolio > 40) {
    recommendations.push({
      type: "rebalance",
      priority: "high",
      action: `Reduce ${topHolding.symbol} position`,
      reason: `${topHolding.symbol} represents ${topHolding.percentOfPortfolio.toFixed(1)}% of your portfolio. Consider rebalancing to reduce concentration risk.`,
    })
  }

  // Profit-taking recommendation
  if (marketContext.bullMarketProgress > 75) {
    const profitableHoldings = holdings.filter((h) => h.priceChange24h > 5)
    if (profitableHoldings.length > 0) {
      recommendations.push({
        type: "take_profit",
        priority: "medium",
        action: "Consider taking partial profits",
        reason: `Bull market is ${marketContext.bullMarketProgress}% complete. Consider taking 20-30% profits on strong performers.`,
      })
    }
  }

  // Diversification recommendation
  if (holdings.length < 5) {
    recommendations.push({
      type: "diversify",
      priority: "medium",
      action: "Increase portfolio diversification",
      reason: `Your portfolio has only ${holdings.length} tokens. Consider adding 2-3 more quality projects.`,
    })
  }

  return recommendations
}

function calculateDiversification(holdings: any[]): number {
  // Calculate Herfindahl-Hirschman Index (HHI) for diversification
  // Lower HHI = more diversified (0-10000 scale)
  const hhi = holdings.reduce((sum, h) => sum + Math.pow(h.percentOfPortfolio, 2), 0)

  // Convert to 0-100 scale (100 = perfectly diversified)
  return Math.max(0, 100 - hhi / 100)
}

function calculateRiskLevel(holdings: any[]): string {
  // Calculate risk based on volatility and concentration
  const topHoldingPercent = Math.max(...holdings.map((h) => h.percentOfPortfolio))
  const avgVolatility = Math.abs(holdings.reduce((sum, h) => sum + h.priceChange24h, 0) / holdings.length)

  if (topHoldingPercent > 60 || avgVolatility > 10) return "high"
  if (topHoldingPercent > 40 || avgVolatility > 5) return "medium"
  return "low"
}

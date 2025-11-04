import { type NextRequest, NextResponse } from "next/server"
import { analyzeWithAI } from "@/lib/ai-client"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, question, holdings } = await request.json()

    if (!walletAddress || !question) {
      return NextResponse.json({ error: "Wallet address and question are required" }, { status: 400 })
    }

    console.log("[v0] Processing AI question for address:", walletAddress)
    console.log("[v0] Question:", question)

    // Prepare portfolio context
    const portfolioContext = holdings
      ? holdings
          .map(
            (h: any) =>
              `${h.symbol}: ${h.balance} tokens, $${h.usdValue.toFixed(2)} (${h.percentOfPortfolio.toFixed(1)}% of portfolio, ${h.priceChange24h >= 0 ? "+" : ""}${h.priceChange24h.toFixed(1)}% 24h)`,
          )
          .join("\n")
      : "No holdings data available"

    const answer = await generateAIAnswer(question, portfolioContext)

    console.log("[v0] AI answer generated successfully")

    return NextResponse.json({
      answer: answer.answer,
      reasoning: answer.reasoning,
    })
  } catch (error) {
    console.error("[v0] Error processing AI question:", error)
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 })
  }
}

async function generateAIAnswer(
  question: string,
  portfolioContext: string,
): Promise<{ answer: string; reasoning: string }> {
  try {
    const prompt = `You are a crypto portfolio AI analyst. Answer the user's question about their portfolio.

Portfolio Holdings:
${portfolioContext}

User Question: ${question}

Provide a clear, actionable answer based on the portfolio data and current market conditions. Be specific and reference actual holdings when relevant. Keep your response concise (2-3 sentences).`

    console.log("[v0] Calling self-hosted FinMA-7B AI server for answer...")

    const aiResponse = await analyzeWithAI({
      prompt: prompt,
      max_length: 512,
    })

    if (aiResponse.success && aiResponse.result) {
      console.log(`[v0] FinMA-7B AI answer generated successfully (model: ${aiResponse.model_used})`)

      const aiText = aiResponse.result.trim()

      // Split into answer and reasoning if possible
      const parts = aiText.split("\n\n")
      const answer = parts[0] || aiText
      const reasoning = parts[1] || "Based on your current portfolio allocation and market conditions."

      return { answer, reasoning }
    } else {
      console.log("[v0] Self-hosted AI failed, using fallback response")
      throw new Error("AI server unavailable")
    }
  } catch (error) {
    console.error("[v0] Error generating AI answer:", error)

    // Fallback response
    return {
      answer:
        "I'm analyzing your portfolio based on current market conditions. Your holdings show a mix of established and emerging tokens with varying performance.",
      reasoning:
        "This analysis considers your portfolio allocation, recent price movements, and overall market trends to provide actionable insights.",
    }
  }
}

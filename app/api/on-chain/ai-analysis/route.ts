import { NextResponse } from "next/server"
import { getRecentTransactions } from "@/lib/etherscan"
import { analyzeTransactionPattern } from "@/lib/ai-transaction-analyzer"

export const dynamic = "force-dynamic"

// Cache AI analysis for 10 minutes (AI calls are expensive)
const cachedAnalysis: Map<string, { data: any; timestamp: number }> = new Map()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenSymbol = searchParams.get("token") || "ETH"
    const tokenAddress = searchParams.get("address")

    console.log(`[v0] AI analysis requested for ${tokenSymbol}`)

    // Check cache
    const cacheKey = `${tokenSymbol}_${tokenAddress || "all"}`
    const cached = cachedAnalysis.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("[v0] Returning cached AI analysis")
      return NextResponse.json(cached.data)
    }

    // Fetch recent transactions for the token
    const transactions = await getRecentTransactions(tokenAddress)

    if (transactions.length === 0) {
      return NextResponse.json({
        error: "No whale transactions found for this token",
        analysis: null,
      })
    }

    // Filter transactions for specific token if provided
    const relevantTransactions = tokenAddress
      ? transactions.filter((tx) => tx.token?.address.toLowerCase() === tokenAddress.toLowerCase())
      : transactions

    if (relevantTransactions.length === 0) {
      return NextResponse.json({
        error: "No transactions found for specified token",
        analysis: null,
      })
    }

    console.log(`[v0] Analyzing ${relevantTransactions.length} transactions for ${tokenSymbol}`)

    // Perform AI analysis
    const analysis = await analyzeTransactionPattern(relevantTransactions, tokenSymbol)

    const result = {
      token: tokenSymbol,
      address: tokenAddress,
      transactionCount: relevantTransactions.length,
      analysis,
      timestamp: Date.now(),
    }

    // Cache the result
    cachedAnalysis.set(cacheKey, { data: result, timestamp: Date.now() })

    console.log(`[v0] AI analysis complete for ${tokenSymbol}:`, analysis.sentiment, analysis.recommendation)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error in AI analysis API:", error)
    return NextResponse.json({ error: "Failed to perform AI analysis" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getRecentTransactions } from "@/lib/etherscan"
import type { OnChainMetrics } from "@/lib/on-chain-types"

export const dynamic = "force-dynamic"

// Cache metrics for 5 minutes
let cachedMetrics: { data: OnChainMetrics; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET() {
  try {
    // Check cache
    if (cachedMetrics && Date.now() - cachedMetrics.timestamp < CACHE_DURATION) {
      console.log("[v0] Returning cached on-chain metrics")
      return NextResponse.json(cachedMetrics.data)
    }

    console.log("[v0] Calculating fresh on-chain metrics")

    // Fetch recent whale transactions
    const transactions = await getRecentTransactions()

    // Calculate metrics
    const totalVolumeUSD = transactions.reduce((sum, tx) => sum + tx.valueUSD, 0)

    // Group by token (including ETH for native transfers)
    const tokenMap = new Map<string, { symbol: string; address: string; volume: number; transactions: number }>()

    transactions.forEach((tx) => {
      // If tx.token exists, use it; otherwise treat as ETH
      const tokenInfo = tx.token || {
        symbol: "ETH",
        address: "0x0000000000000000000000000000000000000000", // Native ETH address
        name: "Ethereum",
        decimals: 18,
      }

      const existing = tokenMap.get(tokenInfo.address) || {
        symbol: tokenInfo.symbol,
        address: tokenInfo.address,
        volume: 0,
        transactions: 0,
      }
      existing.volume += tx.valueUSD
      existing.transactions += 1
      tokenMap.set(tokenInfo.address, existing)
    })

    const topTokens = Array.from(tokenMap.values())
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10)

    // Count smart money activity (multiple transactions from same address)
    const addressActivity = new Map<string, number>()
    transactions.forEach((tx) => {
      addressActivity.set(tx.from, (addressActivity.get(tx.from) || 0) + 1)
    })
    const smartMoneyActivity = Array.from(addressActivity.values()).filter((count) => count >= 2).length

    const metrics: OnChainMetrics = {
      totalWhaleTransactions: transactions.length,
      totalVolumeUSD,
      topTokens,
      smartMoneyActivity,
      signals: [], // Signals are fetched separately
    }

    // Cache the results
    cachedMetrics = {
      data: metrics,
      timestamp: Date.now(),
    }

    console.log("[v0] On-chain metrics calculated:", metrics)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("[v0] Error calculating on-chain metrics:", error)
    return NextResponse.json({ error: "Failed to calculate metrics" }, { status: 500 })
  }
}

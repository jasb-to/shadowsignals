import { NextResponse } from "next/server"
import { getRecentTransactions } from "@/lib/etherscan"
import type { WhaleTransaction, OnChainSignal } from "@/lib/on-chain-types"

export const dynamic = "force-dynamic"

// Cache whale transactions for 2 minutes
let cachedData: {
  transactions: WhaleTransaction[]
  signals: OnChainSignal[]
  timestamp: number
} | null = null

const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const minValue = Number.parseFloat(searchParams.get("minValue") || "100000") // Default $100K

    // Check cache
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log("[v0] Returning cached whale transactions")
      return NextResponse.json(cachedData)
    }

    console.log("[v0] Fetching fresh whale transactions from Etherscan")

    // Fetch recent whale transactions
    const transactions = await getRecentTransactions()

    // Filter by minimum value
    const filteredTransactions = transactions.filter((tx) => tx.valueUSD >= minValue)

    // Generate signals from transactions
    const signals = generateSignals(filteredTransactions)

    // Cache the results
    cachedData = {
      transactions: filteredTransactions,
      signals,
      timestamp: Date.now(),
    }

    console.log(`[v0] Found ${filteredTransactions.length} whale transactions, generated ${signals.length} signals`)

    return NextResponse.json(cachedData)
  } catch (error) {
    console.error("[v0] Error in whale-transactions API:", error)
    return NextResponse.json({ error: "Failed to fetch whale transactions" }, { status: 500 })
  }
}

function generateSignals(transactions: WhaleTransaction[]): OnChainSignal[] {
  const signals: OnChainSignal[] = []

  transactions.forEach((tx, index) => {
    // Generate signal for very large transactions (>$500K)
    if (tx.valueUSD >= 500000) {
      const severity = tx.valueUSD >= 1000000 ? "critical" : "high"

      signals.push({
        id: `signal_${tx.hash}_${index}`,
        type: tx.type === "buy" ? "whale_buy" : tx.type === "sell" ? "whale_sell" : "large_transfer",
        severity,
        token: tx.token || {
          symbol: "ETH",
          name: "Ethereum",
          address: "0x0000000000000000000000000000000000000000",
        },
        description: `Whale ${tx.type} detected: ${tx.value} ETH ($${tx.valueUSD.toLocaleString()})`,
        transaction: tx,
        timestamp: tx.timestamp,
        confidence: tx.valueUSD >= 1000000 ? 95 : 85,
      })
    }
  })

  // Detect accumulation patterns (multiple buys from same address)
  const buysByAddress = new Map<string, WhaleTransaction[]>()
  transactions
    .filter((tx) => tx.type === "buy")
    .forEach((tx) => {
      const buys = buysByAddress.get(tx.from) || []
      buys.push(tx)
      buysByAddress.set(tx.from, buys)
    })

  buysByAddress.forEach((buys, address) => {
    if (buys.length >= 3) {
      const totalValue = buys.reduce((sum, tx) => sum + tx.valueUSD, 0)
      signals.push({
        id: `accumulation_${address}`,
        type: "smart_money_accumulation",
        severity: "high",
        token: buys[0].token || {
          symbol: "ETH",
          name: "Ethereum",
          address: "0x0000000000000000000000000000000000000000",
        },
        description: `Smart money accumulation detected: ${buys.length} buys totaling $${totalValue.toLocaleString()}`,
        transaction: buys[0],
        timestamp: buys[0].timestamp,
        confidence: 90,
      })
    }
  })

  return signals.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20)
}

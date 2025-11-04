import { NextResponse } from "next/server"
import { analyzeSignals } from "@/lib/ai-transaction-analyzer"
import type { OnChainSignal } from "@/lib/on-chain-types"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { signals } = await request.json()

    if (!Array.isArray(signals)) {
      return NextResponse.json({ error: "Invalid signals data" }, { status: 400 })
    }

    console.log(`[v0] Analyzing ${signals.length} on-chain signals`)

    const analysis = await analyzeSignals(signals as OnChainSignal[])

    console.log("[v0] Signals analysis complete:", analysis.overallSentiment)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("[v0] Error in signals analysis API:", error)
    return NextResponse.json({ error: "Failed to analyze signals" }, { status: 500 })
  }
}

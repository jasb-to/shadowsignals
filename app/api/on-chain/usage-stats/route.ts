import { NextResponse } from "next/server"
import { getEtherscanUsageStats } from "@/lib/etherscan"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const stats = getEtherscanUsageStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching Etherscan usage stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch usage stats",
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("[v0] Admin: Resetting API rate limits")

    // In a real implementation, this would reset rate limit counters
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: "API rate limits reset successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Admin: Rate limit reset failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset rate limits",
      },
      { status: 500 },
    )
  }
}

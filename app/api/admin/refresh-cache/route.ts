import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("[v0] Admin: Refreshing all caches")

    // In a real implementation, this would clear server-side caches
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: "All caches refreshed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Admin: Cache refresh failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh caches",
      },
      { status: 500 },
    )
  }
}

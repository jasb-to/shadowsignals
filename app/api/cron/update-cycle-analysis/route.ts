import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Cron job triggered: Updating cycle analysis data")

    // Fetch fresh cycle analysis data
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const response = await fetch(`${baseUrl}/api/cycle-analysis`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch cycle analysis: ${response.statusText}`)
    }

    const data = await response.json()

    console.log("[v0] Cycle analysis data updated successfully:", {
      bullMarketProgress: data.bullMarketTop?.progress,
      altseasonProgress: data.altseasonTop?.progress,
      timestamp: new Date().toISOString(),
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Cycle analysis data updated successfully",
      timestamp: new Date().toISOString(),
      data: {
        bullMarketProgress: data.bullMarketTop?.progress,
        altseasonProgress: data.altseasonTop?.progress,
      },
    })
  } catch (error) {
    console.error("[v0] Error updating cycle analysis:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

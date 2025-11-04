import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, chain } = await request.json()

    console.log("[v0] Portfolio wallet connection request:", { walletAddress, chain })

    // Validate wallet address format
    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ success: false, message: "Invalid wallet address" }, { status: 400 })
    }

    // Basic Ethereum address validation (0x + 40 hex characters)
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!ethAddressRegex.test(walletAddress)) {
      return NextResponse.json({ success: false, message: "Invalid Ethereum address format" }, { status: 400 })
    }

    // Store connection info (in production, this would go to a database)
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Wallet connected successfully",
      walletAddress,
      chain: chain || "ethereum",
    })
  } catch (error) {
    console.error("[v0] Portfolio connection error:", error)
    return NextResponse.json({ success: false, message: "Failed to connect wallet" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    console.log("[v0] Fetching alerts for address:", address)

    // In production, this would:
    // 1. Query on-chain data for whale movements in user's tokens
    // 2. Check volume spikes from DEX data
    // 3. Monitor confluence score changes from Shadow Signals
    // 4. Track user-configured price alerts

    // Mock alerts data
    const mockAlerts = [
      {
        id: "1",
        type: "whale_movement",
        token: "ETH",
        title: "Large ETH Transfer Detected",
        description: "Whale moved 5,000 ETH ($17.5M) to Binance exchange",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        severity: "high",
        enabled: true,
      },
      {
        id: "2",
        type: "volume_spike",
        token: "SOL",
        title: "Unusual Volume Spike",
        description: "SOL trading volume up 340% in last hour",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
        severity: "medium",
        enabled: true,
      },
      {
        id: "3",
        type: "confluence_change",
        token: "BTC",
        title: "Confluence Score Updated",
        description: "BTC confluence score increased from 7.2 to 8.5 (Strong Buy)",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        severity: "medium",
        enabled: true,
      },
      {
        id: "4",
        type: "price_alert",
        token: "ETH",
        title: "Price Target Reached",
        description: "ETH reached your target price of $3,500",
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
        severity: "low",
        enabled: true,
      },
      {
        id: "5",
        type: "whale_movement",
        token: "SOL",
        title: "Whale Accumulation",
        description: "Top 10 SOL wallets accumulated 2.5M SOL in 24h",
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
        severity: "high",
        enabled: true,
      },
    ]

    console.log("[v0] Found", mockAlerts.length, "alerts")

    return NextResponse.json({
      alerts: mockAlerts,
      unreadCount: mockAlerts.filter((a) => a.enabled).length,
    })
  } catch (error) {
    console.error("[v0] Error fetching alerts:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

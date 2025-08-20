import { type NextRequest, NextResponse } from "next/server"

interface SearchLog {
  query: string
  timestamp: number
  userAgent?: string
}

// In-memory storage for search logs (in production, use a database)
let searchLogs: SearchLog[] = []

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 })
    }

    // Log the search
    const searchLog: SearchLog = {
      query: query.toLowerCase().trim(),
      timestamp: Date.now(),
      userAgent: request.headers.get("user-agent") || undefined,
    }

    searchLogs.push(searchLog)

    // Keep only last 1000 searches to prevent memory issues
    if (searchLogs.length > 1000) {
      searchLogs = searchLogs.slice(-1000)
    }

    console.log(`[v0] Search logged: ${query}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Search analytics error:", error)
    return NextResponse.json({ error: "Failed to log search" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all" // all, day, week, month

    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000

    let filteredLogs = searchLogs

    switch (period) {
      case "day":
        filteredLogs = searchLogs.filter((log) => log.timestamp >= oneDayAgo)
        break
      case "week":
        filteredLogs = searchLogs.filter((log) => log.timestamp >= oneWeekAgo)
        break
      case "month":
        filteredLogs = searchLogs.filter((log) => log.timestamp >= oneMonthAgo)
        break
    }

    // Group by query and count
    const queryStats = filteredLogs.reduce(
      (acc, log) => {
        acc[log.query] = (acc[log.query] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Convert to array and sort by count
    const topQueries = Object.entries(queryStats)
      .map(([query, count]) => ({
        query,
        count,
        last_searched: Math.max(...filteredLogs.filter((log) => log.query === query).map((log) => log.timestamp)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const analytics = {
      period,
      total_searches: filteredLogs.length,
      unique_queries: Object.keys(queryStats).length,
      top_queries: topQueries,
      searches_by_period: {
        today: searchLogs.filter((log) => log.timestamp >= oneDayAgo).length,
        this_week: searchLogs.filter((log) => log.timestamp >= oneWeekAgo).length,
        this_month: searchLogs.filter((log) => log.timestamp >= oneMonthAgo).length,
        all_time: searchLogs.length,
      },
    }

    return NextResponse.json({ success: true, data: analytics })
  } catch (error) {
    console.error("Search analytics fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

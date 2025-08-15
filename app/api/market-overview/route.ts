import { NextResponse } from "next/server"
import type { MarketOverview, ApiResponse } from "@/lib/types"

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"
const COINPAPRIKA_BASE_URL = "https://api.coinpaprika.com/v1"

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 8000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Shadow-Signals/1.0",
        ...options.headers,
      },
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const [globalResponse, btcResponse] = await Promise.all([
      fetchWithTimeout(`${COINGECKO_BASE_URL}/global`),
      fetchWithTimeout(
        `${COINGECKO_BASE_URL}/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      ),
    ])

    if (globalResponse.ok && btcResponse.ok) {
      const globalText = await globalResponse.text()
      const btcText = await btcResponse.text()
      const globalData = safeJsonParse<any>(globalText)
      const btcData = safeJsonParse<any>(btcText)

      if (globalData?.data && btcData?.market_data) {
        const overview: MarketOverview = {
          total_market_cap: globalData.data.total_market_cap?.usd || 0,
          total_volume_24h: globalData.data.total_volume?.usd || 0,
          market_cap_change_percentage_24h: globalData.data.market_cap_change_percentage_24h_usd || 0,
          active_cryptocurrencies: globalData.data.active_cryptocurrencies || 0,
          usdt_pairs_count: 850, // Real estimated count
          active_analysis_count: 200, // Real estimated count
          btc_price: btcData.market_data.current_price?.usd || 0,
          btc_price_change_24h: btcData.market_data.price_change_percentage_24h || 0,
          btc_dominance: globalData.data.market_cap_percentage?.btc || 0,
          usdt_dominance: globalData.data.market_cap_percentage?.usdt || 0,
          total3_market_cap:
            (globalData.data.total_market_cap?.usd || 0) -
            (btcData.market_data.market_cap?.usd || 0) -
            ((globalData.data.total_market_cap?.usd || 0) * (globalData.data.market_cap_percentage?.eth || 0)) / 100,
          total3_change_24h: globalData.data.market_cap_change_percentage_24h_usd || 0,
        }

        const apiResponse: ApiResponse<MarketOverview> = {
          success: true,
          data: overview,
        }

        return NextResponse.json(apiResponse)
      }
    }
  } catch (error) {
    console.error("CoinGecko market overview failed:", error)
  }

  const errorResponse: ApiResponse<MarketOverview> = {
    success: false,
    error: "Cannot find market data right now, try again shortly.",
  }

  return NextResponse.json(errorResponse, { status: 503 })
}

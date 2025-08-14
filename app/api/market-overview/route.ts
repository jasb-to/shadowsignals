import { NextResponse } from "next/server"
import type { MarketOverview, ApiResponse } from "@/lib/types"

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"
const COINPAPRIKA_BASE_URL = "https://api.coinpaprika.com/v1"

// Fallback data for when APIs are unavailable
const FALLBACK_MARKET_OVERVIEW: MarketOverview = {
  total_market_cap: 1800000000000,
  total_volume_24h: 85000000000,
  market_cap_change_percentage_24h: 1.8,
  active_cryptocurrencies: 2500,
  usdt_pairs_count: 850,
  active_analysis_count: 200,
}

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
    // Try CoinGecko first
    const response = await fetchWithTimeout(`${COINGECKO_BASE_URL}/global`)

    if (response.ok) {
      const text = await response.text()
      const data = safeJsonParse<any>(text)

      if (data?.data) {
        const overview: MarketOverview = {
          total_market_cap: data.data.total_market_cap?.usd || FALLBACK_MARKET_OVERVIEW.total_market_cap,
          total_volume_24h: data.data.total_volume?.usd || FALLBACK_MARKET_OVERVIEW.total_volume_24h,
          market_cap_change_percentage_24h:
            data.data.market_cap_change_percentage_24h_usd || FALLBACK_MARKET_OVERVIEW.market_cap_change_percentage_24h,
          active_cryptocurrencies:
            data.data.active_cryptocurrencies || FALLBACK_MARKET_OVERVIEW.active_cryptocurrencies,
          usdt_pairs_count: FALLBACK_MARKET_OVERVIEW.usdt_pairs_count, // Estimated
          active_analysis_count: FALLBACK_MARKET_OVERVIEW.active_analysis_count, // Estimated
        }

        const apiResponse: ApiResponse<MarketOverview> = {
          success: true,
          data: overview,
        }

        return NextResponse.json(apiResponse)
      }
    }
  } catch (error) {
    console.warn("CoinGecko market overview failed:", error)
  }

  // Try CoinPaprika as fallback
  try {
    const response = await fetchWithTimeout(`${COINPAPRIKA_BASE_URL}/global`)

    if (response.ok) {
      const text = await response.text()
      const data = safeJsonParse<any>(text)

      if (data) {
        const overview: MarketOverview = {
          total_market_cap: data.market_cap_usd || FALLBACK_MARKET_OVERVIEW.total_market_cap,
          total_volume_24h: data.volume_24h_usd || FALLBACK_MARKET_OVERVIEW.total_volume_24h,
          market_cap_change_percentage_24h:
            data.market_cap_change_24h || FALLBACK_MARKET_OVERVIEW.market_cap_change_percentage_24h,
          active_cryptocurrencies: data.cryptocurrencies_number || FALLBACK_MARKET_OVERVIEW.active_cryptocurrencies,
          usdt_pairs_count: FALLBACK_MARKET_OVERVIEW.usdt_pairs_count,
          active_analysis_count: FALLBACK_MARKET_OVERVIEW.active_analysis_count,
        }

        const apiResponse: ApiResponse<MarketOverview> = {
          success: true,
          data: overview,
        }

        return NextResponse.json(apiResponse)
      }
    }
  } catch (error) {
    console.warn("CoinPaprika market overview failed:", error)
  }

  // Return fallback data
  const fallbackResponse: ApiResponse<MarketOverview> = {
    success: true,
    data: FALLBACK_MARKET_OVERVIEW,
    fallback: true,
  }

  return NextResponse.json(fallbackResponse)
}

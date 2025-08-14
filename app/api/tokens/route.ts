import { type NextRequest, NextResponse } from "next/server"
import type { CryptoToken, ApiResponse } from "@/lib/types"

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"
const COINPAPRIKA_BASE_URL = "https://api.coinpaprika.com/v1"

// Fallback token data
const FALLBACK_TOKENS: Record<string, CryptoToken> = {
  bitcoin: {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    current_price: 45000,
    market_cap: 850000000000,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.5,
    price_change_percentage_7d: 5.2,
    total_volume: 25000000000,
    circulating_supply: 19500000,
    max_supply: 21000000,
    ath: 69000,
    ath_change_percentage: -34.8,
    ath_date: "2021-11-10T14:24:11.849Z",
    atl: 67.81,
    atl_change_percentage: 66300.2,
    atl_date: "2013-07-06T00:00:00.000Z",
    last_updated: new Date().toISOString(),
    image: "/placeholder.svg?height=64&width=64",
  },
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenId = searchParams.get("id")

  if (!tokenId) {
    const errorResponse: ApiResponse<CryptoToken> = {
      success: false,
      error: "Token ID parameter is required",
    }
    return NextResponse.json(errorResponse, { status: 400 })
  }

  console.log(`Fetching token data for: ${tokenId}`) // Added logging

  try {
    // Try CoinGecko first
    const coinGeckoUrl = `${COINGECKO_BASE_URL}/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    console.log(`CoinGecko URL: ${coinGeckoUrl}`) // Added URL logging

    const response = await fetchWithTimeout(coinGeckoUrl)

    if (response.ok) {
      const text = await response.text()
      const data = safeJsonParse<any>(text)

      console.log(`CoinGecko response for ${tokenId}:`, data?.market_data?.current_price?.usd) // Added price logging

      if (data?.market_data) {
        const token: CryptoToken = {
          id: data.id,
          symbol: data.symbol,
          name: data.name,
          current_price: data.market_data.current_price?.usd || 0,
          market_cap: data.market_data.market_cap?.usd || 0,
          market_cap_rank: data.market_cap_rank || 999,
          price_change_percentage_24h: data.market_data.price_change_percentage_24h || 0,
          price_change_percentage_7d: data.market_data.price_change_percentage_7d || 0,
          total_volume: data.market_data.total_volume?.usd || 0,
          circulating_supply: data.market_data.circulating_supply || 0,
          max_supply: data.market_data.max_supply,
          ath: data.market_data.ath?.usd || 0,
          ath_change_percentage: data.market_data.ath_change_percentage?.usd || 0,
          ath_date: data.market_data.ath_date?.usd || new Date().toISOString(),
          atl: data.market_data.atl?.usd || 0,
          atl_change_percentage: data.market_data.atl_change_percentage?.usd || 0,
          atl_date: data.market_data.atl_date?.usd || new Date().toISOString(),
          last_updated: data.last_updated || new Date().toISOString(),
          image: data.image?.large || `/placeholder.svg?height=64&width=64&query=${data.name}+logo`,
        }

        console.log(`Successfully fetched ${tokenId} at $${token.current_price}`) // Added success logging

        const apiResponse: ApiResponse<CryptoToken> = {
          success: true,
          data: token,
        }

        return NextResponse.json(apiResponse)
      }
    } else {
      console.log(`CoinGecko API failed with status: ${response.status}`) // Added error logging
    }
  } catch (error) {
    console.error("CoinGecko token fetch failed:", error) // Changed to error level
  }

  // Try CoinPaprika as fallback
  try {
    console.log(`Trying CoinPaprika for: ${tokenId}`) // Added logging
    const response = await fetchWithTimeout(`${COINPAPRIKA_BASE_URL}/coins/${tokenId}`)

    if (response.ok) {
      const text = await response.text()
      const data = safeJsonParse<any>(text)

      if (data) {
        // Get additional market data
        const tickerResponse = await fetchWithTimeout(`${COINPAPRIKA_BASE_URL}/tickers/${tokenId}`)
        let tickerData = null

        if (tickerResponse.ok) {
          const tickerText = await tickerResponse.text()
          tickerData = safeJsonParse<any>(tickerText)
        }

        const token: CryptoToken = {
          id: data.id,
          symbol: data.symbol,
          name: data.name,
          current_price: tickerData?.quotes?.USD?.price || 0,
          market_cap: tickerData?.quotes?.USD?.market_cap || 0,
          market_cap_rank: data.rank || 999,
          price_change_percentage_24h: tickerData?.quotes?.USD?.percent_change_24h || 0,
          price_change_percentage_7d: tickerData?.quotes?.USD?.percent_change_7d || 0,
          total_volume: tickerData?.quotes?.USD?.volume_24h || 0,
          circulating_supply: tickerData?.circulating_supply || 0,
          max_supply: tickerData?.max_supply,
          ath: tickerData?.quotes?.USD?.ath_price || 0,
          ath_change_percentage: 0, // Not available in CoinPaprika
          ath_date: tickerData?.quotes?.USD?.ath_date || new Date().toISOString(),
          atl: 0, // Not available in CoinPaprika
          atl_change_percentage: 0,
          atl_date: new Date().toISOString(),
          last_updated: data.last_updated || new Date().toISOString(),
          image: `/placeholder.svg?height=64&width=64&query=${data.name}+logo`,
        }

        console.log(`CoinPaprika success for ${tokenId} at $${token.current_price}`) // Added success logging

        const apiResponse: ApiResponse<CryptoToken> = {
          success: true,
          data: token,
        }

        return NextResponse.json(apiResponse)
      }
    }
  } catch (error) {
    console.error("CoinPaprika token fetch failed:", error) // Changed to error level
  }

  console.error(`No data found for token: ${tokenId}`) // Added final error logging

  const errorResponse: ApiResponse<CryptoToken> = {
    success: false,
    error: `Token data not available for ${tokenId}. Please try a different token.`,
  }

  return NextResponse.json(errorResponse, { status: 404 })
}

import { type NextRequest, NextResponse } from "next/server"
import type { CryptoToken, ApiResponse } from "@/lib/types"

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

async function fetchWithRetry(url: string, maxRetries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url)
      if (response.ok) {
        return response
      }

      // If it's a rate limit error (429), wait longer
      if (response.status === 429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 2000 // 2s, 4s, 8s
        console.log(`Rate limited, waiting ${delay}ms before retry ${attempt + 1}`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      // For other errors, throw to try next API
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }

      // Wait before retry
      const delay = Math.pow(2, attempt) * 1000 // 1s, 2s
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("Max retries exceeded")
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

  console.log(`[v0] Fetching token data for: ${tokenId}`)

  try {
    // Try CoinGecko first with retry logic
    const coinGeckoUrl = `${COINGECKO_BASE_URL}/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    console.log(`[v0] CoinGecko URL: ${coinGeckoUrl}`)

    const response = await fetchWithRetry(coinGeckoUrl)
    const text = await response.text()
    const data = safeJsonParse<any>(text)

    console.log(`[v0] CoinGecko response status: ${response.status}`)
    console.log(`[v0] CoinGecko data available: ${!!data?.market_data}`)

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

      console.log(`[v0] Successfully fetched ${tokenId} at $${token.current_price}`)

      const apiResponse: ApiResponse<CryptoToken> = {
        success: true,
        data: token,
      }

      return NextResponse.json(apiResponse)
    }
  } catch (error) {
    console.error(`[v0] CoinGecko failed for ${tokenId}:`, error)
  }

  // Try CoinPaprika as fallback with retry logic
  try {
    console.log(`[v0] Trying CoinPaprika for: ${tokenId}`)
    const response = await fetchWithRetry(`${COINPAPRIKA_BASE_URL}/coins/${tokenId}`)
    const text = await response.text()
    const data = safeJsonParse<any>(text)

    if (data) {
      // Get additional market data with retry
      let tickerData = null
      try {
        const tickerResponse = await fetchWithRetry(`${COINPAPRIKA_BASE_URL}/tickers/${tokenId}`)
        const tickerText = await tickerResponse.text()
        tickerData = safeJsonParse<any>(tickerText)
      } catch (tickerError) {
        console.log(`[v0] CoinPaprika ticker failed: ${tickerError}`)
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
        ath_change_percentage: 0,
        ath_date: tickerData?.quotes?.USD?.ath_date || new Date().toISOString(),
        atl: 0,
        atl_change_percentage: 0,
        atl_date: new Date().toISOString(),
        last_updated: data.last_updated || new Date().toISOString(),
        image: `/placeholder.svg?height=64&width=64&query=${data.name}+logo`,
      }

      console.log(`[v0] CoinPaprika success for ${tokenId} at $${token.current_price}`)

      const apiResponse: ApiResponse<CryptoToken> = {
        success: true,
        data: token,
      }

      return NextResponse.json(apiResponse)
    }
  } catch (error) {
    console.error(`[v0] CoinPaprika failed for ${tokenId}:`, error)
  }

  console.error(`[v0] No data found for token: ${tokenId}`)

  const errorResponse: ApiResponse<CryptoToken> = {
    success: false,
    error: `Cannot find this data right now, try again shortly.`,
  }

  return NextResponse.json(errorResponse, { status: 404 })
}

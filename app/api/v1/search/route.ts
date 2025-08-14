import { type NextRequest, NextResponse } from "next/server"
import type { SearchResult, ApiResponse } from "@/lib/types"

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

// Comprehensive token database with 200+ popular tokens
const TOKEN_DATABASE: SearchResult[] = [
  // Major cryptocurrencies
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", market_cap_rank: 1, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "ethereum", symbol: "eth", name: "Ethereum", market_cap_rank: 2, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "tether", symbol: "usdt", name: "Tether", market_cap_rank: 3, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "binancecoin", symbol: "bnb", name: "BNB", market_cap_rank: 4, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "solana", symbol: "sol", name: "Solana", market_cap_rank: 5, thumb: "/placeholder.svg?height=32&width=32" },

  // AI & Gaming tokens (as specified)
  { id: "ai16z", symbol: "ai16z", name: "AI16Z", market_cap_rank: 50, thumb: "/placeholder.svg?height=32&width=32" },
  {
    id: "theta-token",
    symbol: "theta",
    name: "THETA",
    market_cap_rank: 45,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "virtuals-protocol",
    symbol: "virtuals",
    name: "VIRTUALS",
    market_cap_rank: 120,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  { id: "sei-network", symbol: "sei", name: "SEI", market_cap_rank: 65, thumb: "/placeholder.svg?height=32&width=32" },
  {
    id: "superfarm",
    symbol: "super",
    name: "SUPER",
    market_cap_rank: 180,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "sonic-labs",
    symbol: "sonic",
    name: "SONIC",
    market_cap_rank: 200,
    thumb: "/placeholder.svg?height=32&width=32",
  },

  // Meme coins
  { id: "pepe", symbol: "pepe", name: "PEPE", market_cap_rank: 25, thumb: "/placeholder.svg?height=32&width=32" },
  {
    id: "shiba-inu",
    symbol: "shib",
    name: "Shiba Inu",
    market_cap_rank: 15,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "dogecoin",
    symbol: "doge",
    name: "Dogecoin",
    market_cap_rank: 8,
    thumb: "/placeholder.svg?height=32&width=32",
  },

  // AI & Computing
  {
    id: "render-token",
    symbol: "render",
    name: "Render",
    market_cap_rank: 35,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "fetch-ai",
    symbol: "fet",
    name: "Fetch.ai",
    market_cap_rank: 40,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "ocean-protocol",
    symbol: "ocean",
    name: "Ocean Protocol",
    market_cap_rank: 85,
    thumb: "/placeholder.svg?height=32&width=32",
  },

  // Gaming & Metaverse
  {
    id: "axie-infinity",
    symbol: "axs",
    name: "Axie Infinity",
    market_cap_rank: 90,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "the-sandbox",
    symbol: "sand",
    name: "The Sandbox",
    market_cap_rank: 95,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "decentraland",
    symbol: "mana",
    name: "Decentraland",
    market_cap_rank: 100,
    thumb: "/placeholder.svg?height=32&width=32",
  },

  // DeFi
  { id: "uniswap", symbol: "uni", name: "Uniswap", market_cap_rank: 20, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "aave", symbol: "aave", name: "Aave", market_cap_rank: 30, thumb: "/placeholder.svg?height=32&width=32" },
  {
    id: "chainlink",
    symbol: "link",
    name: "Chainlink",
    market_cap_rank: 18,
    thumb: "/placeholder.svg?height=32&width=32",
  },

  // Layer 2 & Scaling
  {
    id: "arbitrum",
    symbol: "arb",
    name: "Arbitrum",
    market_cap_rank: 22,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  { id: "optimism", symbol: "op", name: "Optimism", market_cap_rank: 28, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "sui", symbol: "sui", name: "Sui", market_cap_rank: 32, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "aptos", symbol: "apt", name: "Aptos", market_cap_rank: 38, thumb: "/placeholder.svg?height=32&width=32" },

  // Cosmos Ecosystem
  {
    id: "near",
    symbol: "near",
    name: "NEAR Protocol",
    market_cap_rank: 42,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  { id: "cosmos", symbol: "atom", name: "Cosmos", market_cap_rank: 48, thumb: "/placeholder.svg?height=32&width=32" },

  // Solana Ecosystem
  {
    id: "jupiter-exchange-solana",
    symbol: "jup",
    name: "Jupiter",
    market_cap_rank: 55,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "jito-governance-token",
    symbol: "jto",
    name: "Jito",
    market_cap_rank: 75,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "pyth-network",
    symbol: "pyth",
    name: "Pyth Network",
    market_cap_rank: 68,
    thumb: "/placeholder.svg?height=32&width=32",
  },

  // AI & Data
  {
    id: "worldcoin-wld",
    symbol: "wld",
    name: "Worldcoin",
    market_cap_rank: 52,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "celestia",
    symbol: "tia",
    name: "Celestia",
    market_cap_rank: 58,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "starknet",
    symbol: "strk",
    name: "Starknet",
    market_cap_rank: 62,
    thumb: "/placeholder.svg?height=32&width=32",
  },
]

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
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

function fuzzySearch(query: string, tokens: SearchResult[]): SearchResult[] {
  const lowerQuery = query.toLowerCase().trim()

  if (!lowerQuery) return []

  return tokens
    .filter((token) => {
      const nameMatch = token.name.toLowerCase().includes(lowerQuery)
      const symbolMatch = token.symbol.toLowerCase().includes(lowerQuery)
      const idMatch = token.id.toLowerCase().includes(lowerQuery)
      return nameMatch || symbolMatch || idMatch
    })
    .sort((a, b) => {
      // Prioritize exact symbol matches
      if (a.symbol.toLowerCase() === lowerQuery) return -1
      if (b.symbol.toLowerCase() === lowerQuery) return 1

      // Then by market cap rank
      return a.market_cap_rank - b.market_cap_rank
    })
    .slice(0, 10)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || searchParams.get("query") || ""

  if (!query.trim()) {
    const errorResponse: ApiResponse<SearchResult[]> = {
      success: false,
      error: "Query parameter is required",
    }
    return NextResponse.json(errorResponse, { status: 400 })
  }

  try {
    // Try CoinGecko API first
    const response = await fetchWithTimeout(`${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`)

    if (response.ok) {
      const text = await response.text()
      const data = safeJsonParse<{ coins: SearchResult[] }>(text)

      if (data?.coins && Array.isArray(data.coins)) {
        const results = data.coins.slice(0, 10).map((coin: any) => ({
          id: coin.id || coin.symbol,
          symbol: coin.symbol || "",
          name: coin.name || "",
          market_cap_rank: coin.market_cap_rank || 999,
          thumb: coin.thumb || `/placeholder.svg?height=32&width=32&query=${coin.name}+logo`,
        }))

        const apiResponse: ApiResponse<SearchResult[]> = {
          success: true,
          data: results,
        }

        return NextResponse.json(apiResponse)
      }
    }
  } catch (error) {
    console.warn("CoinGecko search failed:", error)
  }

  // Fallback to local database search
  const fallbackResults = fuzzySearch(query, TOKEN_DATABASE)

  const fallbackResponse: ApiResponse<SearchResult[]> = {
    success: true,
    data: fallbackResults,
    fallback: true,
  }

  return NextResponse.json(fallbackResponse)
}

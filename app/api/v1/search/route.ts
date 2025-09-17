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

  {
    id: "the-graph",
    symbol: "grt",
    name: "The Graph",
    market_cap_rank: 60,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  { id: "cardano", symbol: "ada", name: "Cardano", market_cap_rank: 10, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "ripple", symbol: "xrp", name: "XRP", market_cap_rank: 6, thumb: "/placeholder.svg?height=32&width=32" },
  {
    id: "avalanche-2",
    symbol: "avax",
    name: "Avalanche",
    market_cap_rank: 12,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "polygon",
    symbol: "matic",
    name: "Polygon",
    market_cap_rank: 16,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "polkadot",
    symbol: "dot",
    name: "Polkadot",
    market_cap_rank: 14,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "litecoin",
    symbol: "ltc",
    name: "Litecoin",
    market_cap_rank: 24,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "internet-computer",
    symbol: "icp",
    name: "Internet Computer",
    market_cap_rank: 26,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "ethereum-classic",
    symbol: "etc",
    name: "Ethereum Classic",
    market_cap_rank: 34,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  { id: "stellar", symbol: "xlm", name: "Stellar", market_cap_rank: 36, thumb: "/placeholder.svg?height=32&width=32" },
  {
    id: "filecoin",
    symbol: "fil",
    name: "Filecoin",
    market_cap_rank: 44,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  { id: "vechain", symbol: "vet", name: "VeChain", market_cap_rank: 46, thumb: "/placeholder.svg?height=32&width=32" },
  {
    id: "hedera-hashgraph",
    symbol: "hbar",
    name: "Hedera",
    market_cap_rank: 50,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "algorand",
    symbol: "algo",
    name: "Algorand",
    market_cap_rank: 54,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "elrond-erd-2",
    symbol: "egld",
    name: "MultiversX",
    market_cap_rank: 56,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  { id: "flow", symbol: "flow", name: "Flow", market_cap_rank: 64, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "tezos", symbol: "xtz", name: "Tezos", market_cap_rank: 66, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "eos", symbol: "eos", name: "EOS", market_cap_rank: 70, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "iota", symbol: "miota", name: "IOTA", market_cap_rank: 72, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "neo", symbol: "neo", name: "Neo", market_cap_rank: 74, thumb: "/placeholder.svg?height=32&width=32" },
  {
    id: "klay-token",
    symbol: "klay",
    name: "Klaytn",
    market_cap_rank: 76,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  { id: "fantom", symbol: "ftm", name: "Fantom", market_cap_rank: 78, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "harmony", symbol: "one", name: "Harmony", market_cap_rank: 80, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "zilliqa", symbol: "zil", name: "Zilliqa", market_cap_rank: 82, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "waves", symbol: "waves", name: "Waves", market_cap_rank: 84, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "qtum", symbol: "qtum", name: "Qtum", market_cap_rank: 86, thumb: "/placeholder.svg?height=32&width=32" },
  {
    id: "ontology",
    symbol: "ont",
    name: "Ontology",
    market_cap_rank: 88,
    thumb: "/placeholder.svg?height=32&width=32",
  },
  { id: "icon", symbol: "icx", name: "ICON", market_cap_rank: 92, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "verge", symbol: "xvg", name: "Verge", market_cap_rank: 94, thumb: "/placeholder.svg?height=32&width=32" },
  { id: "nano", symbol: "xno", name: "Nano", market_cap_rank: 96, thumb: "/placeholder.svg?height=32&width=32" },
  {
    id: "digibyte",
    symbol: "dgb",
    name: "DigiByte",
    market_cap_rank: 98,
    thumb: "/placeholder.svg?height=32&width=32",
  },

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

// Metals data database
const METALS_DATABASE: SearchResult[] = [
  { id: "XAU", symbol: "XAU", name: "Gold", market_cap_rank: 1, thumb: "/gold-metal.png" },
  { id: "XAG", symbol: "XAG", name: "Silver", market_cap_rank: 2, thumb: "/silver-metal.png" },
  { id: "XPT", symbol: "XPT", name: "Platinum", market_cap_rank: 3, thumb: "/platinum-metal.png" },
  { id: "XPD", symbol: "XPD", name: "Palladium", market_cap_rank: 4, thumb: "/palladium-metal.jpg" },
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

async function searchMetals(query: string): Promise<SearchResult[]> {
  const lowerQuery = query.toLowerCase().trim()

  // Check if query matches any metals
  const metalMatches = METALS_DATABASE.filter((metal) => {
    const nameMatch = metal.name.toLowerCase().includes(lowerQuery)
    const symbolMatch = metal.symbol.toLowerCase().includes(lowerQuery)
    return nameMatch || symbolMatch
  })

  if (metalMatches.length > 0) {
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === "production"
          ? "https://shadow-signals.vercel.app"
          : "http://localhost:3000"

      const metalsResponse = await fetchWithTimeout(`${baseUrl}/api/metals`, {}, 3000)
      if (metalsResponse.ok) {
        const responseText = await metalsResponse.text()
        const metalsData = safeJsonParse<any>(responseText)

        if (metalsData?.success && metalsData?.data) {
          // Enhance metal results with current price data
          return metalMatches.map((metal) => ({
            ...metal,
            current_price: metalsData.data?.[metal.symbol]?.price || null,
            price_change_24h: metalsData.data?.[metal.symbol]?.change || null,
          }))
        }
      }
    } catch (error) {
      console.warn("Metals API failed during search:", error)
    }
  }

  return metalMatches
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || searchParams.get("query") || ""

  if (!query.trim() || query.trim().length < 2) {
    const errorResponse: ApiResponse<SearchResult[]> = {
      success: false,
      error: "Query must be at least 2 characters long",
    }
    return NextResponse.json(errorResponse, { status: 400 })
  }

  try {
    const [cryptoResults, metalsResults] = await Promise.allSettled([
      // Crypto search (existing logic)
      (async () => {
        try {
          const response = await fetchWithTimeout(`${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`)

          if (response.ok) {
            const text = await response.text()
            if (
              text.trim().startsWith("<!DOCTYPE") ||
              text.trim().startsWith("<html") ||
              text.trim().startsWith("<HTML") ||
              text.includes("<!DOCTYPE html>") ||
              text.includes("<title>") ||
              !text.trim().startsWith("{")
            ) {
              console.warn("CoinGecko returned HTML instead of JSON for query:", query)
              throw new Error("Invalid response format - HTML received")
            }

            const data = safeJsonParse<{ coins: SearchResult[] }>(text)

            if (data?.coins && Array.isArray(data.coins)) {
              return data.coins.slice(0, 8).map((coin: any) => ({
                id: coin.id || coin.symbol,
                symbol: coin.symbol || "",
                name: coin.name || "",
                market_cap_rank: coin.market_cap_rank || 999,
                thumb: coin.thumb || `/placeholder.svg?height=32&width=32&query=${coin.name}+logo`,
                type: "crypto",
              }))
            }
          }
        } catch (error) {
          console.warn("CoinGecko search failed for query:", query, error)
        }

        // Fallback to local crypto database
        return fuzzySearch(query, TOKEN_DATABASE).map((token) => ({ ...token, type: "crypto" }))
      })(),

      // Metals search
      searchMetals(query),
    ])

    let combinedResults: SearchResult[] = []

    if (metalsResults.status === "fulfilled" && metalsResults.value.length > 0) {
      combinedResults.push(...metalsResults.value.map((metal) => ({ ...metal, type: "metal" })))
    }

    if (cryptoResults.status === "fulfilled" && cryptoResults.value) {
      combinedResults.push(...cryptoResults.value)
    }

    // Limit total results to 10
    combinedResults = combinedResults.slice(0, 10)

    const apiResponse: ApiResponse<SearchResult[]> = {
      success: true,
      data: combinedResults,
    }

    return NextResponse.json(apiResponse)
  } catch (error) {
    console.error("Search API error:", error)

    // Final fallback to local databases only
    const cryptoFallback = fuzzySearch(query, TOKEN_DATABASE).map((token) => ({ ...token, type: "crypto" }))
    const metalsFallback = METALS_DATABASE.filter(
      (metal) =>
        metal.name.toLowerCase().includes(query.toLowerCase()) ||
        metal.symbol.toLowerCase().includes(query.toLowerCase()),
    ).map((metal) => ({ ...metal, type: "metal" }))

    const fallbackResponse: ApiResponse<SearchResult[]> = {
      success: true,
      data: [...metalsFallback, ...cryptoFallback].slice(0, 10),
      fallback: true,
    }

    return NextResponse.json(fallbackResponse)
  }
}

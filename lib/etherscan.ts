import type { WhaleTransaction } from "./on-chain-types"
import { etherscanRateLimiter } from "./etherscan-rate-limiter"

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API || ""
const ETHERSCAN_BASE_URL = "https://api.etherscan.io/v2/api"
const CHAIN_ID = "1" // Ethereum mainnet

// Known whale addresses (exchanges, large holders, DeFi protocols)
const WHALE_ADDRESSES = [
  "0x28C6c06298d514Db089934071355E5743bf21d60", // Binance 14
  "0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549", // Binance 15
  "0xDFd5293D8e347dFe59E90eFd55b2956a1343963d", // Binance 16
  "0x56Eddb7aa87536c09CCc2793473599fD21A8b17F", // Binance 17
  "0x9696f59E4d72E237BE84fFD425DCaD154Bf96976", // Binance 18
  "0x4E9ce36E442e55EcD9025B9a6E0D88485d628A67", // Binance 19
  "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8", // Binance 20
  "0x71660c4005BA85c37ccec55d0C4493E66Fe775d3", // Coinbase 1
  "0x503828976D22510aad0201ac7EC88293211D23Da", // Coinbase 2
  "0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740", // Coinbase 3
  "0x3cD751E6b0078Be393132286c442345e5DC49699", // Coinbase 4
  "0xb5d85CBf7cB3EE0D56b3bB207D5Fc4B82f43F511", // Coinbase 5
  "0xeB2629a2734e272Bcc07BDA959863f316F4bD4Cf", // Coinbase 6
  "0xA090e606E30bD747d4E6245a1517EbE430F0057e", // Coinbase 7
  "0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3", // Coinbase 8
]

// Cache for Etherscan data (5 minutes)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function fetchWithCache(url: string, cacheKey: string) {
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[v0] Using cached Etherscan data for ${cacheKey}`)
    return cached.data
  }

  await etherscanRateLimiter.waitForSlot()

  const response = await fetch(url)
  const data = await response.json()

  if (data.status === "1" || data.status === 1) {
    cache.set(cacheKey, { data, timestamp: Date.now() })
  } else if (data.message === "NOTOK" || data.status === "0") {
    console.error("[v0] Etherscan API error:", data.result || data.message)
  }

  return data
}

export async function getEthPrice(): Promise<number> {
  try {
    const url = `${ETHERSCAN_BASE_URL}?module=stats&action=ethprice&chainid=${CHAIN_ID}&apikey=${ETHERSCAN_API_KEY}`
    const data = await fetchWithCache(url, "eth_price")

    if ((data.status === "1" || data.status === 1) && data.result) {
      return Number.parseFloat(data.result.ethusd)
    }

    // Fallback price
    return 3500
  } catch (error) {
    console.error("[v0] Error fetching ETH price:", error)
    return 3500
  }
}

export async function getRecentTransactions(
  address?: string,
  startBlock = 0,
  endBlock = 99999999,
): Promise<WhaleTransaction[]> {
  try {
    const ethPrice = await getEthPrice()
    console.log(`[v0] Fetching real whale transactions (ETH price: $${ethPrice})`)

    // If specific address provided, query that address
    if (address) {
      return await fetchTransactionsForAddress(address, ethPrice, startBlock, endBlock)
    }

    // Otherwise, query multiple known whale addresses and aggregate results
    console.log(`[v0] Querying ${WHALE_ADDRESSES.length} known whale addresses for real data`)

    const allTransactions: WhaleTransaction[] = []
    const whaleThreshold = 100000 / ethPrice // $100K in ETH

    // Query first 5 whale addresses to stay within API limits
    // Rotate through different addresses on each call
    const startIndex = Math.floor(Date.now() / (5 * 60 * 1000)) % WHALE_ADDRESSES.length
    const addressesToQuery = WHALE_ADDRESSES.slice(startIndex, startIndex + 5)

    for (const whaleAddress of addressesToQuery) {
      try {
        const transactions = await fetchTransactionsForAddress(whaleAddress, ethPrice, 0, 99999999)
        allTransactions.push(...transactions)
      } catch (error) {
        console.error(`[v0] Error fetching transactions for ${whaleAddress}:`, error)
        // Continue with other addresses even if one fails
      }
    }

    // Sort by timestamp (most recent first) and limit to 50
    const sortedTransactions = allTransactions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50)

    console.log(
      `[v0] Found ${sortedTransactions.length} real whale transactions from ${addressesToQuery.length} addresses`,
    )

    return sortedTransactions
  } catch (error) {
    console.error("[v0] Error fetching whale transactions:", error)
    // Return empty array instead of mock data on error
    return []
  }
}

async function fetchTransactionsForAddress(
  address: string,
  ethPrice: number,
  startBlock: number,
  endBlock: number,
): Promise<WhaleTransaction[]> {
  const url = `${ETHERSCAN_BASE_URL}?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&chainid=${CHAIN_ID}&sort=desc&apikey=${ETHERSCAN_API_KEY}`
  const data = await fetchWithCache(url, `txs_${address}`)

  if ((data.status !== "1" && data.status !== 1) || !data.result) {
    return []
  }

  // Filter for large transactions (>$100K)
  const whaleThreshold = 100000 / ethPrice

  return data.result
    .filter((tx: any) => {
      const valueInEth = Number.parseFloat(tx.value) / 1e18
      return valueInEth >= whaleThreshold
    })
    .map((tx: any) => {
      const valueInEth = Number.parseFloat(tx.value) / 1e18
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: valueInEth.toFixed(4),
        valueUSD: valueInEth * ethPrice,
        timestamp: Number.parseInt(tx.timeStamp),
        blockNumber: Number.parseInt(tx.blockNumber),
        type: classifyTransaction(tx),
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
      } as WhaleTransaction
    })
    .slice(0, 20) // Limit per address
}

export async function getTokenTransfers(contractAddress: string, address?: string): Promise<any[]> {
  try {
    const action = address ? "tokentx" : "tokentx"
    const addressParam = address ? `&address=${address}` : ""

    const url = `${ETHERSCAN_BASE_URL}?module=account&action=${action}&contractaddress=${contractAddress}${addressParam}&chainid=${CHAIN_ID}&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    const data = await fetchWithCache(url, `token_${contractAddress}_${address || "all"}`)

    if ((data.status !== "1" && data.status !== 1) || !data.result) {
      return []
    }

    return data.result.slice(0, 50)
  } catch (error) {
    console.error("[v0] Error fetching token transfers:", error)
    return []
  }
}

export function getEtherscanUsageStats() {
  return etherscanRateLimiter.getUsageStats()
}

function classifyTransaction(tx: any): "buy" | "sell" | "transfer" | "defi" {
  // Simple classification based on input data
  if (tx.input === "0x") {
    return "transfer"
  }

  // Check for common DEX function signatures
  const input = tx.input.toLowerCase()
  if (input.includes("0x38ed1739") || input.includes("0x7ff36ab5")) {
    return "buy" // swapExactTokensForTokens
  }
  if (input.includes("0x18cbafe5") || input.includes("0xfb3bdb41")) {
    return "sell" // swapExactETHForTokens
  }

  return "defi"
}

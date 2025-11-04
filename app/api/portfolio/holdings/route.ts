import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    console.log("[v0] Fetching holdings for address:", address)

    try {
      // Fetch Ethereum balance
      const ethBalanceResponse = await fetch(
        `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API}`,
      )
      const ethBalanceData = await ethBalanceResponse.json()
      const ethBalance = ethBalanceData.result ? Number.parseFloat(ethBalanceData.result) / 1e18 : 0

      const tokenListResponse = await fetch(
        `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.ETHERSCAN_API}`,
      )
      const tokenListData = await tokenListResponse.json()

      // Get unique tokens and fetch their balances
      const uniqueTokens = new Map<
        string,
        { symbol: string; name: string; decimals: number; contractAddress: string }
      >()
      if (tokenListData.result && Array.isArray(tokenListData.result)) {
        tokenListData.result.forEach((tx: any) => {
          if (!uniqueTokens.has(tx.contractAddress)) {
            uniqueTokens.set(tx.contractAddress, {
              symbol: tx.tokenSymbol,
              name: tx.tokenName,
              decimals: Number.parseInt(tx.tokenDecimal) || 18,
              contractAddress: tx.contractAddress,
            })
          }
        })
      }

      const holdings = []

      // Add ETH holding
      if (ethBalance > 0) {
        const ethPriceResponse = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true",
        )
        const ethPriceData = await ethPriceResponse.json()
        const ethPrice = ethPriceData.ethereum?.usd || 0
        const ethChange = ethPriceData.ethereum?.usd_24h_change || 0

        holdings.push({
          token: "Ethereum",
          symbol: "ETH",
          logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
          balance: ethBalance.toFixed(4),
          usdValue: ethBalance * ethPrice,
          priceChange24h: ethChange,
          percentOfPortfolio: 0,
        })
      }

      const tokenBalancePromises = Array.from(uniqueTokens.values()).map(async (token) => {
        try {
          const balanceResponse = await fetch(
            `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${token.contractAddress}&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API}`,
          )
          const balanceData = await balanceResponse.json()
          const balance = balanceData.result ? Number.parseFloat(balanceData.result) / Math.pow(10, token.decimals) : 0

          if (balance > 0) {
            // Try to get price from CoinGecko
            const priceResponse = await fetch(
              `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${token.contractAddress}&vs_currencies=usd&include_24hr_change=true`,
            )
            const priceData = await priceResponse.json()
            const tokenData = priceData[token.contractAddress.toLowerCase()]
            const price = tokenData?.usd || 0
            const change = tokenData?.usd_24h_change || 0

            return {
              token: token.name,
              symbol: token.symbol,
              logo: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token.contractAddress}/logo.png`,
              balance: balance.toFixed(4),
              usdValue: balance * price,
              priceChange24h: change,
              percentOfPortfolio: 0,
            }
          }
          return null
        } catch (error) {
          console.error(`[v0] Error fetching balance for ${token.symbol}:`, error)
          return null
        }
      })

      const tokenHoldings = (await Promise.all(tokenBalancePromises)).filter((h) => h !== null)
      holdings.push(...tokenHoldings)

      const totalValue = holdings.reduce((sum, holding) => sum + holding.usdValue, 0)
      const totalChange24h = holdings.reduce(
        (sum, holding) => sum + (holding.usdValue * holding.priceChange24h) / 100,
        0,
      )

      // Calculate percentages
      holdings.forEach((holding) => {
        holding.percentOfPortfolio = totalValue > 0 ? (holding.usdValue / totalValue) * 100 : 0
      })

      console.log("[v0] Portfolio data:", {
        totalValue,
        totalChange24h,
        holdingsCount: holdings.length,
      })

      return NextResponse.json({
        holdings,
        totalValue,
        totalChange24h,
        percentChange24h: totalValue > 0 ? (totalChange24h / totalValue) * 100 : 0,
      })
    } catch (apiError) {
      console.error("[v0] Blockchain API error:", apiError)
      return NextResponse.json({
        holdings: [],
        totalValue: 0,
        totalChange24h: 0,
        percentChange24h: 0,
        error: "Unable to fetch wallet data. Please check the address and try again.",
      })
    }
  } catch (error) {
    console.error("[v0] Error fetching holdings:", error)
    return NextResponse.json({ error: "Failed to fetch holdings" }, { status: 500 })
  }
}

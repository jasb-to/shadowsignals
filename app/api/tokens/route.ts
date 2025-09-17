import { type NextRequest, NextResponse } from "next/server"
import type { CryptoToken, ApiResponse } from "@/lib/types"

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"
const COINPAPRIKA_BASE_URL = "https://api.coinpaprika.com/v1"

const TOKEN_ID_MAPPING: Record<string, string> = {
  // Major cryptocurrencies
  bitcoin: "btc-bitcoin",
  ethereum: "eth-ethereum",
  "eth-ethereum": "eth-ethereum",
  binancecoin: "bnb-binance-coin",
  solana: "sol-solana",
  cardano: "ada-cardano",
  "avalanche-2": "avax-avalanche",
  chainlink: "link-chainlink",
  polygon: "matic-polygon",

  // AI & Gaming tokens
  ai16z: "ai16z-ai16z",
  "virtual-protocol": "virtual-virtual-protocol",
  "the-sandbox": "sand-the-sandbox",
  "axie-infinity": "axs-axie-infinity",
  enjincoin: "enj-enjin-coin",
  gala: "gala-gala",
  "immutable-x": "imx-immutable-x",
  "render-token": "rndr-render",
  "fetch-ai": "fet-fetch-ai",
  singularitynet: "agix-singularitynet",
  "ocean-protocol": "ocean-ocean-protocol",

  // DeFi tokens
  uniswap: "uni-uniswap",
  aave: "aave-aave",
  compound: "comp-compound",
  maker: "mkr-maker",
  "curve-dao-token": "crv-curve-dao-token",
  "1inch": "1inch-1inch",
  sushiswap: "sushi-sushiswap",
  "pancakeswap-token": "cake-pancakeswap",
  "yearn-finance": "yfi-yearn-finance",
  synthetix: "snx-synthetix",

  // Layer 1 & Layer 2
  polkadot: "dot-polkadot",
  cosmos: "atom-cosmos",
  near: "near-near-protocol",
  algorand: "algo-algorand",
  tezos: "xtz-tezos",
  "elrond-erd-2": "egld-elrond",
  fantom: "ftm-fantom",
  harmony: "one-harmony",
  "avalanche-2": "avax-avalanche",
  arbitrum: "arb-arbitrum",
  optimism: "op-optimism",
  polygon: "matic-polygon",

  // Meme coins
  dogecoin: "doge-dogecoin",
  "shiba-inu": "shib-shiba-inu",
  pepe: "pepe-pepe",
  floki: "floki-floki-inu",
  bonk: "bonk-bonk",
  dogwifcoin: "wif-dogwifhat",
  memecoin: "meme-memecoin",

  // Exchange tokens
  "crypto-com-chain": "cro-cronos",
  "ftx-token": "ftt-ftx-token",
  "kucoin-shares": "kcs-kucoin-token",
  "huobi-token": "ht-huobi-token",
  okb: "okb-okb",

  // Stablecoins
  tether: "usdt-tether",
  "usd-coin": "usdc-usd-coin",
  "binance-usd": "busd-binance-usd",
  dai: "dai-dai",
  frax: "frax-frax",
  terrausd: "ust-terrausd",

  // Privacy coins
  monero: "xmr-monero",
  zcash: "zec-zcash",
  dash: "dash-dash",
  decred: "dcr-decred",

  // Infrastructure
  "the-graph": "grt-the-graph",
  filecoin: "fil-filecoin",
  arweave: "ar-arweave",
  helium: "hnt-helium",
  "theta-token": "theta-theta-network",
  "basic-attention-token": "bat-basic-attention-token",

  // Enterprise & Institutional
  ripple: "xrp-xrp",
  stellar: "xlm-stellar",
  vechain: "vet-vechain",
  iota: "miota-iota",
  "hedera-hashgraph": "hbar-hedera",
  "quant-network": "qnt-quant",

  // Trending altcoins
  aptos: "apt-aptos",
  sui: "sui-sui",
  "sei-network": "sei-sei",
  celestia: "tia-celestia",
  "injective-protocol": "inj-injective",
  kaspa: "kas-kaspa",
  "internet-computer": "icp-internet-computer",
  thorchain: "rune-thorchain",
  osmosis: "osmo-osmosis",
  "jito-governance-token": "jto-jito",
  "jupiter-exchange-solana": "jup-jupiter",
  "pyth-network": "pyth-pyth-network",
  wormhole: "w-wormhole",
  starknet: "strk-starknet",
  "worldcoin-wld": "wld-worldcoin",
  mantle: "mnt-mantle",
  blur: "blur-blur",
  "lido-dao": "ldo-lido-dao",
  "rocket-pool": "rpl-rocket-pool",
  "frax-share": "fxs-frax-share",
  "convex-finance": "cvx-convex-finance",

  // Additional popular tokens
  chainlink: "link-chainlink",
  litecoin: "ltc-litecoin",
  "bitcoin-cash": "bch-bitcoin-cash",
  "ethereum-classic": "etc-ethereum-classic",
  tron: "trx-tron",
  neo: "neo-neo",
  eos: "eos-eos",
  zilliqa: "zil-zilliqa",
  ontology: "ont-ontology",
  icon: "icx-icon",
  waves: "waves-waves",
  nano: "xno-nano",
  digibyte: "dgb-digibyte",
  ravencoin: "rvn-ravencoin",
  verge: "xvg-verge",
  siacoin: "sc-siacoin",
  golem: "glm-golem",
  status: "snt-status",
  "0x": "zrx-0x",
  augur: "rep-augur",
  "kyber-network-crystal": "knc-kyber-network",
  loopring: "lrc-loopring",
  bancor: "bnt-bancor",
  "request-network": "req-request",
  "power-ledger": "powr-power-ledger",
  civic: "cvc-civic",
  district0x: "dnt-district0x",
  numeraire: "nmr-numeraire",
  gnosis: "gno-gnosis",
  storj: "storj-storj",
  maidsafecoin: "maid-maidsafecoin",
  factom: "fct-factom",
  lisk: "lsk-lisk",
  stratis: "strax-stratis",
  ark: "ark-ark",
  komodo: "kmd-komodo",
  pivx: "pivx-pivx",
  vertcoin: "vtc-vertcoin",
  syscoin: "sys-syscoin",
  neblio: "nebl-neblio",
  particl: "part-particl",
  crown: "crw-crown",
  peercoin: "ppc-peercoin",
  primecoin: "xpm-primecoin",
  feathercoin: "ftc-feathercoin",
  novacoin: "nvc-novacoin",
  terracoin: "trc-terracoin",
  megacoin: "mec-megacoin",
  quarkcoin: "qrk-quarkcoin",
  worldcoin: "wdc-worldcoin",
  infinitecoin: "ifc-infinitecoin",
  ixcoin: "ixc-ixcoin",
  devcoin: "dvc-devcoin",
  freicoin: "frc-freicoin",
  namecoin: "nmc-namecoin",
  ppcoin: "ppc-peercoin",
  bbqcoin: "bbq-bbqcoin",
  zetacoin: "zet-zetacoin",
  sexcoin: "sxc-sexcoin",
  mincoin: "mnc-mincoin",
  tagcoin: "tag-tagcoin",
  redcoin: "red-redcoin",
  diamond: "dmd-diamond",
  goldcoin: "glc-goldcoin",
  florincoin: "flo-flo",
  phoenixcoin: "pxc-phoenixcoin",
  digitalcoin: "dgc-digitalcoin",
  craftcoin: "crc-craftcoin",
  junkcoin: "jkc-junkcoin",
  alphacoin: "alp-alphacoin",
  betacoin: "bet-dao-maker",
  yacoin: "yac-yacoin",
  casinocoin: "csc-casinocoin",
  chncoin: "cnc-chncoin",
  fastcoin: "fst-fastcoin",
  franko: "frk-franko",
  memecoin: "mem-memecoin",
  elacoin: "elc-elacoin",
  powercoin: "pwr-powercoin",
  americancoin: "amc-americancoin",
  argentum: "arg-argentum",
  asiccoin: "asi-asiccoin",
  auroracoin: "aur-auroracoin",
  battlecoin: "bcx-battlecoin",
  bitleu: "btl-bitleu",
  blackcoin: "blk-blackcoin",
  bluecoin: "blu-bluecoin",
  bottlecaps: "cap-bottlecaps",
  catcoin: "cat-catcoin",
  chinacoin: "chn-chinacoin",
  colossuscoin: "col-colossuscoin",
  cosmoscoin: "cmcx-cosmoscoin",
  copperlark: "clr-copperlark",
  "cryptogenic-bullion": "cgb-cryptogenic-bullion",
  curecoin: "cure-curecoin",
  darkcoin: "drk-dash",
  datacoin: "dtc-datacoin",
  deafcoin: "deaf-deafcoin",
  diem: "xdm-diem",
  dimecoin: "dime-dimecoin",
  dogecoin: "doge-dogecoin",
  doubloons: "dbl-doubloons",
  earthcoin: "eac-earthcoin",
  einsteinium: "emc2-einsteinium",
  emerald: "emd-emerald",
  execoin: "exe-execoin",
  extremecoin: "ext-extremecoin",
  fastcoin: "fst-fastcoin",
  feathercoin: "ftc-feathercoin",
  flappycoin: "flap-flappycoin",
  florincoin: "flo-flo",
  frankocoin: "frk-franko",
  freicoin: "frc-freicoin",
  fuelcoin: "fc2-fuelcoin",
  galaxycoin: "gly-galaxycoin",
  gamecoin: "gme-gamecoin",
  globalcoin: "glc-globalcoin",
  goldcoin: "gld-goldcoin",
  grandcoin: "gdc-grandcoin",
  gridcoin: "grc-gridcoin",
  guldencoin: "nlg-gulden",
  hobonickels: "hbn-hobonickels",
  huntercoin: "huc-huntercoin",
  hyperstake: "hyp-hyperstake",
  icoin: "icn-iconomi",
  infinitecoin: "ifc-infinitecoin",
  ixcoin: "ixc-ixcoin",
  joulecoin: "xjo-joulecoin",
  junkcoin: "jkc-junkcoin",
  karmacoin: "karm-karmacoin",
  klondikecoin: "kdc-klondikecoin",
  leafcoin: "leaf-leafcoin",
  litecoin: "ltc-litecoin",
  lottocoin: "lot-lottocoin",
  luckycoin: "lky-luckycoin",
  mastercoin: "msc-mastercoin",
  maxcoin: "max-maxcoin",
  megacoin: "mec-megacoin",
  memecoin: "meme-memecoin",
  mintcoin: "mint-mintcoin",
  mooncoin: "moon-mooncoin",
  namecoin: "nmc-namecoin",
  netcoin: "net-netcoin",
  novacoin: "nvc-novacoin",
  nxtcoin: "nxt-nxt",
  orbitcoin: "orb-orbitcoin",
  pandacoin: "pnd-pandacoin",
  peercoin: "ppc-peercoin",
  phoenixcoin: "pxc-phoenixcoin",
  potcoin: "pot-potcoin",
  primecoin: "xpm-primecoin",
  protoshares: "pts-protoshares",
  quark: "qrk-quarkcoin",
  reddcoin: "rdd-reddcoin",
  ripple: "xrp-xrp",
  royalcoin: "ryl-royalcoin",
  rubycoin: "rby-rubycoin",
  securecoin: "src-securecoin",
  sexcoin: "sxc-sexcoin",
  smartcoin: "smc-smartcoin",
  songcoin: "song-songcoin",
  stablecoin: "sbc-stablecoin",
  startcoin: "start-startcoin",
  tagcoin: "tag-tagcoin",
  takeicoin: "tak-takeicoin",
  terracoin: "trc-terracoin",
  tigercoin: "tgc-tigercoin",
  unobtanium: "uno-unobtanium",
  vertcoin: "vtc-vertcoin",
  viacoin: "via-viacoin",
  worldcoin: "wdc-worldcoin",
  yacoin: "yac-yacoin",
  zetacoin: "zet-zetacoin",
}

const tokenCache = new Map<string, { data: CryptoToken; timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute cache

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

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url)
      if (response.ok) {
        return response
      }

      if (response.status === 429 && attempt < maxRetries) {
        const delay = [10000, 30000, 60000][attempt] || 60000
        console.log(`[v0] Rate limited, waiting ${delay}ms before retry ${attempt + 1}`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      // For other errors, throw to try next API
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }

      const delay = [2000, 5000, 10000][attempt] || 10000
      console.log(`[v0] Attempt ${attempt + 1} failed, retrying in ${delay}ms`)
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

function getCoinGeckoId(tokenId: string): string {
  // Convert CoinPaprika format to CoinGecko format
  const coinGeckoMappings: Record<string, string> = {
    "eth-ethereum": "ethereum",
    "btc-bitcoin": "bitcoin",
    "bnb-binance-coin": "binancecoin",
    "sol-solana": "solana",
    "ada-cardano": "cardano",
    "avax-avalanche": "avalanche-2",
    "link-chainlink": "chainlink",
    "matic-polygon": "matic-network",
    "ai16z-ai16z": "ai16z",
    "virtual-virtual-protocol": "virtual-protocol",
    "sand-the-sandbox": "the-sandbox",
    "axs-axie-infinity": "axie-infinity",
    "enj-enjin-coin": "enjincoin",
    "gala-gala": "gala",
    "imx-immutable-x": "immutable-x",
    "rndr-render": "render-token",
    "fet-fetch-ai": "fetch-ai",
    "agix-singularitynet": "singularitynet",
    "ocean-ocean-protocol": "ocean-protocol",
    "uni-uniswap": "uniswap",
    "aave-aave": "aave",
    "comp-compound": "compound",
    "mkr-maker": "maker",
    "crv-curve-dao-token": "curve-dao-token",
    "1inch-1inch": "1inch",
    "sushi-sushiswap": "sushiswap",
    "cake-pancakeswap": "pancakeswap-token",
    "yfi-yearn-finance": "yearn-finance",
    "snx-synthetix": "synthetix",
    "dot-polkadot": "polkadot",
    "atom-cosmos": "cosmos",
    "near-near-protocol": "near",
    "algo-algorand": "algorand",
    "xtz-tezos": "tezos",
    "egld-elrond": "elrond-erd-2",
    "ftm-fantom": "fantom",
    "one-harmony": "harmony",
    "arb-arbitrum": "arbitrum",
    "op-optimism": "optimism",
    "doge-dogecoin": "dogecoin",
    "shib-shiba-inu": "shiba-inu",
    "pepe-pepe": "pepe",
    "floki-floki-inu": "floki",
    "bonk-bonk": "bonk",
    "wif-dogwifhat": "dogwifcoin",
    "meme-memecoin": "memecoin",
    "cro-cronos": "crypto-com-chain",
    "ftt-ftx-token": "ftx-token",
    "kcs-kucoin-token": "kucoin-shares",
    "ht-huobi-token": "huobi-token",
    "okb-okb": "okb",
    "usdt-tether": "tether",
    "usdc-usd-coin": "usd-coin",
    "busd-binance-usd": "binance-usd",
    "dai-dai": "dai",
    "frax-frax": "frax",
    "ust-terrausd": "terrausd",
    "xmr-monero": "monero",
    "zec-zcash": "zcash",
    "dash-dash": "dash",
    "dcr-decred": "decred",
    "grt-the-graph": "the-graph",
    "fil-filecoin": "filecoin",
    "ar-arweave": "arweave",
    "hnt-helium": "helium",
    "theta-theta-network": "theta-token",
    "bat-basic-attention-token": "basic-attention-token",
    "xrp-xrp": "ripple",
    "xlm-stellar": "stellar",
    "vet-vechain": "vechain",
    "miota-iota": "iota",
    "hbar-hedera": "hedera-hashgraph",
    "qnt-quant": "quant-network",
    "apt-aptos": "aptos",
    "sui-sui": "sui",
    "sei-sei": "sei-network",
    "tia-celestia": "celestia",
    "inj-injective": "injective-protocol",
    "kas-kaspa": "kaspa",
    "icp-internet-computer": "internet-computer",
    "rune-thorchain": "thorchain",
    "osmo-osmosis": "osmosis",
    "jto-jito": "jito-governance-token",
    "jup-jupiter": "jupiter-exchange-solana",
    "pyth-pyth-network": "pyth-network",
    "w-wormhole": "wormhole",
    "strk-starknet": "starknet",
    "wld-worldcoin": "worldcoin-wld",
    "mnt-mantle": "mantle",
    "blur-blur": "blur",
    "ldo-lido-dao": "lido-dao",
    "rpl-rocket-pool": "rocket-pool",
    "fxs-frax-share": "frax-share",
    "cvx-convex-finance": "convex-finance",
    "ltc-litecoin": "litecoin",
    "bch-bitcoin-cash": "bitcoin-cash",
    "etc-ethereum-classic": "ethereum-classic",
    "trx-tron": "tron",
    "neo-neo": "neo",
    "eos-eos": "eos",
    "zil-zilliqa": "zilliqa",
    "ont-ontology": "ontology",
    "icx-icon": "icon",
    "waves-waves": "waves",
    "xno-nano": "nano",
    "dgb-digibyte": "digibyte",
    "rvn-ravencoin": "ravencoin",
    "xvg-verge": "verge",
    "sc-siacoin": "siacoin",
    "glm-golem": "golem",
    "snt-status": "status",
    "zrx-0x": "0x",
    "rep-augur": "augur",
    "knc-kyber-network": "kyber-network-crystal",
    "lrc-loopring": "loopring",
    "bnt-bancor": "bancor",
    "req-request": "request-network",
    "powr-power-ledger": "power-ledger",
    "cvc-civic": "civic",
    "dnt-district0x": "district0x",
    "nmr-numeraire": "numeraire",
    "gno-gnosis": "gnosis",
    "storj-storj": "storj",
    "maid-maidsafecoin": "maidsafecoin",
    "fct-factom": "factom",
    "lsk-lisk": "lisk",
    "strax-stratis": "stratis",
    "ark-ark": "ark",
    "kmd-komodo": "komodo",
    "pivx-pivx": "pivx",
    "vtc-vertcoin": "vertcoin",
    "sys-syscoin": "syscoin",
    "nebl-neblio": "neblio",
    "part-particl": "particl",
    "crw-crown": "crown",
    "ppc-peercoin": "peercoin",
    "xpm-primecoin": "primecoin",
    "ftc-feathercoin": "feathercoin",
    "nvc-novacoin": "novacoin",
    "trc-terracoin": "terracoin",
    "mec-megacoin": "megacoin",
    "qrk-quarkcoin": "quarkcoin",
    "wdc-worldcoin": "worldcoin",
    "ifc-infinitecoin": "infinitecoin",
    "ixc-ixcoin": "ixcoin",
    "dvc-devcoin": "devcoin",
    "frc-freicoin": "freicoin",
    "nmc-namecoin": "namecoin",
  }

  const directSymbolMappings: Record<string, string> = {
    AI16Z: "ai16z",
    VIRTUAL: "virtual-protocol",
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    ADA: "cardano",
    AVAX: "avalanche-2",
    LINK: "chainlink",
    MATIC: "matic-network",
    UNI: "uniswap",
    AAVE: "aave",
    DOGE: "dogecoin",
    SHIB: "shiba-inu",
    PEPE: "pepe",
    XRP: "ripple",
    LTC: "litecoin",
    DOT: "polkadot",
    ATOM: "cosmos",
    NEAR: "near",
    ALGO: "algorand",
  }

  // Check direct symbol mapping first
  if (directSymbolMappings[tokenId.toUpperCase()]) {
    return directSymbolMappings[tokenId.toUpperCase()]
  }

  return coinGeckoMappings[tokenId] || tokenId
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

  const cached = tokenCache.get(tokenId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[v0] Returning cached data for ${tokenId}`)
    const apiResponse: ApiResponse<CryptoToken> = {
      success: true,
      data: cached.data,
    }
    return NextResponse.json(apiResponse)
  }

  console.log(`[v0] Fetching token data for: ${tokenId}`)

  await new Promise((resolve) => setTimeout(resolve, 1000))

  let coinGeckoError = ""
  let coinPaprikaError = ""

  try {
    const coinGeckoId = getCoinGeckoId(tokenId)
    const coinGeckoUrl = `${COINGECKO_BASE_URL}/coins/${coinGeckoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    console.log(`[v0] CoinGecko URL: ${coinGeckoUrl} (original: ${tokenId}, normalized: ${coinGeckoId})`)

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

      tokenCache.set(tokenId, { data: token, timestamp: Date.now() })
      console.log(`[v0] Successfully fetched ${tokenId} at $${token.current_price}`)

      const apiResponse: ApiResponse<CryptoToken> = {
        success: true,
        data: token,
      }

      return NextResponse.json(apiResponse)
    }
  } catch (error) {
    coinGeckoError = error instanceof Error ? error.message : String(error)
    console.error(`[v0] CoinGecko failed for ${tokenId}:`, coinGeckoError)
  }

  await new Promise((resolve) => setTimeout(resolve, 2000))

  try {
    const coinPaprikaId = TOKEN_ID_MAPPING[tokenId] || tokenId
    console.log(`[v0] Trying CoinPaprika for: ${tokenId} (mapped to: ${coinPaprikaId})`)

    const response = await fetchWithRetry(`${COINPAPRIKA_BASE_URL}/coins/${coinPaprikaId}`)
    const text = await response.text()
    const data = safeJsonParse<any>(text)

    if (data) {
      let tickerData = null
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const tickerResponse = await fetchWithRetry(`${COINPAPRIKA_BASE_URL}/tickers/${coinPaprikaId}`)
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

      tokenCache.set(tokenId, { data: token, timestamp: Date.now() })
      console.log(`[v0] CoinPaprika success for ${tokenId} at $${token.current_price}`)

      const apiResponse: ApiResponse<CryptoToken> = {
        success: true,
        data: token,
      }

      return NextResponse.json(apiResponse)
    }
  } catch (error) {
    coinPaprikaError = error instanceof Error ? error.message : String(error)
    console.error(`[v0] CoinPaprika failed for ${tokenId}:`, coinPaprikaError)
  }

  console.error(`[v0] No data found for token: ${tokenId}`)

  let errorMessage = "Cannot find this data right now, try again shortly."
  if (coinGeckoError.includes("429") && coinPaprikaError.includes("404")) {
    errorMessage =
      "Token data temporarily unavailable due to API limits. This token may be very new or not widely tracked yet. Please try again in a few minutes."
  }

  const errorResponse: ApiResponse<CryptoToken> = {
    success: false,
    error: errorMessage,
  }

  return NextResponse.json(errorResponse, { status: 404 })
}

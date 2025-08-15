export interface CryptoToken {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
  price_change_percentage_7d: number
  total_volume: number
  circulating_supply: number
  max_supply: number | null
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
  image: string
}

export interface MarketOverview {
  total_market_cap: number
  total_volume_24h: number
  market_cap_change_percentage_24h: number
  active_cryptocurrencies: number
  usdt_pairs_count: number
  active_analysis_count: number
  btc_price: number
  btc_price_change_24h: number
  btc_dominance: number
  usdt_dominance: number
  total3_market_cap: number
  total3_change_24h: number
}

export interface TechnicalIndicators {
  rsi: number
  support_level: number
  resistance_level: number
  volume_indicator: "High" | "Medium" | "Low"
  liquidity_metric: "High" | "Medium" | "Low"
  trend_direction: "Bullish" | "Bearish" | "Neutral"
}

export interface TradingSignal {
  signal: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell"
  confidence: number
  timeframe: "1h" | "4h" | "1d" | "7d" | "1m"
  justification: string
  technical_factors: string[]
}

export interface AnalysisResult {
  token: CryptoToken
  signals: TradingSignal[]
  technical_indicators: TechnicalIndicators
  ai_insight: string
  last_analysis: string
}

export interface SearchResult {
  id: string
  symbol: string
  name: string
  market_cap_rank: number
  thumb: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  fallback?: boolean
}

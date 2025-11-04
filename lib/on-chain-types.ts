export interface WhaleTransaction {
  hash: string
  from: string
  to: string
  value: string // in ETH
  valueUSD: number
  timestamp: number
  blockNumber: number
  type: "buy" | "sell" | "transfer" | "defi"
  token?: {
    symbol: string
    name: string
    address: string
  }
  gasUsed: string
  gasPrice: string
}

export interface SmartMoneyWallet {
  address: string
  label: string
  totalValue: number
  recentActivity: WhaleTransaction[]
  winRate: number
  avgHoldTime: number
}

export interface OnChainSignal {
  id: string
  type: "whale_buy" | "whale_sell" | "smart_money_accumulation" | "unusual_volume" | "large_transfer"
  severity: "low" | "medium" | "high" | "critical"
  token: {
    symbol: string
    name: string
    address: string
  }
  description: string
  transaction: WhaleTransaction
  timestamp: number
  confidence: number // 0-100
}

export interface OnChainMetrics {
  totalWhaleTransactions: number
  totalVolumeUSD: number
  topTokens: Array<{
    symbol: string
    address: string
    volume: number
    transactions: number
  }>
  smartMoneyActivity: number
  signals: OnChainSignal[]
}

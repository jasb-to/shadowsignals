export interface NotificationPreferences {
  userId: string
  email?: string
  emailEnabled: boolean
  inAppEnabled: boolean
  webhookUrl?: string
  webhookEnabled: boolean
  minTransactionValue: number // Minimum USD value to trigger alert
  alertTypes: {
    whaleBuy: boolean
    whaleSell: boolean
    smartMoneyAccumulation: boolean
    largeTransfer: boolean
    unusualVolume: boolean
  }
  tokens: string[] // Token symbols to monitor (empty = all)
}

export interface Notification {
  id: string
  userId: string
  type: "whale_buy" | "whale_sell" | "smart_money_accumulation" | "large_transfer" | "unusual_volume"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  message: string
  token: {
    symbol: string
    address: string
  }
  transactionHash: string
  valueUSD: number
  timestamp: number
  read: boolean
  sentVia: ("email" | "webhook" | "in_app")[]
}

export interface AlertHistory {
  notifications: Notification[]
  unreadCount: number
  lastChecked: number
}

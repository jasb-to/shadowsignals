export interface SubscriptionTier {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  limits: {
    whaleAlerts: number // alerts per day
    chains: string[] // supported blockchains
    minTransactionSize: number // minimum transaction size in USD
    historicalData: number // days of historical data
    aiAnalysis: boolean
    customAlerts: boolean
    apiAccess: boolean
  }
}

// Source of truth for all subscription tiers
export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic whale tracking for Ethereum",
    priceInCents: 0,
    features: [
      "5 whale alerts per day",
      "Ethereum only",
      "Transactions >$500K",
      "24 hours historical data",
      "Basic notifications",
    ],
    limits: {
      whaleAlerts: 5,
      chains: ["ethereum"],
      minTransactionSize: 500000,
      historicalData: 1,
      aiAnalysis: false,
      customAlerts: false,
      apiAccess: false,
    },
  },
  {
    id: "basic",
    name: "Basic",
    description: "Enhanced whale tracking with AI insights",
    priceInCents: 2300, // £23/month (converted from $29)
    features: [
      "50 whale alerts per day",
      "Ethereum + BSC",
      "Transactions >$100K",
      "7 days historical data",
      "AI-powered analysis",
      "Email & Telegram alerts",
    ],
    limits: {
      whaleAlerts: 50,
      chains: ["ethereum", "bsc"],
      minTransactionSize: 100000,
      historicalData: 7,
      aiAnalysis: true,
      customAlerts: false,
      apiAccess: false,
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "Advanced multi-chain tracking with custom alerts",
    priceInCents: 7900, // £79/month (converted from $99)
    features: [
      "Unlimited whale alerts",
      "All major chains (ETH, BSC, Polygon, Arbitrum)",
      "Transactions >$50K",
      "30 days historical data",
      "Advanced AI analysis",
      "Custom alert rules",
      "Discord webhooks",
      "Priority support",
    ],
    limits: {
      whaleAlerts: -1, // unlimited
      chains: ["ethereum", "bsc", "polygon", "arbitrum"],
      minTransactionSize: 50000,
      historicalData: 30,
      aiAnalysis: true,
      customAlerts: true,
      apiAccess: false,
    },
  },
  {
    id: "institutional",
    name: "Institutional",
    description: "Enterprise-grade analytics with API access",
    priceInCents: 39900, // £399/month (converted from $499)
    features: [
      "Unlimited whale alerts",
      "All chains supported",
      "Transactions >$10K",
      "90 days historical data",
      "Real-time AI analysis",
      "Custom alert rules",
      "Full API access",
      "Dedicated support",
      "Custom integrations",
      "White-label options",
    ],
    limits: {
      whaleAlerts: -1, // unlimited
      chains: ["ethereum", "bsc", "polygon", "arbitrum", "avalanche", "fantom", "optimism"],
      minTransactionSize: 10000,
      historicalData: 90,
      aiAnalysis: true,
      customAlerts: true,
      apiAccess: true,
    },
  },
]

export const STRIPE_PRICE_IDS = {
  basic: "price_1SJx50GgZuViyFjDZq26qaJ2",
  pro: "price_1SJx5PGgZuViyFjDn6VbmliU",
  institutional: "price_1SJx5sGgZuViyFjDTROl5Cp4",
}

export function getTierById(tierId: string): SubscriptionTier | undefined {
  return SUBSCRIPTION_TIERS.find((tier) => tier.id === tierId)
}

export function formatPrice(priceInCents: number): string {
  if (priceInCents === 0) return "Free"
  return `£${(priceInCents / 100).toFixed(0)}/mo` // Changed $ to £ for GBP pricing
}

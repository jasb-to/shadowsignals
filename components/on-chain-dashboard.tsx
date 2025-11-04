"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, TrendingUp, Activity, AlertTriangle, Lock } from "lucide-react"
import type { WhaleTransaction, OnChainSignal, OnChainMetrics } from "@/lib/on-chain-types"
import type { Notification } from "@/lib/notification-types"

interface OnChainDashboardProps {
  subscriptionTier: "free" | "basic" | "pro" | "institutional"
}

export function OnChainDashboard({ subscriptionTier }: OnChainDashboardProps) {
  const [whaleTransactions, setWhaleTransactions] = useState<WhaleTransaction[]>([])
  const [signals, setSignals] = useState<OnChainSignal[]>([])
  const [metrics, setMetrics] = useState<OnChainMetrics | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("overview")

  // Tier limits
  const tierLimits = {
    free: { transactions: 5, signals: 3, aiAnalysis: false },
    basic: { transactions: 20, signals: 10, aiAnalysis: true },
    pro: { transactions: 50, signals: 25, aiAnalysis: true },
    institutional: { transactions: 100, signals: 50, aiAnalysis: true },
  }

  const limits = tierLimits[subscriptionTier]

  useEffect(() => {
    fetchOnChainData()
    const interval = setInterval(fetchOnChainData, 120000) // Refresh every 2 minutes
    return () => clearInterval(interval)
  }, [])

  async function fetchOnChainData() {
    try {
      setLoading(true)

      // Fetch whale transactions
      const txResponse = await fetch("/api/on-chain/whale-transactions")
      const txData = await txResponse.json()
      setWhaleTransactions(txData.transactions || [])
      setSignals(txData.signals || [])

      // Fetch metrics
      const metricsResponse = await fetch("/api/on-chain/metrics")
      const metricsData = await metricsResponse.json()
      setMetrics(metricsData)

      // Fetch notifications
      const notifResponse = await fetch("/api/notifications/list?userId=demo_user")
      const notifData = await notifResponse.json()
      setNotifications(notifData.notifications || [])

      console.log("[v0] On-chain data fetched successfully")
    } catch (error) {
      console.error("[v0] Error fetching on-chain data:", error)
    } finally {
      setLoading(false)
    }
  }

  const displayTransactions = whaleTransactions.slice(0, limits.transactions)
  const displaySignals = signals.slice(0, limits.signals)
  const isLocked = (feature: "transactions" | "signals" | "aiAnalysis") => {
    if (feature === "aiAnalysis") return !limits.aiAnalysis
    return false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              On-Chain Analyst
            </h1>
            <p className="text-gray-400 text-lg">Real-time whale tracking and smart money analysis</p>
          </div>
          <Badge
            variant={subscriptionTier === "free" ? "secondary" : "default"}
            className={`text-sm px-4 py-2 ${
              subscriptionTier === "free"
                ? "bg-gray-700 text-gray-300"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
            }`}
          >
            {subscriptionTier.toUpperCase()} Plan
          </Badge>
        </div>

        {/* Metrics Overview */}
        {metrics && (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-gray-800/50 border border-blue-500/20 rounded-xl p-4 hover:bg-blue-900/10 hover:border-blue-400/40 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 group-hover:text-blue-300 transition-colors">
                    Whale Transactions
                  </p>
                  <p className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors">
                    {metrics.totalWhaleTransactions}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 border border-green-500/20 rounded-xl p-4 hover:bg-green-900/10 hover:border-green-400/40 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 group-hover:text-green-300 transition-colors">Total Volume</p>
                  <p className="text-2xl font-bold text-white group-hover:text-green-100 transition-colors">
                    ${(metrics.totalVolumeUSD / 1e6).toFixed(1)}M
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 border border-yellow-500/20 rounded-xl p-4 hover:bg-yellow-900/10 hover:border-yellow-400/40 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 group-hover:text-yellow-300 transition-colors">Smart Money</p>
                  <p className="text-2xl font-bold text-white group-hover:text-yellow-100 transition-colors">
                    {metrics.smartMoneyActivity}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 border border-purple-500/20 rounded-xl p-4 hover:bg-purple-900/10 hover:border-purple-400/40 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 group-hover:text-purple-300 transition-colors">Active Signals</p>
                  <p className="text-2xl font-bold text-white group-hover:text-purple-100 transition-colors">
                    {signals.length}
                  </p>
                </div>
                <Bell className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              Whale Transactions
            </TabsTrigger>
            <TabsTrigger
              value="signals"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              Signals
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Recent Signals */}
              <div className="bg-gray-800/50 border border-cyan-500/30 rounded-xl p-6">
                <h3 className="mb-4 text-lg font-semibold text-cyan-300">Recent Signals</h3>
                <div className="space-y-3">
                  {displaySignals.length === 0 ? (
                    <p className="text-sm text-gray-400">No signals detected</p>
                  ) : (
                    displaySignals.map((signal) => (
                      <div key={signal.id} className="flex items-start gap-3 rounded-lg border p-3">
                        <Badge
                          variant={
                            signal.severity === "critical"
                              ? "destructive"
                              : signal.severity === "high"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {signal.severity}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{signal.token.symbol}</p>
                          <p className="text-xs text-gray-400">{signal.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {whaleTransactions.length > limits.signals && (
                    <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed p-3">
                      <Lock className="h-4 w-4" />
                      <p className="text-sm text-gray-400">
                        Upgrade to see {signals.length - limits.signals} more signals
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Tokens */}
              <div className="bg-gray-800/50 border border-cyan-500/30 rounded-xl p-6">
                <h3 className="mb-4 text-lg font-semibold text-cyan-300">Top Tokens by Volume</h3>
                <div className="space-y-3">
                  {metrics?.topTokens.slice(0, 5).map((token, index) => (
                    <div key={token.address} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                        <span className="font-medium text-white">{token.symbol}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">${(token.volume / 1e6).toFixed(2)}M</p>
                        <p className="text-xs text-gray-400">{token.transactions} txs</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="bg-gray-800/50 border border-cyan-500/30 rounded-xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-cyan-300">Whale Transactions</h3>
                <Button onClick={fetchOnChainData} variant="outline" size="sm" className="text-white bg-transparent">
                  Refresh
                </Button>
              </div>

              <div className="space-y-2">
                {loading ? (
                  <p className="text-center text-sm text-gray-400">Loading transactions...</p>
                ) : displayTransactions.length === 0 ? (
                  <p className="text-center text-sm text-gray-400">No whale transactions found</p>
                ) : (
                  displayTransactions.map((tx) => (
                    <div key={tx.hash} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={tx.type === "buy" ? "default" : tx.type === "sell" ? "destructive" : "secondary"}
                          >
                            {tx.type}
                          </Badge>
                          {tx.token && <span className="font-medium text-white">{tx.token.symbol}</span>}
                        </div>
                        <p className="mt-1 text-sm text-gray-400">
                          {tx.value} ETH (${tx.valueUSD.toLocaleString()})
                        </p>
                        <p className="text-xs text-gray-400">{new Date(tx.timestamp * 1000).toLocaleString()}</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="text-white">
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs"
                        >
                          View on Etherscan
                        </a>
                      </Button>
                    </div>
                  ))
                )}

                {whaleTransactions.length > limits.transactions && (
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed p-4">
                    <Lock className="h-5 w-5 text-white" />
                    <div className="text-center">
                      <p className="font-medium text-white">Upgrade to see more transactions</p>
                      <p className="text-sm text-gray-400">
                        {whaleTransactions.length - limits.transactions} more whale transactions available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signals" className="space-y-4">
            <div className="bg-gray-800/50 border border-cyan-500/30 rounded-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-cyan-300">Active Signals</h3>
              <div className="space-y-3">
                {displaySignals.length === 0 ? (
                  <p className="text-center text-sm text-gray-400">No active signals</p>
                ) : (
                  displaySignals.map((signal) => (
                    <div key={signal.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              signal.severity === "critical"
                                ? "destructive"
                                : signal.severity === "high"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {signal.severity}
                          </Badge>
                          <span className="font-medium text-white">{signal.token.symbol}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(signal.timestamp * 1000).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mb-2 text-sm text-white">{signal.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Confidence: {signal.confidence}%</span>
                        <Button variant="ghost" size="sm" asChild className="text-white">
                          <a
                            href={`https://etherscan.io/tx/${signal.transaction.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs"
                          >
                            View Transaction
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="bg-gray-800/50 border border-cyan-500/30 rounded-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-cyan-300">Notifications</h3>
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-gray-400">No notifications</p>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif.id}
                      className={`rounded-lg border p-3 ${notif.read ? "opacity-60" : "bg-accent/50"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-white">{notif.title}</p>
                          <p className="text-sm text-gray-400">{notif.message}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(notif.timestamp * 1000).toLocaleString()}
                          </p>
                        </div>
                        {!notif.read && (
                          <Badge variant="default" className="text-white">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Upgrade CTA for free users */}
        {subscriptionTier === "free" && (
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1 text-lg font-semibold text-cyan-300">Unlock Full On-Chain Analysis</h3>
                <p className="text-sm text-gray-400">Get unlimited whale tracking, AI analysis, and real-time alerts</p>
              </div>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                asChild
              >
                <a href="/pricing">Upgrade Now</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

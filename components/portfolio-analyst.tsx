"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Wallet,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  PieChart,
  RefreshCw,
  Sparkles,
  Send,
  Brain,
  AlertTriangle,
  Info,
  Bell,
  BellOff,
  Clock,
  Activity,
  BarChart3,
  Users,
  Droplets,
  Target,
} from "lucide-react"
import {
  connectMetaMask,
  connectWalletConnect,
  connectPhantom,
  disconnectWallet,
  formatWalletAddress,
  copyToClipboard,
  type WalletConnection,
  type WalletType,
} from "@/lib/wallet-connection"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"

export function PortfolioAnalyst() {
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null)
  const { toast } = useToast()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Portfolio AI Analyst
          </h1>
          <p className="text-gray-400 text-lg">Connect your wallet for AI-powered portfolio insights and analysis</p>
        </div>

        {!walletConnection ? (
          <WalletConnectionCard
            onConnect={(connection) => {
              setWalletConnection(connection)
              toast({
                title: "Wallet Connected",
                description: `Successfully connected to ${connection.walletType}`,
              })
            }}
          />
        ) : (
          <PortfolioDashboard
            walletConnection={walletConnection}
            onDisconnect={async () => {
              try {
                await disconnectWallet(walletConnection.walletType)
                setWalletConnection(null)
                toast({
                  title: "Wallet Disconnected",
                  description: "Your wallet has been disconnected",
                })
              } catch (error) {
                toast({
                  title: "Disconnection Error",
                  description: "Failed to disconnect wallet",
                  variant: "destructive",
                })
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

function WalletConnectionCard({ onConnect }: { onConnect: (connection: WalletConnection) => void }) {
  const [connecting, setConnecting] = useState<WalletType | null>(null)
  const { toast } = useToast()

  const handleConnect = async (walletType: WalletType) => {
    setConnecting(walletType)
    try {
      let connection: WalletConnection

      switch (walletType) {
        case "metamask":
          connection = await connectMetaMask()
          break
        case "walletconnect":
          connection = await connectWalletConnect()
          break
        case "phantom":
          connection = await connectPhantom()
          break
        default:
          throw new Error("Unsupported wallet type")
      }

      // Send connection info to API
      const response = await fetch("/api/portfolio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: connection.address,
          chain: connection.chain,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to register wallet connection")
      }

      onConnect(connection)
    } catch (error: any) {
      console.error("[v0] Wallet connection error:", error)
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setConnecting(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* MetaMask */}
      <Card className="bg-gray-800/50 border border-blue-500/20 p-6 hover:border-blue-500/40 transition-all cursor-pointer group">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">MetaMask</h3>
            <p className="text-gray-400 text-sm">Connect with MetaMask wallet</p>
          </div>
          <Button
            onClick={() => handleConnect("metamask")}
            disabled={connecting !== null}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
          >
            {connecting === "metamask" ? "Connecting..." : "Connect"}
          </Button>
        </div>
      </Card>

      {/* WalletConnect */}
      <Card className="bg-gray-800/50 border border-purple-500/20 p-6 hover:border-purple-500/40 transition-all cursor-pointer group">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">WalletConnect</h3>
            <p className="text-gray-400 text-sm">Connect with WalletConnect</p>
          </div>
          <Button
            onClick={() => handleConnect("walletconnect")}
            disabled={connecting !== null}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            {connecting === "walletconnect" ? "Connecting..." : "Connect"}
          </Button>
        </div>
      </Card>

      {/* Phantom */}
      <Card className="bg-gray-800/50 border border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all cursor-pointer group">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Phantom</h3>
            <p className="text-gray-400 text-sm">Connect with Phantom wallet (Solana)</p>
          </div>
          <Button
            onClick={() => handleConnect("phantom")}
            disabled={connecting !== null}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {connecting === "phantom" ? "Connecting..." : "Connect"}
          </Button>
        </div>
      </Card>

      {/* Security Notice */}
      <Card className="md:col-span-2 lg:col-span-3 bg-blue-900/20 border border-blue-500/30 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Non-Custodial & Secure</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Shadow Signals uses view-only wallet connections. We never request or store your private keys or seed
              phrases. Your wallet connection is read-only and completely secure. You maintain full control of your
              assets at all times.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function PortfolioDashboard({
  walletConnection,
  onDisconnect,
}: {
  walletConnection: WalletConnection
  onDisconnect: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiResponse, setAiResponse] = useState<{ answer: string; reasoning: string } | null>(null)
  const [askingAI, setAskingAI] = useState(false)
  const [selectedToken, setSelectedToken] = useState<any>(null)
  const [showAlerts, setShowAlerts] = useState(false)
  const { toast } = useToast()

  // Fetch portfolio holdings
  const {
    data: portfolioData,
    error,
    isLoading,
    mutate,
  } = useSWR(
    `/api/portfolio/holdings?address=${walletConnection.address}`,
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch holdings")
      return res.json()
    },
    { refreshInterval: 30000 }, // Refresh every 30 seconds
  )

  // Fetch AI analysis
  const { data: analysisData, isLoading: analysisLoading } = useSWR(
    portfolioData ? `/api/portfolio/analyze-${walletConnection.address}` : null,
    async () => {
      const res = await fetch("/api/portfolio/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: walletConnection.address,
          holdings: portfolioData.holdings,
        }),
      })
      if (!res.ok) throw new Error("Failed to analyze portfolio")
      return res.json()
    },
  )

  // Fetch alerts
  const { data: alertsData } = useSWR(
    `/api/portfolio/alerts?address=${walletConnection.address}`,
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch alerts")
      return res.json()
    },
    { refreshInterval: 60000 }, // Refresh every minute
  )

  const handleCopy = async () => {
    const success = await copyToClipboard(walletConnection.address)
    if (success) {
      setCopied(true)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openInExplorer = () => {
    const explorerUrl =
      walletConnection.chain === "ethereum"
        ? `https://etherscan.io/address/${walletConnection.address}`
        : `https://solscan.io/account/${walletConnection.address}`
    window.open(explorerUrl, "_blank")
  }

  const handleRefresh = () => {
    mutate()
    toast({
      title: "Refreshing",
      description: "Updating portfolio data...",
    })
  }

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !portfolioData) return

    setAskingAI(true)
    try {
      const res = await fetch("/api/portfolio/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: walletConnection.address,
          question: aiQuestion,
          holdings: portfolioData.holdings,
        }),
      })

      if (!res.ok) throw new Error("Failed to get AI response")

      const data = await res.json()
      setAiResponse(data)
      setAiQuestion("")
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAskingAI(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Wallet Info Header */}
      <Card className="bg-gray-800/50 border border-cyan-500/30 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">
                Connected via {walletConnection.walletType} ({walletConnection.chain})
              </p>
              <p className="text-white font-mono text-lg">{formatWalletAddress(walletConnection.address, 6)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAlerts(true)}
              variant="outline"
              size="sm"
              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 bg-transparent relative"
            >
              <Bell className="w-4 h-4" />
              {alertsData && alertsData.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  {alertsData.unreadCount}
                </span>
              )}
            </Button>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              onClick={openInExplorer}
              variant="outline"
              size="sm"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 bg-transparent"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={onDisconnect}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Card>

      {isLoading && (
        <Card className="bg-gray-800/50 border border-cyan-500/30 p-12">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading portfolio data...</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="bg-red-900/20 border border-red-500/30 p-6">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">Error Loading Portfolio</h4>
              <p className="text-gray-300 text-sm">{error.message}</p>
            </div>
          </div>
        </Card>
      )}

      {portfolioData && (
        <>
          {/* Portfolio Overview Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Total Value */}
            <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Total Portfolio Value</p>
                <Wallet className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                $
                {portfolioData.totalValue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-gray-400">{portfolioData.holdings.length} tokens</p>
            </Card>

            {/* 24h Change */}
            <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">24h Change</p>
                {portfolioData.percentChange24h >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <p
                className={`text-3xl font-bold mb-1 ${portfolioData.percentChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {portfolioData.percentChange24h >= 0 ? "+" : ""}
                {portfolioData.percentChange24h.toFixed(2)}%
              </p>
              <p className={`text-sm ${portfolioData.totalChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                {portfolioData.totalChange24h >= 0 ? "+" : ""}$
                {Math.abs(portfolioData.totalChange24h).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </Card>

            {/* Best Performer */}
            <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Best Performer (24h)</p>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              {(() => {
                const bestPerformer = portfolioData.holdings.reduce((best: any, current: any) =>
                  current.priceChange24h > best.priceChange24h ? current : best,
                )
                return (
                  <>
                    <p className="text-2xl font-bold text-white mb-1">{bestPerformer.symbol}</p>
                    <p className="text-sm text-green-400">+{bestPerformer.priceChange24h.toFixed(2)}%</p>
                  </>
                )
              })()}
            </Card>
          </div>

          {/* AI Insights Section */}
          {analysisData && (
            <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Portfolio Insights</h3>
                  <p className="text-sm text-gray-400">Powered by Shadow Signals AI</p>
                </div>
              </div>

              {/* Portfolio Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Diversification</p>
                  <p className="text-2xl font-bold text-white">
                    {analysisData.portfolioMetrics.diversification.toFixed(0)}%
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Risk Level</p>
                  <p
                    className={`text-2xl font-bold ${
                      analysisData.portfolioMetrics.riskLevel === "high"
                        ? "text-red-400"
                        : analysisData.portfolioMetrics.riskLevel === "medium"
                          ? "text-yellow-400"
                          : "text-green-400"
                    }`}
                  >
                    {analysisData.portfolioMetrics.riskLevel.toUpperCase()}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Avg 24h Change</p>
                  <p
                    className={`text-2xl font-bold ${analysisData.portfolioMetrics.avgChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {analysisData.portfolioMetrics.avgChange24h >= 0 ? "+" : ""}
                    {analysisData.portfolioMetrics.avgChange24h.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* AI Insights */}
              <div className="space-y-3 mb-6">
                {analysisData.insights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 bg-gray-800/30 rounded-lg p-4">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-200 text-sm leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              {analysisData.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white mb-3">Recommendations</h4>
                  {analysisData.recommendations.map((rec: any, index: number) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 rounded-lg p-4 ${
                        rec.priority === "high"
                          ? "bg-red-900/20 border border-red-500/30"
                          : "bg-yellow-900/20 border border-yellow-500/30"
                      }`}
                    >
                      {rec.priority === "high" ? (
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-white font-medium mb-1">{rec.action}</p>
                        <p className="text-gray-300 text-sm">{rec.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Ask AI Section */}
          <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Ask AI About Your Portfolio</h3>
                <p className="text-sm text-gray-400">Get personalized insights and recommendations</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Input
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAskAI()}
                placeholder="e.g., Should I rebalance my portfolio? When should I take profits?"
                className="flex-1 bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                disabled={askingAI}
              />
              <Button
                onClick={handleAskAI}
                disabled={askingAI || !aiQuestion.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                {askingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            {aiResponse && (
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-cyan-400 font-medium mb-2">AI Answer:</p>
                  <p className="text-white leading-relaxed">{aiResponse.answer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-1">Reasoning:</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{aiResponse.reasoning}</p>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Should I rebalance my portfolio?",
                  "When should I take profits?",
                  "Is my portfolio too risky?",
                  "Which token should I buy more of?",
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    onClick={() => setAiQuestion(suggestion)}
                    variant="outline"
                    size="sm"
                    className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Holdings Table with clickable rows */}
          <Card className="bg-gray-800/50 border border-cyan-500/30 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Your Holdings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Token</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Balance</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">USD Value</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">24h Change</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">% of Portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.holdings.map((holding: any, index: number) => (
                    <tr
                      key={index}
                      onClick={() => setSelectedToken(holding)}
                      className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={holding.logo || "/placeholder.svg"}
                            alt={holding.symbol}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="text-white font-medium">{holding.token}</p>
                            <p className="text-gray-400 text-sm">{holding.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 text-white font-mono">{holding.balance}</td>
                      <td className="text-right py-4 px-4 text-white font-medium">
                        $
                        {holding.usdValue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={`text-right py-4 px-4 font-medium ${holding.priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {holding.priceChange24h >= 0 ? "+" : ""}
                        {holding.priceChange24h.toFixed(2)}%
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                              style={{ width: `${holding.percentOfPortfolio}%` }}
                            />
                          </div>
                          <span className="text-white font-medium w-12 text-right">
                            {holding.percentOfPortfolio.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-400 mt-4 text-center">Click on any token to view detailed analysis</p>
          </Card>

          {/* Portfolio Allocation Chart */}
          <Card className="bg-gray-800/50 border border-cyan-500/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Portfolio Allocation</h3>
              <PieChart className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pie Chart Visualization */}
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {(() => {
                      let currentAngle = 0
                      const colors = ["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]
                      return portfolioData.holdings.map((holding: any, index: number) => {
                        const percentage = holding.percentOfPortfolio
                        const angle = (percentage / 100) * 360
                        const largeArcFlag = angle > 180 ? 1 : 0
                        const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180)
                        const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180)
                        const endX = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180)
                        const endY = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180)
                        currentAngle += angle
                        return (
                          <path
                            key={index}
                            d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                            fill={colors[index % colors.length]}
                            opacity="0.8"
                          />
                        )
                      })
                    })()}
                    <circle cx="50" cy="50" r="25" fill="#1f2937" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{portfolioData.holdings.length}</p>
                      <p className="text-xs text-gray-400">Tokens</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col justify-center space-y-3">
                {portfolioData.holdings.map((holding: any, index: number) => {
                  const colors = ["bg-cyan-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-green-500"]
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
                        <span className="text-white font-medium">{holding.symbol}</span>
                      </div>
                      <span className="text-gray-400">{holding.percentOfPortfolio.toFixed(1)}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Token Deep-Dive Modal */}
      {selectedToken && <TokenDeepDiveModal token={selectedToken} onClose={() => setSelectedToken(null)} />}

      {/* Alerts Panel */}
      {showAlerts && alertsData && <AlertsPanel alerts={alertsData.alerts} onClose={() => setShowAlerts(false)} />}
    </div>
  )
}

function TokenDeepDiveModal({ token, onClose }: { token: any; onClose: () => void }) {
  const { data: analysisData, isLoading } = useSWR(`/api/portfolio/token-analysis-${token.symbol}`, async () => {
    const res = await fetch("/api/portfolio/token-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: token.symbol, tokenData: token }),
    })
    if (!res.ok) throw new Error("Failed to analyze token")
    return res.json()
  })

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img src={token.logo || "/placeholder.svg"} alt={token.symbol} className="w-10 h-10 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold text-white">{token.token}</h2>
              <p className="text-gray-400 text-sm">{token.symbol}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Analyzing {token.symbol}...</p>
          </div>
        )}

        {analysisData && (
          <div className="space-y-6 mt-6">
            {/* Price Chart */}
            <Card className="bg-gray-800/50 border border-cyan-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Price Chart (30 Days)</h3>
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="h-48 flex items-end gap-1">
                {analysisData.analysis.priceHistory.map((point: any, index: number) => {
                  const maxPrice = Math.max(...analysisData.analysis.priceHistory.map((p: any) => p.price))
                  const minPrice = Math.min(...analysisData.analysis.priceHistory.map((p: any) => p.price))
                  const height = ((point.price - minPrice) / (maxPrice - minPrice)) * 100
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                      style={{ height: `${height}%` }}
                      title={`${point.date}: $${point.price}`}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>30d ago</span>
                <span>Today</span>
              </div>
            </Card>

            {/* AI Recommendation */}
            <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Recommendation</h3>
                  <p className="text-sm text-gray-400">What should I do?</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    className={`text-lg px-4 py-2 ${
                      analysisData.recommendation.action === "BUY"
                        ? "bg-green-500"
                        : analysisData.recommendation.action === "SELL"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                    }`}
                  >
                    {analysisData.recommendation.action}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Confidence</p>
                    <p className="text-2xl font-bold text-white">{analysisData.recommendation.confidence}%</p>
                  </div>
                </div>
                <p className="text-gray-200 leading-relaxed">{analysisData.recommendation.reasoning}</p>
              </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Confluence Score */}
              <Card className="bg-gray-800/50 border border-cyan-500/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Shadow Signals Score</p>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white">{analysisData.analysis.confluenceScore}/10</p>
                <div className="w-full h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${analysisData.analysis.confluenceScore * 10}%` }}
                  />
                </div>
              </Card>

              {/* Market Cap */}
              <Card className="bg-gray-800/50 border border-purple-500/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Market Cap</p>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">${(analysisData.analysis.marketCap / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-gray-400 mt-1">
                  Vol: ${(analysisData.analysis.volume24h / 1e9).toFixed(2)}B
                </p>
              </Card>

              {/* Holder Concentration */}
              <Card className="bg-gray-800/50 border border-orange-500/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Holder Concentration</p>
                  <Users className="w-4 h-4 text-orange-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Top 10:</span>
                    <span className="text-white font-medium">{analysisData.analysis.holderConcentration.top10}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Top 50:</span>
                    <span className="text-white font-medium">{analysisData.analysis.holderConcentration.top50}%</span>
                  </div>
                </div>
              </Card>

              {/* Liquidity */}
              <Card className="bg-gray-800/50 border border-green-500/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Total Liquidity</p>
                  <Droplets className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  ${(analysisData.analysis.liquidity.totalLocked / 1e9).toFixed(2)}B
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  DEX: ${(analysisData.analysis.liquidity.dexLiquidity / 1e9).toFixed(2)}B
                </p>
              </Card>
            </div>

            {/* Technical Indicators */}
            <Card className="bg-gray-800/50 border border-cyan-500/30 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Technical Indicators</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">RSI</p>
                  <p className="text-xl font-bold text-white">{analysisData.analysis.technicalIndicators.rsi}</p>
                  <p className="text-xs text-gray-500">
                    {analysisData.analysis.technicalIndicators.rsi > 70
                      ? "Overbought"
                      : analysisData.analysis.technicalIndicators.rsi < 30
                        ? "Oversold"
                        : "Neutral"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">MACD</p>
                  <p className="text-xl font-bold text-white capitalize">
                    {analysisData.analysis.technicalIndicators.macd}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Support / Resistance</p>
                  <p className="text-lg font-bold text-white">
                    ${analysisData.analysis.technicalIndicators.support} / $
                    {analysisData.analysis.technicalIndicators.resistance}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function AlertsPanel({ alerts, onClose }: { alerts: any[]; onClose: () => void }) {
  const [enabledAlerts, setEnabledAlerts] = useState<Set<string>>(
    new Set(alerts.filter((a) => a.enabled).map((a) => a.id)),
  )

  const toggleAlert = (id: string) => {
    setEnabledAlerts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500/30 bg-red-900/20"
      case "medium":
        return "border-yellow-500/30 bg-yellow-900/20"
      default:
        return "border-blue-500/30 bg-blue-900/20"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "whale_movement":
        return <Activity className="w-5 h-5 text-red-400" />
      case "volume_spike":
        return <TrendingUp className="w-5 h-5 text-yellow-400" />
      case "confluence_change":
        return <Target className="w-5 h-5 text-cyan-400" />
      case "price_alert":
        return <Bell className="w-5 h-5 text-blue-400" />
      default:
        return <Info className="w-5 h-5 text-gray-400" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-orange-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-orange-400" />
            <span className="text-white">Portfolio Alerts</span>
            <Badge className="bg-orange-500">{alerts.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`p-4 ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold">{alert.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {alert.token}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{alert.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => toggleAlert(alert.id)}
                  variant="ghost"
                  size="sm"
                  className={enabledAlerts.has(alert.id) ? "text-orange-400" : "text-gray-500"}
                >
                  {enabledAlerts.has(alert.id) ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium mb-1">Alert Types</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Whale Movements: Large transfers by major holders</li>
                <li>• Volume Spikes: Unusual trading activity</li>
                <li>• Confluence Changes: Shadow Signals score updates</li>
                <li>• Price Alerts: Your custom price targets</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

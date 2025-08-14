"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Shield,
  Database,
  Activity,
  BarChart3,
  Settings,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  TrendingUp,
  Clock,
  Globe,
  Zap,
} from "lucide-react"

interface ApiStatus {
  name: string
  status: "online" | "offline" | "degraded"
  responseTime: number
  lastCheck: string
  requests24h: number
  errorRate: number
}

interface TokenData {
  id: string
  symbol: string
  name: string
  market_cap_rank: number
  status: "active" | "inactive"
  last_updated: string
}

interface SearchAnalytics {
  query: string
  count: number
  last_searched: string
}

interface SystemMetrics {
  totalRequests: number
  successRate: number
  avgResponseTime: number
  activeUsers: number
  errorCount: number
  uptime: number
}

export function AdminDashboard() {
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([
    {
      name: "CoinGecko",
      status: "online",
      responseTime: 245,
      lastCheck: new Date().toISOString(),
      requests24h: 1247,
      errorRate: 0.2,
    },
    {
      name: "CoinPaprika",
      status: "online",
      responseTime: 312,
      lastCheck: new Date().toISOString(),
      requests24h: 456,
      errorRate: 0.8,
    },
    {
      name: "Hugging Face",
      status: "degraded",
      responseTime: 1200,
      lastCheck: new Date().toISOString(),
      requests24h: 89,
      errorRate: 5.2,
    },
  ])

  const [tokens, setTokens] = useState<TokenData[]>([
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      market_cap_rank: 1,
      status: "active",
      last_updated: new Date().toISOString(),
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      market_cap_rank: 2,
      status: "active",
      last_updated: new Date().toISOString(),
    },
    {
      id: "ai16z",
      symbol: "ai16z",
      name: "AI16Z",
      market_cap_rank: 50,
      status: "active",
      last_updated: new Date().toISOString(),
    },
  ])

  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalytics[]>([
    { query: "bitcoin", count: 1247, last_searched: new Date().toISOString() },
    { query: "ethereum", count: 892, last_searched: new Date().toISOString() },
    { query: "ai16z", count: 456, last_searched: new Date().toISOString() },
    { query: "pepe", count: 234, last_searched: new Date().toISOString() },
    { query: "doge", count: 189, last_searched: new Date().toISOString() },
  ])

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalRequests: 15678,
    successRate: 98.7,
    avgResponseTime: 342,
    activeUsers: 1247,
    errorCount: 23,
    uptime: 99.9,
  })

  const [newToken, setNewToken] = useState({ id: "", symbol: "", name: "", rank: "" })
  const [isAddingToken, setIsAddingToken] = useState(false)

  const refreshApiStatus = async () => {
    // Simulate API status check
    setApiStatuses((prev) =>
      prev.map((api) => ({
        ...api,
        lastCheck: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 1000) + 100,
        status: Math.random() > 0.1 ? "online" : Math.random() > 0.5 ? "degraded" : "offline",
      })),
    )
  }

  const addToken = () => {
    if (!newToken.id || !newToken.symbol || !newToken.name) return

    const token: TokenData = {
      id: newToken.id.toLowerCase(),
      symbol: newToken.symbol.toLowerCase(),
      name: newToken.name,
      market_cap_rank: Number.parseInt(newToken.rank) || 999,
      status: "active",
      last_updated: new Date().toISOString(),
    }

    setTokens((prev) => [...prev, token])
    setNewToken({ id: "", symbol: "", name: "", rank: "" })
    setIsAddingToken(false)
  }

  const removeToken = (tokenId: string) => {
    setTokens((prev) => prev.filter((token) => token.id !== tokenId))
  }

  const toggleTokenStatus = (tokenId: string) => {
    setTokens((prev) =>
      prev.map((token) =>
        token.id === tokenId ? { ...token, status: token.status === "active" ? "inactive" : "active" } : token,
      ),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "degraded":
        return "bg-yellow-500"
      case "offline":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setSystemMetrics((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 10),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2,
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Shadow Signals Admin</h1>
                  <p className="text-sm text-muted-foreground">Platform Management Dashboard</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                Private Access
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={refreshApiStatus}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
              <Badge variant="secondary">Admin Panel v1.0</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+12%</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+0.3%</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+8%</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.uptime}%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="apis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="apis">API Status</TabsTrigger>
            <TabsTrigger value="tokens">Token Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* API Status Tab */}
          <TabsContent value="apis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>API Endpoints Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiStatuses.map((api) => (
                    <div key={api.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(api.status)}
                        <div>
                          <h3 className="font-medium">{api.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Last checked: {new Date(api.lastCheck).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Response:</span> {api.responseTime}ms
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Requests:</span> {api.requests24h}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Error Rate:</span> {api.errorRate}%
                          </div>
                        </div>
                        <Badge className={getStatusColor(api.status)}>{api.status.toUpperCase()}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Token Management Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Token Database Management</span>
                  </CardTitle>
                  <Button onClick={() => setIsAddingToken(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Token
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAddingToken && (
                  <div className="mb-6 p-4 border rounded-lg space-y-4">
                    <h3 className="font-medium">Add New Token</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Input
                        placeholder="Token ID"
                        value={newToken.id}
                        onChange={(e) => setNewToken({ ...newToken, id: e.target.value })}
                      />
                      <Input
                        placeholder="Symbol"
                        value={newToken.symbol}
                        onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })}
                      />
                      <Input
                        placeholder="Name"
                        value={newToken.name}
                        onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                      />
                      <Input
                        placeholder="Rank"
                        type="number"
                        value={newToken.rank}
                        onChange={(e) => setNewToken({ ...newToken, rank: e.target.value })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={addToken}>Add Token</Button>
                      <Button variant="outline" onClick={() => setIsAddingToken(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell className="font-medium">{token.name}</TableCell>
                        <TableCell>{token.symbol.toUpperCase()}</TableCell>
                        <TableCell>#{token.market_cap_rank}</TableCell>
                        <TableCell>
                          <Badge variant={token.status === "active" ? "default" : "secondary"}>{token.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(token.last_updated).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => toggleTokenStatus(token.id)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => removeToken(token.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Popular Search Terms</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchAnalytics.map((search, index) => (
                      <div key={search.query} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                          <span className="font-medium">{search.query.toUpperCase()}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{search.count.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">searches</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>System Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Response Time</span>
                      <span className="font-medium">{systemMetrics.avgResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Count (24h)</span>
                      <span className="font-medium text-red-500">{systemMetrics.errorCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span className="font-medium text-green-500">{systemMetrics.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Sessions</span>
                      <span className="font-medium">{systemMetrics.activeUsers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>System Controls</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-transparent" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh All Caches
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Token Database
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    Reset API Rate Limits
                  </Button>
                  <Button className="w-full" variant="destructive">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Maintenance Mode
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Platform Version</span>
                    <span className="font-medium">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database Status</span>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Backup</span>
                    <span className="font-medium">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Tokens</span>
                    <span className="font-medium">{tokens.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

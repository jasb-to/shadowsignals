"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Crown, Zap, Building2, Bell, Mail, Webhook } from "lucide-react"
import { SUBSCRIPTION_TIERS, formatPrice } from "@/lib/subscription-tiers"
import type { NotificationPreferences } from "@/lib/notification-types"

interface SubscriptionManagerProps {
  currentTier: "free" | "basic" | "pro" | "institutional"
  userId?: string
}

export function SubscriptionManager({ currentTier, userId = "demo_user" }: SubscriptionManagerProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  async function fetchPreferences() {
    try {
      const response = await fetch(`/api/notifications/preferences?userId=${userId}`)
      const data = await response.json()
      setPreferences(data)
    } catch (error) {
      console.error("[v0] Error fetching preferences:", error)
    } finally {
      setLoading(false)
    }
  }

  async function savePreferences() {
    if (!preferences) return

    try {
      setSaving(true)
      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...preferences }),
      })

      if (response.ok) {
        console.log("[v0] Preferences saved successfully")
      }
    } catch (error) {
      console.error("[v0] Error saving preferences:", error)
    } finally {
      setSaving(false)
    }
  }

  const currentPlan = SUBSCRIPTION_TIERS.find((tier) => tier.id === currentTier)
  const tierIcons = {
    free: null,
    basic: <Zap className="h-5 w-5" />,
    pro: <Crown className="h-5 w-5" />,
    institutional: <Building2 className="h-5 w-5" />,
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {tierIcons[currentTier]}
            <div>
              <h2 className="text-2xl font-bold">{currentPlan?.name}</h2>
              <p className="text-muted-foreground">{currentPlan?.description}</p>
            </div>
          </div>
          <Badge variant={currentTier === "free" ? "secondary" : "default"} className="text-sm">
            Current Plan
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Whale Transactions</p>
            <p className="text-2xl font-bold">
              {currentPlan?.limits.whaleAlerts === -1 ? "Unlimited" : `${currentPlan?.limits.whaleAlerts}/day`}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Blockchains</p>
            <p className="text-2xl font-bold">{currentPlan?.limits.chains.length}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">AI Analysis</p>
            <p className="text-2xl font-bold">{currentPlan?.limits.aiAnalysis ? "Enabled" : "None"}</p>
          </div>
        </div>

        {currentTier !== "institutional" && (
          <div className="mt-6">
            <Button asChild className="w-full md:w-auto">
              <a href="/pricing">Upgrade Plan</a>
            </Button>
          </div>
        )}
      </Card>

      {/* Tabs for Settings */}
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {loading ? (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">Loading preferences...</p>
            </Card>
          ) : (
            <>
              {/* Notification Channels */}
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Notification Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="in-app">In-App Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications in the dashboard</p>
                      </div>
                    </div>
                    <Switch
                      id="in-app"
                      checked={preferences?.inAppEnabled}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => (prev ? { ...prev, inAppEnabled: checked } : null))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="email">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get alerts via email</p>
                      </div>
                    </div>
                    <Switch
                      id="email"
                      checked={preferences?.emailEnabled}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => (prev ? { ...prev, emailEnabled: checked } : null))
                      }
                      disabled={currentTier === "free"}
                    />
                  </div>

                  {preferences?.emailEnabled && (
                    <div className="ml-8">
                      <Label htmlFor="email-address">Email Address</Label>
                      <Input
                        id="email-address"
                        type="email"
                        placeholder="your@email.com"
                        value={preferences?.email || ""}
                        onChange={(e) => setPreferences((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Webhook className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="webhook">Webhook Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send alerts to Discord/Telegram</p>
                      </div>
                    </div>
                    <Switch
                      id="webhook"
                      checked={preferences?.webhookEnabled}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => (prev ? { ...prev, webhookEnabled: checked } : null))
                      }
                      disabled={currentTier === "free" || currentTier === "basic"}
                    />
                  </div>

                  {preferences?.webhookEnabled && (
                    <div className="ml-8">
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        type="url"
                        placeholder="https://discord.com/api/webhooks/..."
                        value={preferences?.webhookUrl || ""}
                        onChange={(e) =>
                          setPreferences((prev) => (prev ? { ...prev, webhookUrl: e.target.value } : null))
                        }
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </Card>

              {/* Alert Preferences */}
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Alert Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="min-value">Minimum Transaction Value (USD)</Label>
                    <Input
                      id="min-value"
                      type="number"
                      value={preferences?.minTransactionValue || 100000}
                      onChange={(e) =>
                        setPreferences((prev) =>
                          prev ? { ...prev, minTransactionValue: Number.parseInt(e.target.value) } : null,
                        )
                      }
                      className="mt-1"
                    />
                    <p className="mt-1 text-sm text-muted-foreground">Only alert for transactions above this value</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Alert Types</Label>
                    <div className="space-y-2">
                      {[
                        { key: "whaleBuy", label: "Whale Buy Transactions" },
                        { key: "whaleSell", label: "Whale Sell Transactions" },
                        { key: "smartMoneyAccumulation", label: "Smart Money Accumulation" },
                        { key: "largeTransfer", label: "Large Transfers" },
                        { key: "unusualVolume", label: "Unusual Volume" },
                      ].map((alertType) => (
                        <div key={alertType.key} className="flex items-center gap-2">
                          <Switch
                            id={alertType.key}
                            checked={preferences?.alertTypes[alertType.key as keyof typeof preferences.alertTypes]}
                            onCheckedChange={(checked) =>
                              setPreferences((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      alertTypes: {
                                        ...prev.alertTypes,
                                        [alertType.key]: checked,
                                      },
                                    }
                                  : null,
                              )
                            }
                          />
                          <Label htmlFor={alertType.key}>{alertType.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={savePreferences} disabled={saving}>
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <Card key={tier.id} className={`p-6 ${tier.id === currentTier ? "border-primary" : ""}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  {tier.id === currentTier && <Badge>Current</Badge>}
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold">{formatPrice(tier.priceInCents)}</span>
                  {tier.priceInCents > 0 && <span className="text-muted-foreground">/month</span>}
                </div>

                <p className="mb-4 text-sm text-muted-foreground">{tier.description}</p>

                <ul className="mb-6 space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {tier.limits.whaleAlerts === -1 ? "Unlimited" : tier.limits.whaleAlerts} whale alerts/day
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {tier.limits.chains.length} blockchain{tier.limits.chains.length > 1 ? "s" : ""}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {tier.limits.aiAnalysis ? "AI Analysis" : "No AI Analysis"}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {tier.limits.customAlerts ? "Custom Alerts" : "Basic Alerts"}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {tier.limits.apiAccess ? "API Access" : "No API Access"}
                  </li>
                </ul>

                {tier.id !== currentTier && (
                  <Button asChild className="w-full" variant={tier.id === "pro" ? "default" : "outline"}>
                    <a href={`/pricing/checkout?tier=${tier.id}`}>
                      {tier.priceInCents === 0 ? "Downgrade" : "Upgrade"}
                    </a>
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Billing Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <p className="text-sm text-muted-foreground">{currentPlan?.name}</p>
                </div>
                <p className="text-xl font-bold">{formatPrice(currentPlan?.priceInCents || 0)}</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-2 font-medium">Next Billing Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-2 font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground">•••• •••• •••• 4242</p>
                <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                  Update Payment Method
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Billing History</h3>
            <div className="space-y-2">
              {[
                { date: "2025-09-01", amount: currentPlan?.priceInCents || 0, status: "Paid" },
                { date: "2025-08-01", amount: currentPlan?.priceInCents || 0, status: "Paid" },
                { date: "2025-07-01", amount: currentPlan?.priceInCents || 0, status: "Paid" },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{new Date(invoice.date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">{currentPlan?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(invoice.amount)}</p>
                    <Badge variant="secondary" className="text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {currentTier !== "free" && (
            <Card className="border-destructive/50 p-6">
              <h3 className="mb-2 text-lg font-semibold">Cancel Subscription</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Your subscription will remain active until the end of the current billing period.
              </p>
              <Button variant="destructive">Cancel Subscription</Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, RefreshCw, CheckCircle } from "lucide-react"

interface AutomationStatus {
  success: boolean
  status: {
    daysSinceHalving: number
    lastUpdated: string
    nextUpdate: string
    updateFrequency: string
    cyclePhase: string
  }
  automation: {
    enabled: boolean
    description: string
    features: string[]
  }
}

export function WeeklyAutomationStatus() {
  const [status, setStatus] = useState<AutomationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastManualUpdate, setLastManualUpdate] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/weekly-update")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Failed to fetch automation status:", error)
    }
  }

  const triggerManualUpdate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/weekly-update", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setLastManualUpdate(new Date().toISOString())
        await fetchStatus() // Refresh status
      }
    } catch (error) {
      console.error("Manual update failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  if (!status) return null

  return (
    <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-indigo-400">Weekly Automation Status</CardTitle>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-slate-400">Cycle Phase</div>
            <div className="text-white font-medium">{status.status.cyclePhase}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-slate-400">Days Since Halving</div>
            <div className="text-white font-medium">{status.status.daysSinceHalving} days</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-slate-400">Next Auto Update</div>
            <div className="text-white font-medium">{new Date(status.status.nextUpdate).toLocaleDateString()}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-slate-400">Update Frequency</div>
            <div className="text-white font-medium">{status.status.updateFrequency}</div>
          </div>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-lg">
          <h4 className="text-indigo-400 font-medium mb-2">Automated Features</h4>
          <ul className="space-y-1">
            {status.automation.features.map((feature, index) => (
              <li key={index} className="text-xs text-slate-300 flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <div className="text-xs text-slate-400">
            Last updated: {new Date(status.status.lastUpdated).toLocaleString()}
            {lastManualUpdate && (
              <span className="text-green-400 ml-2">
                (Manual update: {new Date(lastManualUpdate).toLocaleTimeString()})
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={triggerManualUpdate}
            disabled={isLoading}
            className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 bg-transparent"
          >
            {isLoading ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            Manual Update
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

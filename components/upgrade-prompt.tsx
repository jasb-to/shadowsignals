"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lock, Sparkles } from "lucide-react"
import Link from "next/link"
import type { SubscriptionTier } from "@/lib/subscription-context"

interface UpgradePromptProps {
  requiredTier: SubscriptionTier
  feature: string
}

const tierNames: Record<SubscriptionTier, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  institutional: "Institutional",
}

const tierPrices: Record<SubscriptionTier, string> = {
  free: "£0",
  basic: "£23",
  pro: "£79",
  institutional: "£399",
}

export function UpgradePrompt({ requiredTier, feature }: UpgradePromptProps) {
  return (
    <Card className="p-8 text-center bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <div className="flex justify-center mb-4">
        <div className="p-4 rounded-full bg-purple-500/20">
          <Lock className="w-8 h-8 text-purple-400" />
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-2 text-white">Upgrade to {tierNames[requiredTier]}</h3>

      <p className="text-gray-400 mb-6">
        {feature} is available on the {tierNames[requiredTier]} plan and above
      </p>

      <div className="flex items-center justify-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-cyan-400" />
        <span className="text-3xl font-bold text-cyan-400">{tierPrices[requiredTier]}/month</span>
      </div>

      <Link href="/pricing">
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          View Pricing Plans
        </Button>
      </Link>
    </Card>
  )
}

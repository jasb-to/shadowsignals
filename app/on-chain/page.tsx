"use client"

import { OnChainDashboard } from "@/components/on-chain-dashboard"
import { useSubscription } from "@/lib/subscription-context"
import { UpgradePrompt } from "@/components/upgrade-prompt"

export default function OnChainPage() {
  const { tier, hasAccess } = useSubscription()

  // Free tier gets limited access (5 transactions/day), not blocked entirely
  if (!hasAccess("free")) {
    return (
      <div className="container mx-auto py-8 px-4">
        <UpgradePrompt requiredTier="free" feature="On-Chain Analyst with whale tracking and smart money monitoring" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <OnChainDashboard subscriptionTier={tier} />
    </div>
  )
}

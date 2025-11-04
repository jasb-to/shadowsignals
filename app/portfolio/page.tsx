"use client"

import { PortfolioAnalyst } from "@/components/portfolio-analyst"
import { useSubscription } from "@/lib/subscription-context"
import { UpgradePrompt } from "@/components/upgrade-prompt"

export default function PortfolioPage() {
  const { hasAccess } = useSubscription()

  if (!hasAccess("pro")) {
    return (
      <div className="container mx-auto py-8 px-4">
        <UpgradePrompt
          requiredTier="pro"
          feature="Portfolio AI Analyst with personalized insights and recommendations"
        />
      </div>
    )
  }

  return <PortfolioAnalyst />
}

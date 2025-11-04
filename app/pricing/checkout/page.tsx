import { Suspense } from "react"
import { redirect } from "next/navigation"
import SubscriptionCheckout from "@/components/subscription-checkout"
import { getTierById } from "@/lib/subscription-tiers"

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: { tier?: string }
}) {
  const tierId = searchParams.tier

  if (!tierId) {
    redirect("/pricing")
  }

  const tier = getTierById(tierId)

  if (!tier || tier.id === "free") {
    redirect("/pricing")
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscribe to {tier.name}</h1>
          <p className="text-muted-foreground">{tier.description}</p>
        </div>

        <Suspense fallback={<div className="text-center">Loading checkout...</div>}>
          <SubscriptionCheckout tierId={tierId} />
        </Suspense>
      </div>
    </div>
  )
}

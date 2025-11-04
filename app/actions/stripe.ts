"use server"

import { stripe } from "@/lib/stripe"
import { SUBSCRIPTION_TIERS, STRIPE_PRICE_IDS } from "@/lib/subscription-tiers"

export async function startCheckoutSession(tierId: string) {
  const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId)

  if (!tier) {
    throw new Error(`Subscription tier with id "${tierId}" not found`)
  }

  if (tier.priceInCents === 0) {
    throw new Error("Cannot create checkout session for free tier")
  }

  const priceId = STRIPE_PRICE_IDS[tierId as keyof typeof STRIPE_PRICE_IDS]

  if (!priceId) {
    throw new Error(`No Stripe price ID configured for tier "${tierId}"`)
  }

  // Create Checkout Session for subscription
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price: priceId, // Use the real Stripe price ID
        quantity: 1,
      },
    ],
    mode: "subscription",
    metadata: {
      tier: tierId, // Store tier ID in metadata for webhook processing
    },
  })

  return session.client_secret
}

export async function getSubscriptionStatus(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return { tier: "free", status: "inactive" }
    }

    const subscription = subscriptions.data[0]
    // Extract tier from subscription metadata or product name
    return {
      tier: subscription.metadata.tier || "free",
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
    }
  } catch (error) {
    console.error("[v0] Error fetching subscription status:", error)
    return { tier: "free", status: "error" }
  }
}

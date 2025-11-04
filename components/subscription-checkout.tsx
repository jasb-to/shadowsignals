"use client"

import { useCallback } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

import { startCheckoutSession } from "@/app/actions/stripe"

// The environment variable is available as STRIPE_PUBLISHABLE_KEY from the Stripe integration
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY!)

export default function SubscriptionCheckout({ tierId }: { tierId: string }) {
  const startCheckoutSessionForTier = useCallback(() => startCheckoutSession(tierId), [tierId])

  return (
    <div id="checkout" className="w-full max-w-2xl mx-auto">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret: startCheckoutSessionForTier }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

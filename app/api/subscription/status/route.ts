import { NextResponse } from "next/server"
import { subscriptions } from "../../webhooks/stripe/route"

export async function GET() {
  try {
    // For now, return the first subscription or free tier
    const userSubscriptions = Array.from(subscriptions.values())

    if (userSubscriptions.length > 0) {
      const activeSubscription = userSubscriptions.find((sub) => sub.status === "active")
      if (activeSubscription) {
        return NextResponse.json({
          tier: activeSubscription.tier,
          status: activeSubscription.status,
          customerId: activeSubscription.customerId,
        })
      }
    }

    // Default to free tier
    return NextResponse.json({
      tier: "free",
      status: "active",
    })
  } catch (error) {
    console.error("[v0] Error fetching subscription status:", error)
    return NextResponse.json({ error: "Failed to fetch subscription status" }, { status: 500 })
  }
}

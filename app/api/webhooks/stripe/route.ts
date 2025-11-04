import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

// Webhook signature verification
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const subscriptions = new Map<
  string,
  {
    customerId: string
    subscriptionId: string
    tier: "free" | "basic" | "pro" | "institutional"
    status: string
    priceId: string
    currentPeriodEnd?: Date
  }
>()

function getTierFromPriceId(priceId: string): "free" | "basic" | "pro" | "institutional" {
  // Match against the real Stripe price IDs
  if (priceId === "price_1SJx50GgZuViyFjDZq26qaJ2") return "basic"
  if (priceId === "price_1SJx5PGgZuViyFjDn6VbmliU") return "pro"
  if (priceId === "price_1SJx5sGgZuViyFjDTROl5Cp4") return "institutional"
  return "free"
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`[v0] Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log(`[v0] Stripe webhook received: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[v0] Checkout completed for customer: ${session.customer}`)

        const priceId = session.line_items?.data[0]?.price?.id || ""
        const tier = getTierFromPriceId(priceId)

        subscriptions.set(session.customer as string, {
          customerId: session.customer as string,
          subscriptionId: session.subscription as string,
          tier,
          status: "active",
          priceId,
        })

        console.log(`[v0] Subscription stored:`, {
          customerId: session.customer,
          subscriptionId: session.subscription,
          tier,
          priceId,
        })
        break
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[v0] Subscription created: ${subscription.id}`)

        const priceId = subscription.items.data[0]?.price.id || ""
        const tier = getTierFromPriceId(priceId)

        subscriptions.set(subscription.customer as string, {
          customerId: subscription.customer as string,
          subscriptionId: subscription.id,
          tier,
          status: subscription.status,
          priceId,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        })

        console.log(`[v0] Subscription stored:`, {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          tier,
          status: subscription.status,
        })
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[v0] Subscription updated: ${subscription.id}`)

        const priceId = subscription.items.data[0]?.price.id || ""
        const tier = getTierFromPriceId(priceId)

        subscriptions.set(subscription.customer as string, {
          customerId: subscription.customer as string,
          subscriptionId: subscription.id,
          tier,
          status: subscription.status,
          priceId,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        })

        console.log(`[v0] Subscription updated:`, {
          subscriptionId: subscription.id,
          tier,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[v0] Subscription cancelled: ${subscription.id}`)

        subscriptions.delete(subscription.customer as string)

        console.log(`[v0] Subscription removed:`, {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        })
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[v0] Payment succeeded for invoice: ${invoice.id}`)

        console.log(`[v0] Payment details:`, {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId: invoice.subscription,
          amountPaid: invoice.amount_paid / 100,
          currency: invoice.currency,
        })
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[v0] Payment failed for invoice: ${invoice.id}`)

        const existingSub = Array.from(subscriptions.values()).find(
          (sub) => sub.subscriptionId === invoice.subscription,
        )
        if (existingSub) {
          subscriptions.set(existingSub.customerId, {
            ...existingSub,
            status: "past_due",
          })
        }

        console.log(`[v0] Failed payment details:`, {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId: invoice.subscription,
          attemptCount: invoice.attempt_count,
        })
        break
      }

      default:
        console.log(`[v0] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`[v0] Webhook error: ${error.message}`)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

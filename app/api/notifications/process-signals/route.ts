import { NextResponse } from "next/server"
import type { OnChainSignal } from "@/lib/on-chain-types"
import {
  getNotificationPreferences,
  shouldSendNotification,
  createNotificationFromSignal,
  sendNotification,
} from "@/lib/notification-manager"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { signals, userId = "demo_user" } = body

    if (!Array.isArray(signals)) {
      return NextResponse.json({ error: "Invalid signals data" }, { status: 400 })
    }

    console.log(`[v0] Processing ${signals.length} signals for notifications`)

    const preferences = getNotificationPreferences(userId)
    const sentNotifications: string[] = []

    for (const signal of signals as OnChainSignal[]) {
      if (shouldSendNotification(signal, preferences)) {
        const notification = createNotificationFromSignal(signal, userId)
        await sendNotification(notification, preferences)
        sentNotifications.push(notification.id)
      }
    }

    console.log(`[v0] Sent ${sentNotifications.length} notifications`)

    return NextResponse.json({
      success: true,
      notificationsSent: sentNotifications.length,
      notificationIds: sentNotifications,
    })
  } catch (error) {
    console.error("[v0] Error processing signals for notifications:", error)
    return NextResponse.json({ error: "Failed to process signals" }, { status: 500 })
  }
}

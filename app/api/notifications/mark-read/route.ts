import { NextResponse } from "next/server"
import { markAsRead, markAllAsRead } from "@/lib/notification-manager"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = "demo_user", notificationId, markAll = false } = body

    if (markAll) {
      markAllAsRead(userId)
      console.log(`[v0] Marked all notifications as read for user ${userId}`)
    } else if (notificationId) {
      markAsRead(userId, notificationId)
      console.log(`[v0] Marked notification ${notificationId} as read`)
    } else {
      return NextResponse.json({ error: "Missing notificationId or markAll flag" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error marking notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 })
  }
}

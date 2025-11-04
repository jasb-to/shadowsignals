import { NextResponse } from "next/server"
import { getUserNotifications, getUnreadCount } from "@/lib/notification-manager"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "demo_user"
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const notifications = getUserNotifications(userId, limit)
    const unreadCount = getUnreadCount(userId)

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

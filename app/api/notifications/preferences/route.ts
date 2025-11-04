import { NextResponse } from "next/server"
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/notification-manager"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "demo_user"

    const preferences = getNotificationPreferences(userId)

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("[v0] Error fetching notification preferences:", error)
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = "demo_user", ...preferences } = body

    updateNotificationPreferences(userId, preferences)

    console.log(`[v0] Updated notification preferences for user ${userId}`)

    return NextResponse.json({ success: true, preferences: getNotificationPreferences(userId) })
  } catch (error) {
    console.error("[v0] Error updating notification preferences:", error)
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
  }
}

import type { OnChainSignal } from "./on-chain-types"
import type { Notification, NotificationPreferences } from "./notification-types"

// In-memory notification store (in production, use a database)
const notificationStore = new Map<string, Notification[]>()
const preferencesStore = new Map<string, NotificationPreferences>()

export function getNotificationPreferences(userId: string): NotificationPreferences {
  return (
    preferencesStore.get(userId) || {
      userId,
      emailEnabled: false,
      inAppEnabled: true,
      webhookEnabled: false,
      minTransactionValue: 100000,
      alertTypes: {
        whaleBuy: true,
        whaleSell: true,
        smartMoneyAccumulation: true,
        largeTransfer: true,
        unusualVolume: true,
      },
      tokens: [],
    }
  )
}

export function updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
  const current = getNotificationPreferences(userId)
  preferencesStore.set(userId, { ...current, ...preferences })
}

export function createNotificationFromSignal(signal: OnChainSignal, userId: string): Notification {
  const notification: Notification = {
    id: `notif_${signal.id}_${Date.now()}`,
    userId,
    type: signal.type,
    severity: signal.severity,
    title: getNotificationTitle(signal),
    message: signal.description,
    token: signal.token,
    transactionHash: signal.transaction.hash,
    valueUSD: signal.transaction.valueUSD,
    timestamp: signal.timestamp,
    read: false,
    sentVia: ["in_app"],
  }

  return notification
}

function getNotificationTitle(signal: OnChainSignal): string {
  switch (signal.type) {
    case "whale_buy":
      return `🐋 Whale Buy Alert: ${signal.token.symbol}`
    case "whale_sell":
      return `🐋 Whale Sell Alert: ${signal.token.symbol}`
    case "smart_money_accumulation":
      return `💰 Smart Money Accumulation: ${signal.token.symbol}`
    case "large_transfer":
      return `📊 Large Transfer Detected: ${signal.token.symbol}`
    case "unusual_volume":
      return `📈 Unusual Volume: ${signal.token.symbol}`
    default:
      return `Alert: ${signal.token.symbol}`
  }
}

export function shouldSendNotification(signal: OnChainSignal, preferences: NotificationPreferences): boolean {
  // Check minimum transaction value
  if (signal.transaction.valueUSD < preferences.minTransactionValue) {
    return false
  }

  // Check if alert type is enabled
  const typeMap: Record<string, keyof NotificationPreferences["alertTypes"]> = {
    whale_buy: "whaleBuy",
    whale_sell: "whaleSell",
    smart_money_accumulation: "smartMoneyAccumulation",
    large_transfer: "largeTransfer",
    unusual_volume: "unusualVolume",
  }

  const alertTypeKey = typeMap[signal.type]
  if (alertTypeKey && !preferences.alertTypes[alertTypeKey]) {
    return false
  }

  // Check if token is in watch list (empty = all tokens)
  if (preferences.tokens.length > 0 && !preferences.tokens.includes(signal.token.symbol)) {
    return false
  }

  return true
}

export async function sendNotification(
  notification: Notification,
  preferences: NotificationPreferences,
): Promise<void> {
  const sentVia: ("email" | "webhook" | "in_app")[] = ["in_app"]

  // Send email notification
  if (preferences.emailEnabled && preferences.email) {
    try {
      await sendEmailNotification(notification, preferences.email)
      sentVia.push("email")
      console.log(`[v0] Email notification sent to ${preferences.email}`)
    } catch (error) {
      console.error("[v0] Failed to send email notification:", error)
    }
  }

  // Send webhook notification
  if (preferences.webhookEnabled && preferences.webhookUrl) {
    try {
      await sendWebhookNotification(notification, preferences.webhookUrl)
      sentVia.push("webhook")
      console.log(`[v0] Webhook notification sent to ${preferences.webhookUrl}`)
    } catch (error) {
      console.error("[v0] Failed to send webhook notification:", error)
    }
  }

  // Store notification
  notification.sentVia = sentVia
  const userNotifications = notificationStore.get(notification.userId) || []
  userNotifications.unshift(notification)
  notificationStore.set(notification.userId, userNotifications.slice(0, 100)) // Keep last 100
}

async function sendEmailNotification(notification: Notification, email: string): Promise<void> {
  // In production, integrate with email service (SendGrid, Resend, etc.)
  console.log(`[v0] Would send email to ${email}:`, notification.title)

  // Example: Using fetch to call an email API
  // await fetch('/api/send-email', {
  //   method: 'POST',
  //   body: JSON.stringify({ to: email, subject: notification.title, body: notification.message })
  // })
}

async function sendWebhookNotification(notification: Notification, webhookUrl: string): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "whale_alert",
        notification: {
          title: notification.title,
          message: notification.message,
          token: notification.token.symbol,
          value: notification.valueUSD,
          transaction: notification.transactionHash,
          severity: notification.severity,
          timestamp: notification.timestamp,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`)
    }
  } catch (error) {
    console.error("[v0] Webhook notification failed:", error)
    throw error
  }
}

export function getUserNotifications(userId: string, limit = 50): Notification[] {
  const notifications = notificationStore.get(userId) || []
  return notifications.slice(0, limit)
}

export function getUnreadCount(userId: string): number {
  const notifications = notificationStore.get(userId) || []
  return notifications.filter((n) => !n.read).length
}

export function markAsRead(userId: string, notificationId: string): void {
  const notifications = notificationStore.get(userId) || []
  const notification = notifications.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

export function markAllAsRead(userId: string): void {
  const notifications = notificationStore.get(userId) || []
  notifications.forEach((n) => {
    n.read = true
  })
}

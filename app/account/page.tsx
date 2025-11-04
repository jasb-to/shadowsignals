import { SubscriptionManager } from "@/components/subscription-manager"

export default function AccountPage() {
  // In production, get subscription tier from user session/database
  const currentTier = "free" // or "basic", "pro", "institutional"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-gray-400 text-lg">Manage your subscription and notification preferences</p>
        </div>

        <SubscriptionManager currentTier={currentTier} />
      </div>
    </div>
  )
}

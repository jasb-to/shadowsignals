"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Activity, User, TrendingUp, Wallet, Lock } from "lucide-react"
import { useSubscription } from "@/lib/subscription-context"

export function SidebarNav() {
  const pathname = usePathname()
  const { hasAccess, tier, isDevMode, toggleDevMode } = useSubscription()

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      requiredTier: "free" as const,
    },
    {
      name: "On-Chain Analyst",
      href: "/on-chain",
      icon: Activity,
      requiredTier: "free" as const,
    },
    {
      name: "Portfolio",
      href: "/portfolio",
      icon: Wallet,
      requiredTier: "pro" as const,
    },
    {
      name: "Pricing",
      href: "/pricing",
      icon: TrendingUp,
      requiredTier: "free" as const,
    },
    {
      name: "Account",
      href: "/account",
      icon: User,
      requiredTier: "free" as const,
    },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900/95 border-r border-gray-800 backdrop-blur-sm z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Shadow Signals
          </h1>
          <p className="text-xs text-gray-400 mt-1">AI-Powered Trading Analysis</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const hasFeatureAccess = hasAccess(item.requiredTier)

            return (
              <Link
                key={item.href}
                href={hasFeatureAccess ? item.href : "/pricing"}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : hasFeatureAccess
                      ? "text-gray-400 hover:text-white hover:bg-gray-800/50"
                      : "text-gray-600 hover:text-gray-500 cursor-not-allowed"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {!hasFeatureAccess && <Lock className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          {isDevMode && (
            <button
              onClick={toggleDevMode}
              className="w-full mb-3 px-3 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-colors"
            >
              <p className="text-xs text-green-400">🔧 Developer Mode</p>
              <p className="text-xs text-gray-400 mt-1">Click to disable</p>
            </button>
          )}

          <div className="mb-3 px-3 py-2 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30">
            <p className="text-xs text-gray-400">Current Plan</p>
            <p className="text-sm font-semibold text-white capitalize">{tier}</p>
          </div>
          <div className="text-xs text-gray-500 text-center">
            <p>© 2025 Shadow Signals</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

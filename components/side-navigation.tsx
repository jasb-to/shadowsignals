"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Activity, CreditCard, User } from "lucide-react"

export function SideNavigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/on-chain", label: "On-Chain Analyst", icon: Activity },
    { href: "/pricing", label: "Pricing", icon: CreditCard },
    { href: "/account", label: "Account", icon: User },
  ]

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-gray-900/95 border-r border-gray-800 p-6 z-40">
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Shadow Signals
        </h2>
      </div>

      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"

interface ClientLayoutProps {
  children: React.ReactNode
  className: string
}

const Analytics = () => {
  try {
    // Only load analytics in production environment
    if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      const { Analytics } = require("@vercel/analytics/react")
      return <Analytics />
    }
  } catch (error) {
    // Silently fail if analytics package is not available
    console.log("[v0] Analytics not available in preview environment")
  }
  return null
}

export default function ClientLayout({ children, className }: ClientLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={className}>
      <body className="dark">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

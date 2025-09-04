"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/react"

interface ClientLayoutProps {
  children: React.ReactNode
  className: string
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

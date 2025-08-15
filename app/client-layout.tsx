"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"

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
        </ThemeProvider>
      </body>
    </html>
  )
}

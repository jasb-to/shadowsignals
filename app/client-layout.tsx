"use client"

import type React from "react"
import Script from "next/script"
import { ThemeProvider } from "@/components/theme-provider"

interface ClientLayoutProps {
  children: React.ReactNode
  spaceGrotesk: any
  dmSans: any
}

export default function ClientLayout({ children, spaceGrotesk, dmSans }: ClientLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9833828370676451"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <body className="dark">
        <style jsx global>{`
          html {
            font-family: ${dmSans.style.fontFamily};
            --font-space-grotesk: ${spaceGrotesk.style.fontFamily};
            --font-dm-sans: ${dmSans.style.fontFamily};
          }
        `}</style>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

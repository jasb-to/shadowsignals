import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Shadow Signals - Crypto Trading Analysis",
  description: "AI-powered cryptocurrency trading signals and confluence analysis platform",
  generator: "Shadow Signals",
  icons: {
    icon: [
      {
        url: "/placeholder.svg?height=32&width=32",
        sizes: "32x32",
        type: "image/svg+xml",
      },
      {
        url: "/placeholder.svg?height=16&width=16",
        sizes: "16x16",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/placeholder.svg?height=32&width=32",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9833828370676451"
          crossOrigin="anonymous"
        />
        <style>{`
html {
  font-family: ${dmSans.style.fontFamily};
  --font-space-grotesk: ${spaceGrotesk.style.fontFamily};
  --font-dm-sans: ${dmSans.style.fontFamily};
}
        `}</style>
      </head>
      <body className="dark">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

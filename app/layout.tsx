import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

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
    <ClientLayout spaceGrotesk={spaceGrotesk} dmSans={dmSans}>
      {children}
    </ClientLayout>
  )
}

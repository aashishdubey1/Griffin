import type React from "react"
import type { Metadata } from "next"
import { Inter, Instrument_Serif } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ChatProvider } from "@/lib/chat-context"
import { ThemeProvider } from "@/lib/theme-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: ["400"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Griffin - Intelligent Code Review Assistant",
  description:
    "Get deeply contextual, actionable feedback on every line of code you write. Griffin leverages AI and static analysis to deliver comprehensive code intelligence.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400&display=swap" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ChatProvider>{children}</ChatProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

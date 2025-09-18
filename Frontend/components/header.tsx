"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme")
      setIsDarkMode(savedTheme === "dark")
    } catch (error) {
      console.error("Failed to access localStorage:", error)
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])

  return (
    <header
      className={`w-full ${isDarkMode ? "border-b border-[rgba(255,255,255,0.06)] bg-[#1a1a1a]" : "border-b border-[#37322f]/6 bg-[#f7f5f3]"} transition-colors duration-500`}
      role="banner"
    >
      <div className="max-w-[1060px] mx-auto px-4">
        <nav className="flex items-center justify-between py-4" role="navigation" aria-label="Main navigation">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className={`${isDarkMode ? "text-[#e5e5e5] hover:text-[#f5f5f5] focus:ring-[#e5e5e5]" : "text-[#37322f] hover:text-[#37322f]/80 focus:ring-[#37322f]"} font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-sm`}
              aria-label="Brillance - Go to homepage"
            >
              Brillance
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/products"
                className={`${isDarkMode ? "text-[#e5e5e5] hover:text-[#f5f5f5] focus:ring-[#e5e5e5]" : "text-[#37322f] hover:text-[#37322f]/80 focus:ring-[#37322f]"} text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-sm px-2 py-1`}
              >
                Products
              </Link>
              <Link
                href="/pricing"
                className={`${isDarkMode ? "text-[#e5e5e5] hover:text-[#f5f5f5] focus:ring-[#e5e5e5]" : "text-[#37322f] hover:text-[#37322f]/80 focus:ring-[#37322f]"} text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-sm px-2 py-1`}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className={`${isDarkMode ? "text-[#e5e5e5] hover:text-[#f5f5f5] focus:ring-[#e5e5e5]" : "text-[#37322f] hover:text-[#37322f]/80 focus:ring-[#37322f]"} text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-sm px-2 py-1`}
              >
                Docs
              </Link>
            </div>
          </div>
          <Link href="/login">
            <Button
              variant="ghost"
              className={`${isDarkMode ? "text-[#e5e5e5] hover:bg-[rgba(255,255,255,0.08)] focus:ring-[#e5e5e5]" : "text-[#37322f] hover:bg-[#37322f]/5 focus:ring-[#37322f]"} transition-all duration-200 focus:ring-2 focus:ring-offset-2`}
              aria-label="Log in to your account"
            >
              Log in
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

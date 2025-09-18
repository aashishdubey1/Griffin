"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark")
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        setIsDarkMode(prefersDark)
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error)
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light")
      document.documentElement.classList.toggle("dark", isDarkMode)
    } catch (error) {
      console.error("Failed to save theme to localStorage:", error)
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev)
  }

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

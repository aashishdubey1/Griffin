"use client"

import React, { useState, useEffect, useMemo } from "react"

interface PatternOverlayProps {
  count?: number
}

export const PatternOverlay = React.memo(function PatternOverlay({ count = 25 }: PatternOverlayProps) {
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

  const patternItems = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] ${isDarkMode ? "outline-[rgba(255,255,255,0.15)]" : "outline-[rgba(3,7,18,0.08)]"} outline-offset-[-0.25px] transition-colors duration-500`}
        />
      )),
    [count, isDarkMode],
  )

  return (
    <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
      {patternItems}
    </div>
  )
})

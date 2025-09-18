"use client"

import React, { useState, useEffect } from "react"
import type { ReactNode } from "react"

interface BadgeProps {
  icon: ReactNode
  text: string
}

export const Badge = React.memo(function Badge({ icon, text }: BadgeProps) {
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
    <div
      className={`px-[14px] py-[6px] ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_0px_0px_4px_rgba(255,255,255,0.05)]" : "shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)]"} overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] ${isDarkMode ? "border border-[rgba(255,255,255,0.08)]" : "border border-[rgba(2,6,23,0.08)]"} shadow-xs transition-all duration-300 ${isDarkMode ? "hover:shadow-[0px_0px_0px_4px_rgba(255,255,255,0.08)]" : "hover:shadow-[0px_0px_0px_4px_rgba(55,50,47,0.08)]"} hover:scale-105 ${isDarkMode ? "hover:bg-[#3a3a3a]" : "hover:bg-gray-50"} cursor-default`}
    >
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <div
        className={`text-center flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-xs font-medium leading-3 font-sans transition-colors duration-200`}
      >
        {text}
      </div>
    </div>
  )
})

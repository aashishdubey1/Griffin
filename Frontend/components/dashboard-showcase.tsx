"use client"

import React, { useState, useEffect } from "react"

interface DashboardShowcaseProps {
  activeCard: number
  progress: number
}

export const DashboardShowcase = React.memo(function DashboardShowcase({
  activeCard,
  progress,
}: DashboardShowcaseProps) {
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
    <div className="w-full max-w-[960px] lg:w-[960px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-8 sm:my-12 md:my-16 lg:my-16 mb-0 lg:pb-0">
      <div
        className={`w-full max-w-[960px] lg:w-[960px] h-[200px] sm:h-[280px] md:h-[450px] lg:h-[695.55px] ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_0px_0px_0.9056603908538818px_rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.1)]" : "shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)]"} overflow-hidden rounded-[6px] sm:rounded-[8px] lg:rounded-[9.06px] flex flex-col justify-start items-start transition-all duration-500 ${isDarkMode ? "hover:shadow-[0px_8px_32px_rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.2)]" : "hover:shadow-[0px_8px_32px_rgba(0,0,0,0.12)]"} hover:scale-[1.02] group`}
      >
        <div className="self-stretch flex-1 flex justify-start items-start">
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full overflow-hidden">
              <div
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  activeCard === 0 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"
                }`}
              >
                <img
                  src="/griffin-hero-image.jpg"
                  alt="Griffin code review interface showing security analysis"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  activeCard === 1 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"
                }`}
              >
                <img
                  src="/griffin-hero-image.jpg"
                  alt="Griffin code quality review dashboard"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  activeCard === 2 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"
                }`}
              >
                <img
                  src="/griffin-hero-image.jpg"
                  alt="Griffin performance optimization dashboard"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

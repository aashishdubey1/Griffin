"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import type React from "react"

// Badge component for consistency
function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
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
      className={`px-[14px] py-[6px] ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_0px_0px_4px_rgba(255,255,255,0.05)]" : "shadow-[0px_2px_8px_rgba(0,0,0,0.12)]"} overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] ${isDarkMode ? "border border-[rgba(255,255,255,0.08)]" : "border border-[rgba(0,0,0,0.15)]"} shadow-xs transition-all duration-300`}
    >
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center transition-transform duration-200">
        {icon}
      </div>
      <div
        className={`text-center flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#1a1a1a]"} text-xs font-semibold leading-3 font-sans transition-colors duration-200`}
      >
        {text}
      </div>
    </div>
  )
}

export default function DocumentationSection() {
  const [activeCard, setActiveCard] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme")
      setIsDarkMode(savedTheme === "dark")
    } catch (error) {
      console.error("Failed to access localStorage:", error)
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])

  const cards = useMemo(
    () => [
      {
        title: "Security Analysis",
        description: "Detect vulnerabilities and security risks\nwith AI-powered static analysis.",
        image: "/griffin-hero-image.jpg",
      },
      {
        title: "Code Quality Review",
        description: "Get best practices suggestions\nand maintainability improvements.",
        image: "/griffin-hero-image.jpg",
      },
      {
        title: "Performance Optimization",
        description: "Receive refactoring recommendations\nfor better performance and readability.",
        image: "/griffin-hero-image.jpg",
      },
    ],
    [],
  )

  useEffect(() => {
    if (!mountedRef.current) return

    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return
      setActiveCard((prev) => (prev + 1) % cards.length)
      setAnimationKey((prev) => prev + 1)
    }, 10000)

    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [cards.length])

  const handleCardClick = useCallback((index: number) => {
    if (!mountedRef.current) return
    setActiveCard(index)
    setAnimationKey((prev) => prev + 1)
  }, [])

  return (
    <div
      className={`w-full ${isDarkMode ? "border-b border-[rgba(255,255,255,0.12)]" : "border-b border-[rgba(0,0,0,0.15)]"} flex flex-col justify-center items-center transition-colors duration-500`}
    >
      {/* Header Section */}
      <div
        className={`self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 ${isDarkMode ? "border-b border-[rgba(255,255,255,0.12)]" : "border-b border-[rgba(0,0,0,0.15)]"} flex justify-center items-center gap-6 transition-colors duration-500`}
      >
        <div
          className={`w-full max-w-[586px] px-4 sm:px-6 py-4 sm:py-5 ${isDarkMode ? "bg-[#2a2a2a] shadow-[0px_2px_4px_rgba(255,255,255,0.08)]" : "bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.12)] border border-[rgba(0,0,0,0.08)]"} overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 transition-all duration-500`}
        >
          <Badge
            icon={
              <div
                className={`w-[10.50px] h-[10.50px] outline outline-[1.17px] ${isDarkMode ? "outline-[#e5e5e5]" : "outline-[#1a1a1a]"} outline-offset-[-0.58px] rounded-full transition-colors duration-200`}
              ></div>
            }
            text="Platform Features"
          />
          <div
            className={`self-stretch text-center flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#1a1a1a]"} text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight transition-colors duration-500`}
          >
            Comprehensive Code Intelligence
          </div>
          <div
            className={`self-stretch text-center ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#4a4a4a]"} text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans transition-colors duration-500`}
          >
            Analyze code quality, detect security vulnerabilities, and get actionable insights
            <br className="hidden sm:block" />
            all powered by advanced AI and static analysis tools.
          </div>
        </div>
      </div>
      {/* Content Section */}
      <div
        className={`self-stretch px-4 md:px-9 overflow-hidden flex justify-start items-center ${isDarkMode ? "bg-[#1a1a1a]" : "bg-[#f8f6f4]"} transition-colors duration-500`}
      >
        <div className="flex-1 py-8 md:py-11 flex flex-col md:flex-row justify-start items-center gap-6 md:gap-12">
          {/* Left Column - Feature Cards */}
          <div className="w-full md:w-auto md:max-w-[400px] flex flex-col justify-center items-center gap-4 order-2 md:order-1">
            {cards.map((card, index) => {
              const isActive = index === activeCard

              return (
                <div
                  key={index}
                  onClick={() => handleCardClick(index)}
                  className={`w-full overflow-hidden flex flex-col justify-start items-start transition-all duration-500 cursor-pointer rounded-lg transform-gpu ${
                    isActive
                      ? `${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_0px_0px_0.75px_rgba(255,255,255,0.1)]" : "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.12)_inset]"} ${isDarkMode ? "shadow-[0px_4px_20px_rgba(255,255,255,0.12)]" : "shadow-[0px_6px_24px_rgba(0,0,0,0.15)]"} opacity-100 scale-100`
                      : `${isDarkMode ? "border border-[rgba(255,255,255,0.15)]" : "border border-[rgba(0,0,0,0.12)] bg-white/60"} ${isDarkMode ? "hover:bg-[rgba(255,255,255,0.08)]" : "hover:bg-white hover:shadow-[0px_2px_12px_rgba(0,0,0,0.08)]"} opacity-80 scale-95`
                  } hover:scale-[1.02] hover:opacity-100`}
                >
                  <div
                    className={`w-full h-0.5 ${isDarkMode ? "bg-[rgba(255,255,255,0.08)]" : "bg-[rgba(0,0,0,0.08)]"} overflow-hidden ${isActive ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
                  >
                    <div
                      key={animationKey}
                      className={`h-0.5 ${isDarkMode ? "bg-gradient-to-r from-[#e5e5e5] to-[#f5f5f5]" : "bg-gradient-to-r from-[#1a1a1a] to-[#333333]"} animate-[progressBar_10s_linear_forwards] will-change-transform`}
                    />
                  </div>
                  <div className="px-6 py-5 w-full flex flex-col gap-2">
                    <div
                      className={`self-stretch flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#1a1a1a]"} text-sm font-semibold leading-6 font-sans transition-all duration-500 ${isActive ? "opacity-100 transform translate-y-0" : "opacity-75 transform translate-y-1"}`}
                    >
                      {card.title}
                    </div>
                    <div
                      className={`self-stretch ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#4a4a4a]"} text-[13px] font-normal leading-[22px] font-sans whitespace-pre-line transition-all duration-500 ${isActive ? "opacity-100 transform translate-y-0" : "opacity-70 transform translate-y-1"}`}
                    >
                      {card.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column - Image */}
          <div className="w-full md:w-auto rounded-lg flex flex-col justify-center items-center gap-2 order-1 md:order-2 md:px-0 px-0">
            <div
              className={`w-full md:w-[580px] h-[250px] md:h-[420px] ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_0px_0px_0.9056603908538818px_rgba(255,255,255,0.15)]" : "shadow-[0px_4px_20px_rgba(0,0,0,0.12)] border border-[rgba(0,0,0,0.08)]"} overflow-hidden rounded-lg flex flex-col justify-start items-start transition-all duration-700 hover:scale-[1.02] group transform-gpu`}
            >
              <div className="w-full h-full flex items-center justify-center relative">
                <div
                  key={`image-${activeCard}-${animationKey}`}
                  className="w-full h-full absolute inset-0 animate-[fadeInScale_700ms_ease-out_forwards] opacity-0"
                >
                  <img
                    src={cards[activeCard].image || "/placeholder.svg"}
                    alt={`${cards[activeCard].title} interface preview`}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 transform-gpu" // Increased duration and added transform-gpu
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes progressBar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>{" "}
      {/* Added fadeInScale animation for smooth image transitions */}
    </div>
  )
}

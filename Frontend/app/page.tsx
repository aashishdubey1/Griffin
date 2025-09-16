"use client"

import React from "react"
import Link from "next/link"

import type { ReactNode } from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import DocumentationSection from "../components/documentation-section"
import TestimonialsSection from "../components/testimonials-section"
import FAQSection from "../components/faq-section"
import PricingSection from "../components/pricing-section"
import CTASection from "../components/cta-section"
import FooterSection from "../components/footer-section"

const Badge = React.memo(function Badge({ icon, text }: { icon: ReactNode; text: string }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme")
      setIsDarkMode(savedTheme === "dark")
    } catch (error) {
      console.error("Failed to access localStorage:", error)
      // Fallback to system preference
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])

  return (
    <div
      className={`px-[14px] py-[6px] ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_0px_0px_4px_rgba(255,255,257,0.05)]" : "shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)]"} overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] ${isDarkMode ? "border border-[rgba(255,255,257,0.08)]" : "border border-[rgba(2,6,23,0.08)]"} shadow-xs transition-all duration-300 ${isDarkMode ? "hover:shadow-[0px_0px_0px_4px_rgba(255,255,257,0.08)]" : "hover:shadow-[0px_0px_0px_4px_rgba(55,50,47,0.08)]"} hover:scale-105 ${isDarkMode ? "hover:bg-[#3a3a3a]" : "hover:bg-gray-50"} cursor-default`}
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

const PatternOverlay = React.memo(function PatternOverlay({ count = 25 }: { count?: number }) {
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
          className={`self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] ${isDarkMode ? "outline-[rgba(255,255,257,0.15)]" : "outline-[rgba(3,7,18,0.08)]"} outline-offset-[-0.25px] transition-colors duration-500`}
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

export default function LandingPage() {
  const [activeCard, setActiveCard] = useState(0)
  const [progress, setProgress] = useState(0)
  const mountedRef = useRef(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressResetTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev)
  }, [])

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

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return

      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) {
            setActiveCard((current) => (current + 1) % 3)
            if (progressResetTimeoutRef.current) {
              clearTimeout(progressResetTimeoutRef.current)
            }
            progressResetTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                setProgress(0)
              }
            }, 50)
          }
          return prev
        }
        return prev + 1.5
      })
    }, 120)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (progressResetTimeoutRef.current) {
        clearTimeout(progressResetTimeoutRef.current)
        progressResetTimeoutRef.current = null
      }
      mountedRef.current = false
    }
  }, [])

  const handleCardClick = useCallback((index: number) => {
    if (!mountedRef.current) return
    setActiveCard(index)
    setProgress(0)
    if (progressResetTimeoutRef.current) {
      clearTimeout(progressResetTimeoutRef.current)
      progressResetTimeoutRef.current = null
    }
  }, [])

  const getDashboardContent = useMemo(() => {
    const contentMap = {
      0: "Security Analysis - Vulnerability Detection",
      1: "Code Quality - Best Practices Review",
      2: "Performance Insights - Refactoring Suggestions",
    } as const

    return (
      <div className="text-[#828387] text-sm">{contentMap[activeCard as keyof typeof contentMap] || contentMap[0]}</div>
    )
  }, [activeCard])

  const gridItems = useMemo(() => {
    const items = []
    for (let index = 0; index < 8; index++) {
      const isMobileFirstColumn = index % 2 === 0
      const isDesktopFirstColumn = index % 4 === 0
      const isDesktopLastColumn = index % 4 === 3
      const isDesktopTopRow = index < 4
      const isDesktopBottomRow = index >= 4

      items.push(
        <div
          key={index}
          className={`
            h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 flex justify-center items-center gap-1 xs:gap-2 sm:gap-3
            ${isDarkMode ? "border-b border-[rgba(255,255,257,0.15)]" : "border-b border-[rgba(227,226,225,0.5)]"}
            ${index < 6 ? (isDarkMode ? "sm:border-b-[0.5px] sm:border-[rgba(255,255,257,0.15)]" : "sm:border-b-[0.5px]") : isDarkMode ? "sm:border-b sm:border-[rgba(255,255,257,0.15)]" : "sm:border-b"}
            ${isMobileFirstColumn ? (isDarkMode ? "border-r-[0.5px] border-[rgba(255,255,257,0.15)]" : "border-r-[0.5px]") : ""}
            ${isDarkMode ? "sm:border-r-[0.5px] sm:border-[rgba(255,255,257,0.15)] sm:border-l-0" : "sm:border-r-[0.5px] sm:border-l-0"}
            ${isDesktopFirstColumn ? (isDarkMode ? "md:border-l md:border-[rgba(255,255,257,0.15)]" : "md:border-l") : isDarkMode ? "md:border-l-[0.5px] md:border-[rgba(255,255,257,0.15)]" : "md:border-l-[0.5px]"}
            ${isDesktopLastColumn ? (isDarkMode ? "md:border-r md:border-[rgba(255,255,257,0.15)]" : "md:border-r") : isDarkMode ? "md:border-r-[0.5px] md:border-[rgba(255,255,257,0.15)]" : "md:border-r-[0.5px]"}
            ${isDesktopTopRow ? (isDarkMode ? "md:border-b-[0.5px] md:border-[rgba(255,255,257,0.15)]" : "md:border-b-[0.5px]") : ""}
            ${isDesktopBottomRow ? (isDarkMode ? "md:border-t-[0.5px] md:border-b md:border-[rgba(255,255,257,0.15)]" : "md:border-t-[0.5px] md:border-b") : ""}
            transition-all duration-300 ${isDarkMode ? "hover:bg-[rgba(255,255,257,0.08)]" : "hover:bg-white/50"} hover:scale-105 cursor-pointer group
          `}
        >
          <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 relative shadow-[0px_-4px_8px_rgba(255,255,257,0.64)_inset] overflow-hidden rounded-full transition-all duration-300 group-hover:shadow-[0px_-4px_12px_rgba(255,255,257,0.8)_inset] group-hover:scale-110">
            <img
              src="/horizon-icon.svg"
              alt="Horizon"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:rotate-12"
              loading="lazy"
            />
          </div>
          <div
            className={`text-center flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-tight md:leading-9 font-sans transition-all duration-300 ${isDarkMode ? "group-hover:text-white" : "group-hover:text-[#1a1a1a]"} group-hover:scale-105`}
          >
            Lorem
          </div>
        </div>,
      )
    }
    return items
  }, [isDarkMode])

  return (
    <div
      className={`w-full min-h-screen relative ${isDarkMode ? "bg-[#1a1a1a]" : "bg-[#F7F5F3]"} overflow-x-hidden flex flex-col justify-start items-center scroll-smooth transition-colors duration-500`}
    >
      <div className="relative flex flex-col justify-start items-center w-full">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-center items-start min-h-screen">
          <div
            className={`w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 ${isDarkMode ? "bg-[rgba(255,255,257,0.12)]" : "bg-[rgba(55,50,47,0.12)]"} ${isDarkMode ? "shadow-[1px_0px_0px_rgba(0,0,0,0.5)]" : "shadow-[1px_0px_0px_white]"} z-0 transition-colors duration-500`}
          ></div>
          <div
            className={`w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 ${isDarkMode ? "bg-[rgba(255,255,257,0.12)]" : "bg-[rgba(55,50,47,0.12)]"} ${isDarkMode ? "shadow-[1px_0px_0px_rgba(0,0,0,0.5)]" : "shadow-[1px_0px_0px_white]"} z-0 transition-colors duration-500`}
          ></div>
          <div
            className={`self-stretch pt-[9px] overflow-hidden ${isDarkMode ? "border-b border-[rgba(255,255,257,0.06)]" : "border-b border-[rgba(55,50,47,0.06)]"} flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10 transition-colors duration-500`}
          >
            {/* Navigation */}
            <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
              <div
                className={`w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] ${isDarkMode ? "border-t border-[rgba(255,255,257,0.12)]" : "border-t border-[rgba(55,50,47,0.12)]"} ${isDarkMode ? "shadow-[0px_1px_0px_rgba(0,0,0,0.5)]" : "shadow-[0px_1px_0px_white]"} transition-colors duration-500`}
              ></div>
              <div
                className={`w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 ${isDarkMode ? "bg-[#2a2a2a]/90" : "bg-[#F7F5F3]/90"} backdrop-blur-xl ${isDarkMode ? "shadow-[0px_0px_0px_2px_rgba(255,255,257,0.1)]" : "shadow-[0px_0px_0px_2px_white]"} overflow-hidden flex justify-between items-center relative z-30 rounded-lg ${isDarkMode ? "border border-white/10" : "border border-white/20"} transition-all duration-300 ${isDarkMode ? "hover:shadow-[0px_0px_0px_3px_rgba(255,255,257,0.15)]" : "hover:shadow-[0px_0px_0px_3px_white]"} ${isDarkMode ? "hover:bg-[#2a2a2a]/95" : "hover:bg-[#F7F5F3]/95"}`}
              >
                <div className="flex justify-center items-center">
                  <div className="flex justify-start items-center gap-3">
                    <Link href="/">
                      <div
                        className={`flex flex-col justify-center ${isDarkMode ? "text-[#e5e5e5]" : "text-[#2F3037]"} text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans transition-all duration-200 ${isDarkMode ? "hover:text-white" : "hover:text-[#1a1a1a]"} cursor-pointer`}
                      >
                        {"Griffin"}
                      </div>
                    </Link>
                  </div>
                  <div className="pl-3 sm:pl-4 md:pl-5 lg:pl-5 flex justify-start items-start hidden sm:flex flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-4">
                    <div className="flex justify-start items-center"></div>
                    <div className="flex justify-start items-center"></div>
                    <div className="flex justify-start items-center"></div>
                  </div>
                </div>
                <div className="h-6 sm:h-7 md:h-8 flex justify-start items-start gap-2 sm:gap-3">
                  <button
                    onClick={toggleTheme}
                    className={`p-1.5 rounded-full transition-all duration-300 ${isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"} ${isDarkMode ? "text-[#e5e5e5]" : "text-[#2F3037]"} hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 ${isDarkMode ? "focus:ring-white/20" : "focus:ring-black/20"} group`}
                    aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    <svg
                      className={`size-4 transition-all duration-300 ${isDarkMode ? "rotate-180" : "rotate-0"} group-hover:rotate-12`}
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M0 0h24v24H0z" fill="none" stroke="none"></path>
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                      <path d="M12 3l0 18"></path>
                      <path d="M12 9l4.65 -4.65"></path>
                      <path d="M12 14.3l7.37 -7.37"></path>
                      <path d="M12 19.6l8.85 -8.85"></path>
                    </svg>
                  </button>
                  <Link href="/login">
                    <div
                      className={`px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] ${isDarkMode ? "bg-[#3a3a3a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_1px_2px_rgba(0,0,0,0.3)]" : "shadow-[0px_1px_2px_rgba(55,50,47,0.12)]"} overflow-hidden rounded-full flex justify-center items-center transition-all duration-200 ${isDarkMode ? "hover:shadow-[0px_2px_8px_rgba(0,0,0,0.4)]" : "hover:shadow-[0px_2px_8px_rgba(55,50,47,0.15)]"} hover:scale-105 ${isDarkMode ? "hover:bg-[#4a4a4a]" : "hover:bg-gray-50"} cursor-pointer group`}
                    >
                      <div
                        className={`flex flex-col justify-center ${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-xs md:text-[13px] font-medium leading-5 font-sans ${isDarkMode ? "group-hover:text-white" : "group-hover:text-[#1a1a1a]"} transition-colors duration-200`}
                      >
                        Log in
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[216px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
              <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  <div
                    className={`w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-serif px-2 sm:px-4 md:px-0 text-balance animate-in fade-in duration-1000 transition-colors duration-500`}
                  >
                    Griffin: Your Intelligent
                    <br />
                    Code Review Assistant
                  </div>
                  <div
                    className={`w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col ${isDarkMode ? "text-[#d1d1d1]" : "text-[rgba(55,50,47,0.80)]"} sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm text-pretty animate-in fade-in duration-1000 delay-200 transition-colors duration-500`}
                  >
                    Get deeply contextual, actionable feedback on every line of code you write.
                    <br className="hidden sm:block" />
                    It's like having a senior developer review your code instantly.
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="w-full max-w-[497px] lg:w-[497px] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
              <div className="backdrop-blur-[8.25px] flex justify-start items-center gap-4">
                <Link href="/login">
                  <button
                    className={`h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px] relative ${isDarkMode ? "bg-[#e5e5e5]" : "bg-[#37322F]"} ${isDarkMode ? "shadow-[0px_0px_0px_2.5px_rgba(0,0,0,0.08)_inset]" : "shadow-[0px_0px_0px_2.5px_rgba(255,255,257,0.08)_inset]"} overflow-hidden rounded-full flex justify-center items-center transition-all duration-300 ${isDarkMode ? "hover:bg-[#f5f5f5]" : "hover:bg-[#2a2520]"} ${isDarkMode ? "hover:shadow-[0px_4px_20px_rgba(229,229,229,0.25)]" : "hover:shadow-[0px_4px_20px_rgba(55,50,47,0.25)]"} hover:scale-105 active:scale-95 focus:outline-none ${isDarkMode ? "focus:ring-2 focus:ring-[#e5e5e5] focus:ring-offset-2 focus:ring-offset-[#1a1a1a]" : "focus:ring-2 focus:ring-[#37322F] focus:ring-offset-2 focus:ring-offset-[#F7F5F3]"} group`}
                  >
                    <div
                      className={`w-20 sm:w-24 md:w-28 lg:w-44 h-[41px] absolute left-0 top-[-0.5px] ${isDarkMode ? "bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(255,255,257,0.10)]" : "bg-gradient-to-b from-[rgba(255,255,257,0)] to-[rgba(0,0,0,0.10)]"} mix-blend-multiply transition-opacity duration-300 group-hover:opacity-80`}
                    ></div>
                    <div
                      className={`flex flex-col justify-center ${isDarkMode ? "text-[#1a1a1a]" : "text-white"} text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans transition-all duration-200 ${isDarkMode ? "group-hover:text-black" : "group-hover:text-gray-100"}`}
                    >
                      Start for free
                    </div>
                  </button>
                </Link>
              </div>
            </div>

            {/* Background Pattern - Optimized */}
            <div className="absolute top-[232px] sm:top-[248px] md:top-[264px] lg:top-[320px] left-1/2 transform -translate-x-1/2 z-0 pointer-events-none">
              <img
                src="/mask-group-pattern.svg"
                alt=""
                className={`w-[936px] sm:w-[1404px] md:w-[2106px] lg:w-[2808px] h-auto ${isDarkMode ? "opacity-20 brightness-150 contrast-125" : "opacity-30 sm:opacity-40 md:opacity-50"} mix-blend-multiply transition-all duration-500`}
                loading="lazy"
                style={{
                  filter: isDarkMode
                    ? "hue-rotate(15deg) saturate(0.7) brightness(1.8) invert(0.1)"
                    : "hue-rotate(15deg) saturate(0.7) brightness(1.2)",
                }}
              />
            </div>

            {/* Dashboard Preview */}
            <div className="w-full max-w-[960px] lg:w-[960px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-8 sm:my-12 md:my-16 lg:my-16 mb-0 lg:pb-0">
              <div
                className={`w-full max-w-[960px] lg:w-[960px] h-[200px] sm:h-[280px] md:h-[450px] lg:h-[695.55px] ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_0px_0px_0.9056603908538818px_rgba(255,255,257,0.15)] border border-[rgba(255,255,257,0.1)]" : "shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)]"} overflow-hidden rounded-[6px] sm:rounded-[8px] lg:rounded-[9.06px] flex flex-col justify-start items-start transition-all duration-500 ${isDarkMode ? "hover:shadow-[0px_8px_32px_rgba(255,255,257,0.2)] hover:border-[rgba(255,255,257,0.2)]" : "hover:shadow-[0px_8px_32px_rgba(0,0,0,0.12)]"} hover:scale-[1.02] group`}
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
                          alt="Griffin performance optimization recommendations"
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards Section */}
            <div
              className={`self-stretch ${isDarkMode ? "border-t border-[rgba(255,255,257,0.12)] border-b border-[rgba(255,255,257,0.12)]" : "border-t border-[#E0DEDB] border-b border-[#E0DEDB]"} flex justify-center items-start transition-colors duration-500`}
            >
              <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                <PatternOverlay count={25} />
              </div>
              <div className="flex-1 px-0 sm:px-2 md:px-0 flex flex-col md:flex-row justify-center items-stretch gap-0">
                <FeatureCard
                  title="Security Analysis"
                  description="Detect critical vulnerabilities like SQL injection, hardcoded secrets, and insecure API usage."
                  isActive={activeCard === 0}
                  progress={activeCard === 0 ? progress : 0}
                  onClick={() => handleCardClick(0)}
                />
                <FeatureCard
                  title="Code Quality Review"
                  description="Get suggestions based on industry standards and language-specific best practices."
                  isActive={activeCard === 1}
                  progress={activeCard === 1 ? progress : 0}
                  onClick={() => handleCardClick(1)}
                />
                <FeatureCard
                  title="Performance Optimization"
                  description="Receive refactoring recommendations to enhance performance, readability, and architecture."
                  isActive={activeCard === 2}
                  progress={activeCard === 2 ? progress : 0}
                  onClick={() => handleCardClick(2)}
                />
              </div>
              <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                <PatternOverlay count={25} />
              </div>
            </div>

            {/* Smart Simple Brilliant Section */}
            <div
              className={`w-full ${isDarkMode ? "border-b border-[rgba(255,255,257,0.12)]" : "border-b border-[rgba(55,50,47,0.12)]"} flex flex-col justify-center items-center transition-colors duration-500`}
            >
              <div
                className={`self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 ${isDarkMode ? "border-b border-[rgba(255,255,257,0.12)]" : "border-b border-[rgba(55,50,47,0.12)]"} flex justify-center items-center gap-6 transition-colors duration-500`}
              >
                <div className="w-full max-w-[586px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
                  <Badge
                    icon={
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect
                          x="1"
                          y="3"
                          width="4"
                          height="6"
                          stroke={isDarkMode ? "#e5e5e5" : "#37322F"}
                          strokeWidth="1"
                          fill="none"
                        />
                        <rect
                          x="7"
                          y="1"
                          width="4"
                          height="8"
                          stroke={isDarkMode ? "#e5e5e5" : "#37322F"}
                          strokeWidth="1"
                          fill="none"
                        />
                        <rect x="2" y="4" width="1" height="1" fill={isDarkMode ? "#e5e5e5" : "#37322F"} />
                        <rect x="3.5" y="4" width="1" height="1" fill={isDarkMode ? "#e5e5e5" : "#37322F"} />
                        <rect x="2" y="5.5" width="1" height="1" fill={isDarkMode ? "#e5e5e5" : "#37322F"} />
                        <rect x="3.5" y="5.5" width="1" height="1" fill={isDarkMode ? "#e5e5e5" : "#37322F"} />
                        <rect x="8" y="2" width="1" height="1" fill={isDarkMode ? "#e5e5e5" : "#37322F"} />
                        <rect x="9.5" y="2" width="1" height="1" fill={isDarkMode ? "#e5e5e5" : "#37322F"} />
                        <rect x="8" y="3.5" width="1" height="1" fill={isDarkMode ? "#e5e5e5" : "#37322F"} />
                        <rect x="9.5" y="3.5" width="1" height="1" fill={isDarkMode ? "#e5e5e5" : "#37322F"} />
                        <rect x="8" y="5" width="1" height="1" fill={isDarkMode ? "#e5e5e5" : "#37322F"} />
                        <rect x="9.5" y="5" width="1" height="1" fill={isDarkMode ? "#e5e5e5" : "#37322F"} />
                      </svg>
                    }
                    text="Deep Analysis"
                  />
                  <div
                    className={`w-full max-w-[472.55px] text-center flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight transition-colors duration-500`}
                  >
                    Beyond Syntax - Understanding Intent
                  </div>
                  <div
                    className={`self-stretch text-center ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans transition-colors duration-500`}
                  >
                    Griffin goes beyond basic syntax checking to understand the context and intent of your code,
                    <br className="hidden sm:block" />
                    delivering insights that help you write cleaner, safer, and more efficient applications.
                  </div>
                </div>
              </div>

              {/* Grid Section with Optimized Pattern */}
              <div
                className={`self-stretch ${isDarkMode ? "border-[rgba(255,255,257,0.12)]" : "border-[rgba(55,50,47,0.12)]"} flex justify-center items-start border-t border-b-0 transition-colors duration-500`}
              >
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  <PatternOverlay count={25} />
                </div>
                <div
                  className={`flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-0 ${isDarkMode ? "border-l border-r border-[rgba(255,255,257,0.15)]" : "border-l border-r border-[rgba(55,50,47,0.12)]"} transition-colors duration-500`}
                >
                  {gridItems}
                </div>
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  <PatternOverlay count={25} />
                </div>
              </div>
            </div>

            <div
              className={`w-full ${isDarkMode ? "border-b border-[rgba(255,255,257,0.12)]" : "border-b border-[rgba(55,50,47,0.12)]"} flex flex-col justify-center items-center transition-colors duration-500`}
            >
              <div
                className={`self-stretch px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] py-8 sm:py-12 md:py-16 ${isDarkMode ? "border-b border-[rgba(255,255,257,0.12)]" : "border-b border-[rgba(55,50,47,0.12)]"} flex justify-center items-center gap-6 transition-colors duration-500`}
              >
                <div className="w-full max-w-[616px] lg:w-[616px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
                  <Badge
                    icon={
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect
                          x="1"
                          y="1"
                          width="4"
                          height="4"
                          stroke={isDarkMode ? "#e5e5e5" : "#37322F"}
                          strokeWidth="1"
                          fill="none"
                        />
                        <rect
                          x="7"
                          y="1"
                          width="4"
                          height="4"
                          stroke={isDarkMode ? "#e5e5e5" : "#37322F"}
                          strokeWidth="1"
                          fill="none"
                        />
                        <rect
                          x="1"
                          y="7"
                          width="4"
                          height="4"
                          stroke={isDarkMode ? "#e5e5e5" : "#37322F"}
                          strokeWidth="1"
                          fill="none"
                        />
                        <rect
                          x="7"
                          y="7"
                          width="4"
                          height="4"
                          stroke={isDarkMode ? "#e5e5e5" : "#37322F"}
                          strokeWidth="1"
                          fill="none"
                        />
                      </svg>
                    }
                    text="Instant Feedback"
                  />
                  <div
                    className={`w-full max-w-[598.06px] lg:w-[598.06px] text-center flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight transition-colors duration-500`}
                  >
                    Comprehensive Code Intelligence
                  </div>
                  <div
                    className={`self-stretch text-center ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans transition-colors duration-500`}
                  >
                    Get detailed reviews in seconds with security vulnerability detection, best practices suggestions,
                    <br />
                    and refactoring recommendations - all organized in clear, actionable reports.
                  </div>
                </div>
              </div>
              <div className="self-stretch flex justify-center items-start">
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  <PatternOverlay count={100} />
                </div>
                <div
                  className={`flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 ${isDarkMode ? "border-l border-r border-[rgba(255,255,257,0.15)]" : "border-l border-r border-[rgba(55,50,47,0.12)]"} transition-colors duration-500`}
                >
                  <div
                    className={`${isDarkMode ? "border-b border-r-0 md:border-r border-[rgba(255,255,257,0.15)]" : "border-b border-r-0 md:border-r border-[rgba(55,50,47,0.12)]"} p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 transition-colors duration-500`}
                  >
                    <div className="flex flex-col gap-2">
                      <h3
                        className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-lg sm:text-xl font-semibold leading-tight font-sans transition-colors duration-500`}
                      >
                        Security Vulnerability Detection
                      </h3>
                      <p
                        className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#605A57]"} text-sm md:text-base font-normal leading-relaxed font-sans transition-colors duration-500`}
                      >
                        Identifies critical risks like SQL injection, hardcoded secrets, and insecure API usage with
                        severity levels.
                      </p>
                    </div>
                    <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex items-center justify-center overflow-hidden group/image cursor-pointer">
                      <img
                        src="/griffin-hero-image.jpg"
                        alt="Griffin security vulnerability detection interface"
                        className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-110 group-hover/image:brightness-110 hover:shadow-lg"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div
                    className={`${isDarkMode ? "border-b border-[rgba(255,255,257,0.15)]" : "border-b border-[rgba(55,50,47,0.12)]"} p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 transition-colors duration-500`}
                  >
                    <div className="flex flex-col gap-2">
                      <h3
                        className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} font-semibold leading-tight font-sans text-lg sm:text-xl transition-colors duration-500`}
                      >
                        Best Practices & Standards
                      </h3>
                      <p
                        className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#605A57]"} text-sm md:text-base font-normal leading-relaxed font-sans transition-colors duration-500`}
                      >
                        Suggests improvements based on industry standards and language-specific conventions for cleaner
                        code.
                      </p>
                    </div>
                    <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden text-right items-center justify-center group/image cursor-pointer">
                      <img
                        src="/griffin-hero-image.jpg"
                        alt="Griffin best practices and code standards review"
                        className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-110 group-hover/image:brightness-110 hover:shadow-lg"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div
                    className={`border-r-0 ${isDarkMode ? "md:border-r border-[rgba(255,255,257,0.15)]" : "md:border-r border-[rgba(55,50,47,0.12)]"} p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 bg-transparent transition-colors duration-500`}
                  >
                    <div className="flex flex-col gap-2">
                      <h3
                        className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-lg sm:text-xl font-semibold leading-tight font-sans transition-colors duration-500`}
                      >
                        Refactoring Suggestions
                      </h3>
                      <p
                        className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#605A57]"} text-sm md:text-base font-normal leading-relaxed font-sans transition-colors duration-500`}
                      >
                        Offers recommendations to enhance performance, readability, and architecture for maintainable
                        code.
                      </p>
                    </div>
                    <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden justify-center items-center relative bg-transparent group/image cursor-pointer">
                      <img
                        src="/griffin-hero-image.jpg"
                        alt="Griffin refactoring suggestions and performance optimization"
                        className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-110 group-hover/image:brightness-110 hover:shadow-lg"
                        loading="lazy"
                      />
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-8 ${isDarkMode ? "bg-gradient-to-t from-[#1a1a1a] to-transparent" : "bg-gradient-to-t from-[#F7F5F3] to-transparent"} pointer-events-none transition-colors duration-500`}
                      ></div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
                    <div className="flex flex-col gap-2">
                      <h3
                        className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-lg sm:text-xl font-semibold leading-tight font-sans transition-colors duration-500`}
                      >
                        Structured Reporting
                      </h3>
                      <p
                        className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#605A57]"} text-sm md:text-base font-normal leading-relaxed font-sans transition-colors duration-500`}
                      >
                        Returns clear, organized JSON reports categorized into Summary, Vulnerabilities, Best Practices,
                        and Refactoring.
                      </p>
                    </div>
                    <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden items-center justify-center relative group/image cursor-pointer">
                      <img
                        src="/griffin-hero-image.jpg"
                        alt="Griffin structured reporting and code analysis results"
                        className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-110 group-hover/image:brightness-110 hover:shadow-lg"
                        loading="lazy"
                      />
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-8 ${isDarkMode ? "bg-gradient-to-t from-[#1a1a1a] to-transparent" : "bg-gradient-to-t from-[#F7F5F3] to-transparent"} pointer-events-none transition-colors duration-500`}
                      ></div>
                    </div>
                  </div>
                  <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                    <PatternOverlay count={100} />
                  </div>
                </div>
              </div>
              <DocumentationSection />
              <TestimonialsSection />
              <PricingSection />
              <FAQSection />
              <CTASection />
              <FooterSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const FeatureCard = React.memo(function FeatureCard({
  title,
  description,
  isActive,
  progress,
  onClick,
}: {
  title: string
  description: string
  isActive: boolean
  progress: number
  onClick: () => void
}) {
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
      className={`w-full md:flex-1 self-stretch px-6 py-5 overflow-hidden flex flex-col justify-start items-start gap-2 cursor-pointer relative border-b md:border-b-0 last:border-b-0 transition-all duration-300 hover:scale-[1.02] hover:z-10 group ${
        isActive
          ? `${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_0px_0px_0.75px_rgba(255,255,257,0.1)]" : "shadow-[0px_0px_0px_0.75px_#E0DEDB_inset]"} ${isDarkMode ? "shadow-[0px_4px_20px_rgba(255,255,257,0.12)]" : "shadow-[0px_4px_20px_rgba(0,0,0,0.08)]"}`
          : `border-l-0 border-r-0 md:border ${isDarkMode ? "border-[rgba(255,255,257,0.15)]" : "border-[#E0DEDB]/80"} ${isDarkMode ? "hover:bg-[rgba(255,255,257,0.08)]" : "hover:bg-white/50"} ${isDarkMode ? "hover:shadow-[0px_2px_12px_rgba(255,255,257,0.1)] hover:border-[rgba(255,255,257,0.2)]" : "hover:shadow-[0px_2px_12px_rgba(0,0,0,0.06)]"}`
      }`}
      onClick={onClick}
    >
      {isActive && (
        <div
          className={`absolute top-0 left-0 w-full h-0.5 ${isDarkMode ? "bg-[rgba(255,255,257,0.15)]" : "bg-[rgba(50,45,43,0.08)]"} overflow-hidden transition-colors duration-500`}
        >
          <div
            className={`h-full ${isDarkMode ? "bg-gradient-to-r from-[#e5e5e5] to-[#f5f5f5]" : "bg-gradient-to-r from-[#322D2B] to-[#4a4540]"} transition-all duration-100 ease-linear ${isDarkMode ? "shadow-[0px_0px_4px_rgba(229,229,229,0.5)]" : "shadow-[0px_0px_4px_rgba(50,45,43,0.3)]"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <div
        className={`self-stretch flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-sm md:text-sm font-semibold leading-6 md:leading-6 font-sans transition-all duration-200 ${isDarkMode ? "group-hover:text-white" : "group-hover:text-[#37322F]"}`}
      >
        {title}
      </div>
      <div
        className={`self-stretch ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} text-[13px] md:text-[13px] font-normal leading-[22px] md:leading-[22px] font-sans transition-all duration-200 ${isDarkMode ? "group-hover:text-[rgba(229,229,229,0.85)]" : "group-hover:text-[#4a4540]"} text-pretty`}
      >
        {description}
      </div>
    </div>
  )
})

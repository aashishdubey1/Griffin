"use client"

import React from "react"
import { Navigation } from "../components/navigation"
import { HeroContent } from "../components/hero-content"
import { DashboardShowcase } from "../components/dashboard-showcase"
import { PatternOverlay } from "../components/pattern-overlay"
import { Badge } from "../components/badge-component"
import DocumentationSection from "../components/documentation-section"
import PricingSection from "../components/pricing-section"
import FAQSection from "../components/faq-section"
import CTASection from "../components/cta-section"
import FooterSection from "../components/footer-section"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useTheme } from "@/lib/theme-context"

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
  const { isDarkMode } = useTheme()

  return (
    <div
      className={`w-full md:flex-1 self-stretch px-6 py-5 overflow-hidden flex flex-col justify-start items-start gap-2 cursor-pointer relative border-b md:border-b-0 last:border-b-0 transition-all duration-300 hover:scale-[1.02] hover:z-10 group ${
        isActive
          ? `${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_0px_0px_0.75px_rgba(255,255,255,0.1)]" : "shadow-[0px_0px_0px_0.75px_#E0DEDB_inset]"} ${isDarkMode ? "shadow-[0px_4px_20px_rgba(255,255,255,0.12)]" : "shadow-[0px_4px_20px_rgba(0,0,0,0.08)]"}`
          : `border-l-0 border-r-0 md:border ${isDarkMode ? "border-[rgba(255,255,255,0.15)]" : "border-[#E0DEDB]/80"} ${isDarkMode ? "hover:bg-[rgba(255,255,255,0.08)]" : "hover:bg-white/50"} ${isDarkMode ? "hover:shadow-[0px_2px_12px_rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]" : "hover:shadow-[0px_2px_12px_rgba(0,0,0,0.06)]"}`
      }`}
      onClick={onClick}
    >
      {isActive && (
        <div
          className={`absolute top-0 left-0 w-full h-0.5 ${isDarkMode ? "bg-[rgba(255,255,255,0.15)]" : "bg-[rgba(50,45,43,0.08)]"} overflow-hidden transition-colors duration-500`}
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

export default function LandingPage() {
  const [activeCard, setActiveCard] = useState(0)
  const [progress, setProgress] = useState(0)
  const mountedRef = useRef(true)
  const { isDarkMode } = useTheme()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressResetTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
      <div className={`${isDarkMode ? "text-[#b3b3b3]" : "text-[#828387]"} text-sm transition-colors duration-500`}>
        {contentMap[activeCard as keyof typeof contentMap] || contentMap[0]}
      </div>
    )
  }, [activeCard, isDarkMode])

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

  return (
    <div
      className={`w-full min-h-screen relative ${isDarkMode ? "bg-[#1a1a1a]" : "bg-[#F7F5F3]"} overflow-x-hidden flex flex-col justify-start items-center scroll-smooth transition-colors duration-500`}
    >
      <div className="relative flex flex-col justify-start items-center w-full">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-center items-start min-h-screen">
          <div
            className={`w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 ${isDarkMode ? "bg-[rgba(255,255,255,0.12)]" : "bg-[rgba(55,50,47,0.12)]"} ${isDarkMode ? "shadow-[1px_0px_0px_rgba(0,0,0,0.5)]" : "shadow-[1px_0px_0px_white]"} z-0 transition-colors duration-500`}
          ></div>
          <div
            className={`w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 ${isDarkMode ? "bg-[rgba(255,255,255,0.12)]" : "bg-[rgba(55,50,47,0.12)]"} ${isDarkMode ? "shadow-[1px_0px_0px_rgba(0,0,0,0.5)]" : "shadow-[1px_0px_0px_white]"} z-0 transition-colors duration-500`}
          ></div>

          <div
            className={`self-stretch pt-[9px] overflow-hidden ${isDarkMode ? "border-b border-[rgba(255,255,255,0.06)]" : "border-b border-[rgba(55,50,47,0.06)]"} flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10 transition-colors duration-500`}
          >
            <Navigation />

            <HeroContent />

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

            <DashboardShowcase activeCard={activeCard} progress={progress} />

            {/* Feature Cards Section */}
            <div
              className={`self-stretch ${isDarkMode ? "border-t border-[rgba(255,255,255,0.12)] border-b border-[rgba(255,255,255,0.12)]" : "border-t border-[#E0DEDB] border-b border-[#E0DEDB]"} flex justify-center items-start transition-colors duration-500`}
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
              className={`w-full ${isDarkMode ? "border-b border-[rgba(255,255,255,0.12)]" : "border-b border-[rgba(55,50,47,0.12)]"} flex flex-col justify-center items-center transition-colors duration-500`}
            >
              <div
                className={`self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 ${isDarkMode ? "border-b border-[rgba(255,255,255,0.12)]" : "border-b border-[rgba(55,50,47,0.12)]"} flex justify-center items-center gap-6 transition-colors duration-500`}
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

              {/* Griffin Features Grid Section */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-0">
                <div
                  className={`${isDarkMode ? "border-b border-r-0 md:border-r border-[rgba(255,255,255,0.15)]" : "border-b border-r-0 md:border-r border-[rgba(55,50,47,0.12)]"} p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 transition-colors duration-500`}
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
                  {/* <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex items-center justify-center overflow-hidden group/image cursor-pointer">
                    <img
                      src="/griffin-hero-image.jpg"
                      alt="Griffin security vulnerability detection interface"
                      className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-110 group-hover/image:brightness-110 hover:shadow-lg"
                      loading="lazy"
                    />
                  </div> */}
                </div>
                <div
                  className={`${isDarkMode ? "border-b border-[rgba(255,255,255,0.15)]" : "border-b border-[rgba(55,50,47,0.12)]"} p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 transition-colors duration-500`}
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
                  {/* <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden text-right items-center justify-center group/image cursor-pointer">
                    <img
                      src="/griffin-hero-image.jpg"
                      alt="Griffin best practices and code standards review"
                      className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-110 group-hover/image:brightness-110 hover:shadow-lg"
                      loading="lazy"
                    />
                  </div> */}
                </div>
                <div
                  className={`border-r-0 ${isDarkMode ? "md:border-r border-[rgba(255,255,255,0.15)]" : "md:border-r border-[rgba(55,50,47,0.12)]"} p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 bg-transparent transition-colors duration-500`}
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
                  {/* <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden justify-center items-center relative bg-transparent group/image cursor-pointer">
                    <img
                      src="/griffin-hero-image.jpg"
                      alt="Griffin refactoring suggestions and performance optimization"
                      className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-110 group-hover/image:brightness-110 hover:shadow-lg"
                      loading="lazy"
                    />
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-8 ${isDarkMode ? "bg-gradient-to-t from-[#1a1a1a] to-transparent" : "bg-gradient-to-t from-[#F7F5F3] to-transparent"} pointer-events-none transition-colors duration-500`}
                    ></div>
                  </div> */}
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
                  {/* <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden items-center justify-center relative group/image cursor-pointer">
                    <img
                      src="/griffin-hero-image.jpg"
                      alt="Griffin structured reporting and code analysis results"
                      className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-110 group-hover/image:brightness-110 hover:shadow-lg"
                      loading="lazy"
                    />
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-8 ${isDarkMode ? "bg-gradient-to-t from-[#1a1a1a] to-transparent" : "bg-gradient-to-t from-[#F7F5F3] to-transparent"} pointer-events-none transition-colors duration-500`}
                    ></div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Additional Sections */}
            {/* <DocumentationSection /> */}
            <PricingSection />
            <FAQSection />
            <CTASection />
            <FooterSection />
          </div>
        </div>
      </div>
    </div>
  )
}

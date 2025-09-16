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
      className={`px-[14px] py-[6px] ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_0px_0px_4px_rgba(255,255,255,0.05)]" : "shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)]"} overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] ${isDarkMode ? "border border-[rgba(255,255,255,0.08)]" : "border border-[rgba(2,6,23,0.08)]"} shadow-xs transition-all duration-300`}
    >
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center transition-transform duration-200">
        {icon}
      </div>
      <div
        className={`text-center flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-xs font-medium leading-3 font-sans transition-colors duration-200`}
      >
        {text}
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null)
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

  const testimonials = useMemo(
    () => [
      {
        quote:
          "Griffin has revolutionized our code review process. The AI-powered insights catch vulnerabilities we would have missed, saving us countless hours of debugging.",
        name: "Jamie Marshall",
        company: "Co-founder, DevSecure",
        image: "/griffin-hero-image.jpg",
      },
      {
        quote:
          "The security vulnerability detection is incredible. Griffin identified critical SQL injection risks in our legacy code that manual reviews missed completely.",
        name: "Sarah Chen",
        company: "VP Engineering, TechFlow",
        image: "/griffin-hero-image.jpg",
      },
      {
        quote:
          "Best practices suggestions from Griffin have elevated our entire team's coding standards. It's like having a senior architect review every commit.",
        name: "Marcus Rodriguez",
        company: "Lead Developer, InnovateCorp",
        image: "/griffin-hero-image.jpg",
      },
    ],
    [],
  )

  useEffect(() => {
    if (!mountedRef.current) return

    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return

      setIsTransitioning(true)
      transitionTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
        resetTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setIsTransitioning(false)
          }
        }, 100)
      }, 300)
    }, 12000)

    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
        resetTimeoutRef.current = null
      }
    }
  }, [testimonials.length])

  const handleNavigationClick = useCallback((index: number) => {
    if (!mountedRef.current) return

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }

    setIsTransitioning(true)
    transitionTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      setActiveTestimonial(index)
      resetTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setIsTransitioning(false)
        }
      }, 100)
    }, 300)
  }, [])

  return (
    <div
      className={`w-full ${isDarkMode ? "border-b border-[rgba(255,255,255,0.12)]" : "border-b border-[rgba(55,50,47,0.12)]"} flex flex-col justify-center items-center transition-colors duration-500`}
    >
      {/* Header Section */}
      <div
        className={`self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 ${isDarkMode ? "border-b border-[rgba(255,255,255,0.12)]" : "border-b border-[rgba(55,50,47,0.12)]"} flex justify-center items-center gap-6 transition-colors duration-500`}
      >
        <div className="w-full max-w-[586px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
          <Badge
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 1L7.5 4.5L11 4.5L8.25 6.75L9.5 10.5L6 8L2.5 10.5L3.75 6.75L1 4.5L4.5 4.5L6 1Z"
                  stroke={isDarkMode ? "#e5e5e5" : "#37322F"}
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            }
            text="Testimonials"
          />
          <div
            className={`w-full max-w-[472.55px] text-center flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight transition-colors duration-500`}
          >
            Trusted by developers worldwide
          </div>
          <div
            className={`self-stretch text-center ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans transition-colors duration-500`}
          >
            See how Griffin is transforming code review processes
            <br className="hidden sm:block" />
            and helping teams write better, safer code.
          </div>
        </div>
      </div>

      {/* Testimonial Content */}
      <div
        className={`self-stretch px-2 py-8 sm:py-12 md:py-16 overflow-hidden flex justify-center items-center ${isDarkMode ? "bg-[#1a1a1a]" : "bg-[#F7F5F3]"} transition-colors duration-500`}
      >
        <div className="w-full max-w-4xl flex flex-col items-center gap-8">
          {/* Testimonial Card */}
          <div
            className={`w-full max-w-2xl p-6 sm:p-8 ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} rounded-lg ${isDarkMode ? "shadow-[0px_4px_20px_rgba(255,255,255,0.1)]" : "shadow-[0px_4px_20px_rgba(0,0,0,0.08)]"} transition-all duration-500 ${isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}
          >
            <div className="flex flex-col items-center text-center gap-6">
              <div
                className={`text-lg sm:text-xl ${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} font-medium leading-relaxed transition-colors duration-500`}
              >
                "{testimonials[activeTestimonial].quote}"
              </div>
              <div className="flex items-center gap-4">
                <img
                  src={testimonials[activeTestimonial].image || "/placeholder.svg"}
                  alt={testimonials[activeTestimonial].name}
                  className="w-12 h-12 rounded-full object-cover"
                  loading="lazy"
                />
                <div className="text-left">
                  <div
                    className={`font-semibold ${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} transition-colors duration-500`}
                  >
                    {testimonials[activeTestimonial].name}
                  </div>
                  <div
                    className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500`}
                  >
                    {testimonials[activeTestimonial].company}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleNavigationClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeTestimonial
                    ? isDarkMode
                      ? "bg-[#e5e5e5]"
                      : "bg-[#37322F]"
                    : isDarkMode
                      ? "bg-[rgba(255,255,255,0.3)]"
                      : "bg-[rgba(55,50,47,0.3)]"
                } hover:scale-110 focus:outline-none focus:ring-2 ${isDarkMode ? "focus:ring-white/20" : "focus:ring-black/20"}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

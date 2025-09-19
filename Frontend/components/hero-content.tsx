"use client"

import React from "react"
import Link from "next/link"
import { useTheme } from "@/lib/theme-context"

export const HeroContent = React.memo(function HeroContent() {
  const { isDarkMode } = useTheme()

  return (
    <div
      className="pt-16 sm:pt-20 md:pt-24 lg:pt-[216px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0 relative bg-center bg-cover bg-no-repeat bg-fixed"
      style={{
        backgroundImage: isDarkMode ? "url(/gradient-pattern.svg)" : "url(/mask-group-pattern.svg)",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 relative z-10">
        <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          <div
            className={`w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-serif px-2 sm:px-4 md:px-0 text-balance animate-in fade-in duration-1000 transition-colors duration-500`}
          >
            AI-Powered Code Reviews,
            <br />
            Instantly
          </div>
          <div
            className={`w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col ${isDarkMode ? "text-[#d1d1d1]" : "text-[rgba(55,50,47,0.80)]"} sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm text-pretty animate-in fade-in duration-1000 delay-200 transition-colors duration-500`}
          >
            Griffin helps you write cleaner, safer, and more efficient code by combining static analysis with LLM
            intelligence.
            <br className="hidden sm:block" />
            It's like having a senior developer review your code instantly.
          </div>
        </div>
      </div>

      <div className="w-full max-w-[497px] lg:w-[497px] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
        <div className="backdrop-blur-[12px] bg-white/10 dark:bg-black/10 rounded-2xl p-4 flex justify-start items-center gap-4">
          <Link href="/login">
            <button
              className={`h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px] relative ${isDarkMode ? "bg-[#e5e5e5]" : "bg-[#37322F]"} ${isDarkMode ? "shadow-[0px_0px_0px_2.5px_rgba(0,0,0,0.08)_inset]" : "shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset]"} overflow-hidden rounded-full flex justify-center items-center transition-all duration-300 ${isDarkMode ? "hover:bg-[#f5f5f5]" : "hover:bg-[#2a2520]"} ${isDarkMode ? "hover:shadow-[0px_4px_20px_rgba(229,229,229,0.25)]" : "hover:shadow-[0px_4px_20px_rgba(55,50,47,0.25)]"} hover:scale-105 active:scale-95 focus:outline-none ${isDarkMode ? "focus:ring-2 focus:ring-[#e5e5e5] focus:ring-offset-2 focus:ring-offset-[#1a1a1a]" : "focus:ring-2 focus:ring-[#37322F] focus:ring-offset-2 focus:ring-offset-[#F7F5F3]"} group`}
            >
              <div
                className={`w-20 sm:w-24 md:w-28 lg:w-44 h-[41px] absolute left-0 top-[-0.5px] ${isDarkMode ? "bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(255,255,255,0.10)]" : "bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)]"} mix-blend-multiply transition-opacity duration-300 group-hover:opacity-80`}
              ></div>
              <div
                className={`flex flex-col justify-center ${isDarkMode ? "text-[#1a1a1a]" : "text-white"} text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans transition-all duration-200 ${isDarkMode ? "group-hover:text-black" : "group-hover:text-gray-100"}`}
              >
                Try Griffin
              </div>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
})

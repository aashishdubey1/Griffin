"use client"

import Link from "next/link"
import { useTheme } from "@/lib/theme-context"

export default function CTASection() {
  const { isDarkMode } = useTheme()

  return (
    <div className="w-full relative overflow-hidden flex flex-col justify-center items-center gap-2">
      {/* Content */}
      <div
        className={`self-stretch px-6 md:px-24 py-12 md:py-12 ${isDarkMode ? "border-t border-b border-[rgba(255,255,255,0.15)]" : "border-t border-b border-[rgba(55,50,47,0.12)]"} flex justify-center items-center gap-6 relative z-10 transition-colors duration-500`}
      >
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="w-full h-full relative">
            {Array.from({ length: 300 }).map((_, i) => (
              <div
                key={i}
                className={`absolute h-4 w-full rotate-[-45deg] origin-top-left outline outline-[0.5px] ${isDarkMode ? "outline-[rgba(255,255,255,0.08)]" : "outline-[rgba(3,7,18,0.08)]"} outline-offset-[-0.25px] transition-colors duration-500`}
                style={{
                  top: `${i * 16 - 120}px`,
                  left: "-100%",
                  width: "300%",
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[586px] px-6 py-5 md:py-8 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-6 relative z-20">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div
              className={`self-stretch text-center flex justify-center flex-col ${isDarkMode ? "text-[#f5f5f5]" : "text-[#49423D]"} text-3xl md:text-5xl font-semibold leading-tight md:leading-[56px] font-sans tracking-tight transition-colors duration-500`}
            >
              Stop shipping bugs. Start shipping confidence.
            </div>
            
          </div>
          <div className="w-full max-w-[497px] flex flex-col justify-center items-center gap-12">
            <div className="flex justify-start items-center gap-4">
              <Link href="/login">
                <div
                  className={`h-10 px-12 py-[6px] relative ${isDarkMode ? "bg-[#e5e5e5]" : "bg-[#37322F]"} ${isDarkMode ? "shadow-[0px_0px_0px_2.5px_rgba(0,0,0,0.08)_inset]" : "shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset]"} overflow-hidden rounded-full flex justify-center items-center cursor-pointer ${isDarkMode ? "hover:bg-[#f5f5f5]" : "hover:bg-[#2A2520]"} transition-all duration-300 hover:scale-105 ${isDarkMode ? "focus:ring-2 focus:ring-[#e5e5e5] focus:ring-offset-2 focus:ring-offset-[#1a1a1a]" : "focus:ring-2 focus:ring-[#37322F] focus:ring-offset-2 focus:ring-offset-[#F7F5F3]"}`}
                >
                  <div
                    className={`w-44 h-[41px] absolute left-0 top-0 ${isDarkMode ? "bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(255,255,255,0.10)]" : "bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)]"} mix-blend-multiply transition-opacity duration-300`}
                  ></div>
                  <div
                    className={`flex flex-col justify-center ${isDarkMode ? "text-[#1a1a1a]" : "text-white"} text-[13px] font-medium leading-5 font-sans transition-colors duration-300`}
                  >
                    Start for free
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

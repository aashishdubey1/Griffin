"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "@/lib/theme-context"

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually")
  const { isDarkMode } = useTheme()

  const pricing = {
    starter: {
      monthly: 0,
      annually: 0,
    },
    professional: {
      monthly: 20,
      annually: 16, // 20% discount for annual
    },
    enterprise: {
      monthly: 200,
      annually: 160, // 20% discount for annual
    },
  }

  return (
    <div className="w-full flex flex-col justify-center items-center gap-2">
      {/* Header Section */}
      <div
        className={`self-stretch px-6 md:px-24 py-12 md:py-16 ${isDarkMode ? "border-b border-[rgba(255,255,257,0.15)]" : "border-b border-[rgba(55,50,47,0.15)]"} flex justify-center items-center gap-6 transition-colors duration-500`}
      >
        <div className="w-full max-w-[586px] px-6 py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-4 shadow-none">
          {/* Pricing Badge */}
          <div
            className={`px-[14px] py-[6px] ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_0px_0px_4px_rgba(255,255,257,0.08)]" : "shadow-[0px_0px_0px_4px_rgba(55,50,47,0.08)]"} overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] ${isDarkMode ? "border border-[rgba(255,255,257,0.12)]" : "border border-[rgba(55,50,47,0.12)]"} shadow-xs transition-all duration-300`}
          >
            <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 1V11M8.5 3H4.75C4.28587 3 3.84075 3.18437 3.51256 3.51256C3.18437 3.84075 3 4.28587 3 4.75C3 5.21413 3.18437 5.65925 3.51256 5.98744C3.84075 6.31563 4.28587 6.5 4.75 6.5H7.25C7.71413 6.5 8.15925 6.68437 8.48744 7.01256C8.81563 7.34075 9 7.78587 9 8.25C9 8.71413 8.81563 9.15925 8.48744 9.48744C8.15925 9.81563 7.71413 10 7.25 10H3.5"
                  stroke={isDarkMode ? "#e5e5e5" : "#37322F"}
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div
              className={`text-center flex justify-center flex-col ${isDarkMode ? "text-[#f5f5f5]" : "text-[#37322F]"} text-xs font-medium leading-3 font-sans transition-colors duration-300`}
            >
              Plans & Pricing
            </div>
          </div>

          {/* Title */}
          <div
            className={`self-stretch text-center flex justify-center flex-col ${isDarkMode ? "text-[#f5f5f5]" : "text-[#37322F]"} text-3xl md:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight transition-colors duration-500`}
          >
            Choose the perfect plan for your business
          </div>

          {/* Description */}
          <div
            className={`self-stretch text-center ${isDarkMode ? "text-[#e0e0e0]" : "text-[#4a4540]"} text-base font-normal leading-7 font-sans transition-colors duration-500`}
          >
            Scale your operations with flexible pricing that grows with your team.
            <br />
            Start free, upgrade when you're ready.
          </div>
        </div>
      </div>

      {/* Billing Toggle Section */}
      <div className="self-stretch px-6 md:px-16 py-9 relative flex justify-center items-center gap-4">
        {/* Horizontal line */}
        <div
          className={`w-full max-w-[1060px] h-0 absolute left-1/2 transform -translate-x-1/2 top-[63px] ${isDarkMode ? "border-t border-[rgba(255,255,257,0.15)]" : "border-t border-[rgba(55,50,47,0.15)]"} z-0 transition-colors duration-500`}
        ></div>

        {/* Toggle Container */}
        <div
          className={`p-3 relative ${isDarkMode ? "bg-[rgba(255,255,257,0.03)]" : "bg-[rgba(55,50,47,0.03)]"} ${isDarkMode ? "border border-[rgba(255,255,257,0.12)]" : "border border-[rgba(55,50,47,0.12)]"} backdrop-blur-[44px] backdrop-saturate-150 backdrop-brightness-110 flex justify-center items-center rounded-lg z-20 ${isDarkMode ? "before:absolute before:inset-0 before:bg-[#2a2a2a] before:opacity-60 before:rounded-lg before:-z-10" : "before:absolute before:inset-0 before:bg-white before:opacity-60 before:rounded-lg before:-z-10"} transition-all duration-500`}
        >
          <div
            className={`p-[2px] ${isDarkMode ? "bg-[rgba(255,255,257,0.10)]" : "bg-[rgba(55,50,47,0.10)]"} ${isDarkMode ? "shadow-[0px_1px_0px_rgba(255,255,257,0.2)]" : "shadow-[0px_1px_0px_white]"} rounded-[99px] ${isDarkMode ? "border-[0.5px] border-[rgba(255,255,257,0.08)]" : "border-[0.5px] border-[rgba(55,50,47,0.08)]"} flex justify-center items-center gap-[2px] relative transition-all duration-500`}
          >
            <div
              className={`absolute top-[2px] w-[calc(50%-1px)] h-[calc(100%-4px)] ${isDarkMode ? "bg-[#3a3a3a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_2px_4px_rgba(0,0,0,0.3)]" : "shadow-[0px_2px_4px_rgba(0,0,0,0.08)]"} rounded-[99px] transition-all duration-300 ease-in-out ${
                billingPeriod === "annually" ? "left-[2px]" : "right-[2px]"
              }`}
            />

            <button
              onClick={() => setBillingPeriod("annually")}
              className="px-4 py-1 rounded-[99px] flex justify-center items-center gap-2 transition-colors duration-300 relative z-10 flex-1"
            >
              <div
                className={`text-[13px] font-medium leading-5 font-sans transition-colors duration-300 ${
                  billingPeriod === "annually"
                    ? isDarkMode
                      ? "text-[#e5e5e5]"
                      : "text-[#37322F]"
                    : isDarkMode
                      ? "text-[#9CA3AF]"
                      : "text-[#6B7280]"
                }`}
              >
                Annually
              </div>
            </button>

            <button
              onClick={() => setBillingPeriod("monthly")}
              className="px-4 py-1 rounded-[99px] flex justify-center items-center gap-2 transition-colors duration-300 relative z-10 flex-1"
            >
              <div
                className={`text-[13px] font-medium leading-5 font-sans transition-colors duration-300 ${
                  billingPeriod === "monthly"
                    ? isDarkMode
                      ? "text-[#e5e5e5]"
                      : "text-[#37322F]"
                    : isDarkMode
                      ? "text-[#9CA3AF]"
                      : "text-[#6B7280]"
                }`}
              >
                Monthly
              </div>
            </button>
          </div>

          {/* Decorative dots */}
          <div
            className={`w-[3px] h-[3px] absolute left-[5px] top-[5.25px] ${isDarkMode ? "bg-[rgba(255,255,257,0.10)]" : "bg-[rgba(55,50,47,0.10)]"} shadow-[0px_0px_0.5px_rgba(0,0,0,0.12)] rounded-[99px] transition-colors duration-500`}
          ></div>
          <div
            className={`w-[3px] h-[3px] absolute right-[5px] top-[5.25px] ${isDarkMode ? "bg-[rgba(255,255,257,0.10)]" : "bg-[rgba(55,50,47,0.10)]"} shadow-[0px_0px_0.5px_rgba(0,0,0,0.12)] rounded-[99px] transition-colors duration-500`}
          ></div>
          <div
            className={`w-[3px] h-[3px] absolute left-[5px] bottom-[5.25px] ${isDarkMode ? "bg-[rgba(255,255,257,0.10)]" : "bg-[rgba(55,50,47,0.10)]"} shadow-[0px_0px_0.5px_rgba(0,0,0,0.12)] rounded-[99px] transition-colors duration-500`}
          ></div>
          <div
            className={`w-[3px] h-[3px] absolute right-[5px] bottom-[5.25px] ${isDarkMode ? "bg-[rgba(255,255,257,0.10)]" : "bg-[rgba(55,50,47,0.10)]"} shadow-[0px_0px_0.5px_rgba(0,0,0,0.12)] rounded-[99px] transition-colors duration-500`}
          ></div>
        </div>
      </div>

      {/* Pricing Cards Section */}
      <div
        className={`self-stretch ${isDarkMode ? "border-b border-t border-[rgba(255,255,257,0.15)]" : "border-b border-t border-[rgba(55,50,47,0.15)]"} flex justify-center items-center transition-colors duration-500`}
      >
        <div className="flex justify-center items-start w-full">
          {/* Left Decorative Pattern */}
          <div className="w-12 self-stretch relative overflow-hidden hidden md:block">
            <div className="w-[162px] left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className={`self-stretch h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] ${isDarkMode ? "outline-[rgba(255,255,257,0.15)]" : "outline-[rgba(3,7,18,0.08)]"} outline-offset-[-0.25px] transition-colors duration-500`}
                ></div>
              ))}
            </div>
          </div>

          {/* Pricing Cards Container */}
          <div className="flex-1 flex flex-col md:flex-row justify-center items-center gap-6 py-12 md:py-0">
            {/* Starter Plan */}
            <div
              className={`flex-1 max-w-full md:max-w-none self-stretch px-6 py-5 ${isDarkMode ? "border border-[rgba(255,255,257,0.12)]" : "border border-[rgba(50,45,43,0.12)] border-[#E0DEDB]"} overflow-hidden flex flex-col justify-start items-start gap-12 ${isDarkMode ? "bg-[rgba(42,42,42,0)]" : "bg-[rgba(255,255,255,0)]"} transition-all duration-500`}
            >
              {/* Plan Header */}
              <div className="self-stretch flex flex-col justify-start items-center gap-9">
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div
                    className={`${isDarkMode ? "text-[rgba(229,229,229,0.90)]" : "text-[rgba(55,50,47,0.90)]"} text-lg font-medium leading-7 font-sans transition-colors duration-500`}
                  >
                    Starter
                  </div>
                  <div
                    className={`w-full max-w-[242px] ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[rgba(41,37,35,0.70)]"} text-sm font-normal leading-5 font-sans transition-colors duration-500`}
                  >
                    Perfect for individuals and small teams getting started.
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="flex flex-col justify-start items-start gap-1">
                    <div
                      className={`relative h-[60px] flex items-center ${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-5xl font-medium leading-[60px] font-serif transition-colors duration-500`}
                    >
                      <span className="invisible">${pricing.starter[billingPeriod]}</span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: billingPeriod === "annually" ? 1 : 0,
                          transform: `scale(${billingPeriod === "annually" ? 1 : 0.8})`,
                          filter: `blur(${billingPeriod === "annually" ? 0 : 4}px)`,
                        }}
                        aria-hidden={billingPeriod !== "annually"}
                      >
                        ${pricing.starter.annually}
                      </span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: billingPeriod === "monthly" ? 1 : 0,
                          transform: `scale(${billingPeriod === "monthly" ? 1 : 0.8})`,
                          filter: `blur(${billingPeriod === "monthly" ? 0 : 4}px)`,
                        }}
                        aria-hidden={billingPeriod !== "monthly"}
                      >
                        ${pricing.starter.monthly}
                      </span>
                    </div>
                    <div
                      className={`${isDarkMode ? "text-[#b3b3b3]" : "text-[#847971]"} text-sm font-medium font-sans transition-colors duration-500`}
                    >
                      per {billingPeriod === "monthly" ? "month" : "year"}, per user.
                    </div>
                  </div>
                </div>

                <Link href="/login" className="self-stretch">
                  <div
                    className={`self-stretch px-4 py-[10px] relative ${isDarkMode ? "bg-[#e5e5e5]" : "bg-[#37322F]"} ${isDarkMode ? "shadow-[0px_2px_4px_rgba(229,229,229,0.12)]" : "shadow-[0px_2px_4px_rgba(55,50,47,0.12)]"} overflow-hidden rounded-[99px] flex justify-center items-center cursor-pointer ${isDarkMode ? "hover:bg-[#f5f5f5]" : "hover:bg-[#2A2520]"} transition-all duration-300 hover:scale-105 ${isDarkMode ? "focus:ring-2 focus:ring-[#e5e5e5] focus:ring-offset-2 focus:ring-offset-[#1a1a1a]" : "focus:ring-2 focus:ring-[#37322F] focus:ring-offset-2"}`}
                  >
                    <div
                      className={`w-full h-[41px] absolute left-0 top-[-0.5px] ${isDarkMode ? "bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(255,255,257,0.10)]" : "bg-gradient-to-b from-[rgba(255,255,255,0.20)] to-[rgba(0,0,0,0.10)]"} mix-blend-multiply`}
                    ></div>
                    <div
                      className={`max-w-[108px] flex justify-center flex-col ${isDarkMode ? "text-[#1a1a1a]" : "text-[#FBFAF9]"} text-[13px] font-medium leading-5 font-sans transition-colors duration-300`}
                    >
                      Start for free
                    </div>
                  </div>
                </Link>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {[
                  "Up to 3 projects",
                  "Basic documentation tools",
                  "Community support",
                  "Standard templates",
                  "Basic analytics",
                ].map((feature, index) => (
                  <div key={index} className="self-stretch flex justify-start items-center gap-[13px]">
                    <div className="w-4 h-4 relative flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke={isDarkMode ? "#b3b3b3" : "#9CA3AF"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div
                      className={`flex-1 ${isDarkMode ? "text-[rgba(229,229,229,0.80)]" : "text-[rgba(55,50,47,0.80)]"} text-[12.5px] font-normal leading-5 font-sans transition-colors duration-500`}
                    >
                      {feature}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Plan (Featured) */}
            <div
              className={`flex-1 max-w-full md:max-w-none self-stretch px-6 py-5 ${isDarkMode ? "bg-[#e5e5e5]" : "bg-[#37322F]"} ${isDarkMode ? "border border-[rgba(0,0,0,0.12)]" : "border border-[rgba(55,50,47,0.12)]"} overflow-hidden flex flex-col justify-start items-start gap-12 transition-all duration-500`}
            >
              {/* Plan Header */}
              <div className="self-stretch flex flex-col justify-start items-center gap-9">
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div
                    className={`${isDarkMode ? "text-[#1a1a1a]" : "text-[#FBFAF9]"} text-lg font-medium leading-7 font-sans transition-colors duration-500`}
                  >
                    Professional
                  </div>
                  <div
                    className={`w-full max-w-[242px] ${isDarkMode ? "text-[#4a4a4a]" : "text-[#B2AEA9]"} text-sm font-normal leading-5 font-sans transition-colors duration-500`}
                  >
                    Advanced features for growing teams and businesses.
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="flex flex-col justify-start items-start gap-1">
                    <div
                      className={`relative h-[60px] flex items-center ${isDarkMode ? "text-[#1a1a1a]" : "text-[#F0EFEE]"} text-5xl font-medium leading-[60px] font-serif transition-colors duration-500`}
                    >
                      <span className="invisible">${pricing.professional[billingPeriod]}</span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: billingPeriod === "annually" ? 1 : 0,
                          transform: `scale(${billingPeriod === "annually" ? 1 : 0.8})`,
                          filter: `blur(${billingPeriod === "annually" ? 0 : 4}px)`,
                        }}
                        aria-hidden={billingPeriod !== "annually"}
                      >
                        ${pricing.professional.annually}
                      </span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: billingPeriod === "monthly" ? 1 : 0,
                          transform: `scale(${billingPeriod === "monthly" ? 1 : 0.8})`,
                          filter: `blur(${billingPeriod === "monthly" ? 0 : 4}px)`,
                        }}
                        aria-hidden={billingPeriod !== "monthly"}
                      >
                        ${pricing.professional.monthly}
                      </span>
                    </div>
                    <div
                      className={`${isDarkMode ? "text-[#4a4a4a]" : "text-[#D2C6BF]"} text-sm font-medium font-sans transition-colors duration-500`}
                    >
                      per {billingPeriod === "monthly" ? "month" : "year"}, per user.
                    </div>
                  </div>
                </div>

                <Link href="/login" className="self-stretch">
                  <div
                    className={`self-stretch px-4 py-[10px] relative ${isDarkMode ? "bg-[#1a1a1a]" : "bg-[#FBFAF9]"} ${isDarkMode ? "shadow-[0px_2px_4px_rgba(26,26,26,0.12)]" : "shadow-[0px_2px_4px_rgba(55,50,47,0.12)]"} overflow-hidden rounded-[99px] flex justify-center items-center cursor-pointer ${isDarkMode ? "hover:bg-black" : "hover:bg-white"} transition-all duration-300 hover:scale-105 ${isDarkMode ? "focus:ring-2 focus:ring-[#1a1a1a] focus:ring-offset-2 focus:ring-offset-[#e5e5e5]" : "focus:ring-2 focus:ring-[#FBFAF9] focus:ring-offset-2 focus:ring-offset-[#37322F]"}`}
                  >
                    <div
                      className={`w-full h-[41px] absolute left-0 top-[-0.5px] ${isDarkMode ? "bg-gradient-to-b from-[rgba(255,255,257,0)] to-[rgba(0,0,0,0.10)]" : "bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)]"} mix-blend-multiply`}
                    ></div>
                    <div
                      className={`max-w-[108px] flex justify-center flex-col ${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-[13px] font-medium leading-5 font-sans transition-colors duration-300`}
                    >
                      Get started
                    </div>
                  </div>
                </Link>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {[
                  "Unlimited projects",
                  "Advanced documentation tools",
                  "Priority support",
                  "Custom templates",
                  "Advanced analytics",
                  "Team collaboration",
                  "API access",
                  "Custom integrations",
                ].map((feature, index) => (
                  <div key={index} className="self-stretch flex justify-start items-center gap-[13px]">
                    <div className="w-4 h-4 relative flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="#FF8000"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div
                      className={`flex-1 ${isDarkMode ? "text-[#1a1a1a]" : "text-[#F0EFEE]"} text-[12.5px] font-normal leading-5 font-sans transition-colors duration-500`}
                    >
                      {feature}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise Plan */}
            <div
              className={`flex-1 max-w-full md:max-w-none self-stretch px-6 py-5 ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} ${isDarkMode ? "border border-[rgba(255,255,257,0.15)]" : "border border-[#E0DEDB]"} overflow-hidden flex flex-col justify-start items-start gap-12 transition-all duration-500`}
            >
              {/* Plan Header */}
              <div className="self-stretch flex flex-col justify-start items-center gap-9">
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div
                    className={`${isDarkMode ? "text-[rgba(229,229,229,0.90)]" : "text-[rgba(55,50,47,0.90)]"} text-lg font-medium leading-7 font-sans transition-colors duration-500`}
                  >
                    Enterprise
                  </div>
                  <div
                    className={`w-full max-w-[242px] ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[rgba(41,37,35,0.70)]"} text-sm font-normal leading-5 font-sans transition-colors duration-500`}
                  >
                    Complete solution for large organizations and enterprises.
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="flex flex-col justify-start items-start gap-1">
                    <div
                      className={`relative h-[60px] flex items-center ${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-5xl font-medium leading-[60px] font-serif transition-colors duration-500`}
                    >
                      <span className="invisible">${pricing.enterprise[billingPeriod]}</span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: billingPeriod === "annually" ? 1 : 0,
                          transform: `scale(${billingPeriod === "annually" ? 1 : 0.8})`,
                          filter: `blur(${billingPeriod === "annually" ? 0 : 4}px)`,
                        }}
                        aria-hidden={billingPeriod !== "annually"}
                      >
                        ${pricing.enterprise.annually}
                      </span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: billingPeriod === "monthly" ? 1 : 0,
                          transform: `scale(${billingPeriod === "monthly" ? 1 : 0.8})`,
                          filter: `blur(${billingPeriod === "monthly" ? 0 : 4}px)`,
                        }}
                        aria-hidden={billingPeriod !== "monthly"}
                      >
                        ${pricing.enterprise.monthly}
                      </span>
                    </div>
                    <div
                      className={`${isDarkMode ? "text-[#b3b3b3]" : "text-[#847971]"} text-sm font-medium font-sans transition-colors duration-500`}
                    >
                      per {billingPeriod === "monthly" ? "month" : "year"}, per user.
                    </div>
                  </div>
                </div>

                <div
                  className={`self-stretch px-4 py-[10px] relative ${isDarkMode ? "bg-[#e5e5e5]" : "bg-[#37322F]"} ${isDarkMode ? "shadow-[0px_2px_4px_rgba(229,229,229,0.12)]" : "shadow-[0px_2px_4px_rgba(55,50,47,0.12)]"} overflow-hidden rounded-[99px] flex justify-center items-center cursor-pointer ${isDarkMode ? "hover:bg-[#f5f5f5]" : "hover:bg-[#2A2520]"} transition-all duration-300 hover:scale-105 ${isDarkMode ? "focus:ring-2 focus:ring-[#e5e5e5] focus:ring-offset-2 focus:ring-offset-[#2a2a2a]" : "focus:ring-2 focus:ring-[#37322F] focus:ring-offset-2"}`}
                >
                  <div
                    className={`w-full h-[41px] absolute left-0 top-[-0.5px] ${isDarkMode ? "bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(255,255,257,0.10)]" : "bg-gradient-to-b from-[rgba(255,255,255,0.20)] to-[rgba(0,0,0,0.10)]"} mix-blend-multiply`}
                  ></div>
                  <div
                    className={`max-w-[108px] flex justify-center flex-col ${isDarkMode ? "text-[#1a1a1a]" : "text-[#FBFAF9]"} text-[13px] font-medium leading-5 font-sans transition-colors duration-300`}
                  >
                    Contact sales
                  </div>
                </div>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {[
                  "Everything in Professional",
                  "Dedicated account manager",
                  "24/7 phone support",
                  "Custom onboarding",
                  "Advanced security features",
                  "SSO integration",
                  "Custom contracts",
                  "White-label options",
                ].map((feature, index) => (
                  <div key={index} className="self-stretch flex justify-start items-center gap-[13px]">
                    <div className="w-4 h-4 relative flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke={isDarkMode ? "#b3b3b3" : "#9CA3AF"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div
                      className={`flex-1 ${isDarkMode ? "text-[rgba(229,229,229,0.80)]" : "text-[rgba(55,50,47,0.80)]"} text-[12.5px] font-normal leading-5 font-sans transition-colors duration-500`}
                    >
                      {feature}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Decorative Pattern */}
          <div className="w-12 self-stretch relative overflow-hidden hidden md:block">
            <div className="w-[162px] left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className={`self-stretch h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] ${isDarkMode ? "outline-[rgba(255,255,257,0.15)]" : "outline-[rgba(3,7,18,0.08)]"} outline-offset-[-0.25px] transition-colors duration-500`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import React from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"

export const Navigation = React.memo(function Navigation() {
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  const MessageSquareIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )

  return (
    <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
      <div
        className={`w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] ${isDarkMode ? "border-t border-[rgba(255,255,255,0.12)]" : "border-t border-[rgba(55,50,47,0.12)]"} ${isDarkMode ? "shadow-[0px_1px_0px_rgba(0,0,0,0.5)]" : "shadow-[0px_1px_0px_white]"} transition-colors duration-500`}
      ></div>
      <div
        className={`w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 ${isDarkMode ? "bg-[#2a2a2a]/90" : "bg-[#F7F5F3]/90"} backdrop-blur-xl ${isDarkMode ? "shadow-[0px_0px_0px_2px_rgba(255,255,255,0.1)]" : "shadow-[0px_0px_0px_2px_rgba(0,0,0,0.15)]"} overflow-hidden flex justify-between items-center relative z-30 rounded-lg ${isDarkMode ? "border border-white/10" : "border border-black/20"} transition-all duration-300 ${isDarkMode ? "hover:shadow-[0px_0px_0px_3px_rgba(255,255,255,0.15)]" : "hover:shadow-[0px_0px_0px_3px_rgba(0,0,0,0.2)]"} ${isDarkMode ? "hover:bg-[#2a2a2a]/95" : "hover:bg-[#F7F5F3]/95"}`}
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
          {user && (
            <div className="pl-3 sm:pl-4 md:pl-5 lg:pl-5 flex justify-start items-start hidden sm:flex flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-4">
              <Link href="/chat">
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 ${isDarkMode ? "text-[#e5e5e5] hover:text-white hover:bg-[#3a3a3a]" : "text-[#605A57] hover:text-[#37322F] hover:bg-white/50"} cursor-pointer`}
                >
                  <MessageSquareIcon className="h-3 w-3" />
                  <span className="text-xs font-medium">Chat</span>
                </div>
              </Link>
            </div>
          )}
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
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/chat" className="sm:hidden">
                <div
                  className={`px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] ${isDarkMode ? "bg-[#3a3a3a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_1px_2px_rgba(0,0,0,0.3)]" : "shadow-[0px_1px_2px_rgba(55,50,47,0.12)]"} overflow-hidden rounded-full flex justify-center items-center transition-all duration-200 ${isDarkMode ? "hover:shadow-[0px_2px_8px_rgba(0,0,0,0.4)]" : "hover:shadow-[0px_2px_8px_rgba(55,50,47,0.15)]"} hover:scale-105 ${isDarkMode ? "hover:bg-[#4a4a4a]" : "hover:bg-gray-50"} cursor-pointer group`}
                >
                  <MessageSquareIcon className="h-3 w-3" />
                </div>
              </Link>
              <div
                className={`px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] ${isDarkMode ? "bg-[#3a3a3a]" : "bg-white"} ${isDarkMode ? "shadow-[0px_1px_2px_rgba(0,0,0,0.3)]" : "shadow-[0px_1px_2px_rgba(55,50,47,0.12)]"} overflow-hidden rounded-full flex justify-center items-center transition-all duration-200 ${isDarkMode ? "hover:shadow-[0px_2px_8px_rgba(0,0,0,0.4)]" : "hover:shadow-[0px_2px_8px_rgba(55,50,47,0.15)]"} hover:scale-105 ${isDarkMode ? "hover:bg-[#4a4a4a]" : "hover:bg-gray-50"} cursor-pointer group`}
                onClick={logout}
              >
                <div
                  className={`flex flex-col justify-center ${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} text-xs md:text-[13px] font-medium leading-5 font-sans ${isDarkMode ? "group-hover:text-white" : "group-hover:text-[#1a1a1a]"} transition-colors duration-200`}
                >
                  Logout
                </div>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
})

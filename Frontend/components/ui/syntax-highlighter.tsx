"use client"

import { useTheme } from "@/lib/theme-context"

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

interface InlineCodeProps {
  children: string
  className?: string
}

export function CodeBlock({ code, language, className = '' }: CodeBlockProps) {
  const { isDarkMode } = useTheme()
  
  return (
    <div 
      className={`rounded-lg overflow-hidden ${
        isDarkMode 
          ? 'bg-[#1a1a1a] border border-[rgba(255,255,255,0.15)]' 
          : 'bg-[#F7F5F3] border border-[#E0DEDB]'
      } ${className}`}
    >
      {language && (
        <div 
          className={`px-4 py-2 text-xs font-medium border-b ${
            isDarkMode 
              ? 'bg-[#2a2a2a] text-[rgba(229,229,229,0.70)] border-[rgba(255,255,255,0.15)]'
              : 'bg-white text-[#605A57] border-[#E0DEDB]'
          }`}
        >
          {language}
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code 
          className={`text-sm font-mono ${
            isDarkMode ? 'text-[#e5e5e5]' : 'text-[#49423D]'
          }`}
        >
          {code}
        </code>
      </pre>
    </div>
  )
}

export function InlineCode({ children, className = '' }: InlineCodeProps) {
  const { isDarkMode } = useTheme()
  
  return (
    <code 
      className={`px-1.5 py-0.5 rounded text-sm font-mono ${
        isDarkMode 
          ? 'bg-[rgba(255,255,255,0.08)] text-[#e5e5e5]' 
          : 'bg-[rgba(55,50,47,0.08)] text-[#49423D]'
      } ${className}`}
    >
      {children}
    </code>
  )
}
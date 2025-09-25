"use client"

import React, { createContext, useContext, useState } from "react"
import { useTheme } from "@/lib/theme-context"

const TabsContext = createContext<{
  value: string
  setValue: (value: string) => void
}>({ value: "", setValue: () => {} })

interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

export function Tabs({ value, defaultValue = "", onValueChange, className = "", children }: TabsProps) {
  const [internalValue, setInternalValue] = useState(value || defaultValue)
  const currentValue = value !== undefined ? value : internalValue
  
  const setValue = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }
  
  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
}

export function TabsList({ className = "", children }: TabsListProps) {
  const { isDarkMode } = useTheme()
  
  return (
    <div 
      className={`inline-flex h-10 items-center justify-center rounded-md p-1 ${
        isDarkMode 
          ? 'bg-[#2a2a2a] text-[rgba(229,229,229,0.70)]' 
          : 'bg-[#F7F5F3] text-[#605A57]'
      } ${className}`}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  className?: string
  disabled?: boolean
  children: React.ReactNode
}

export function TabsTrigger({ value, className = "", disabled, children }: TabsTriggerProps) {
  const { isDarkMode } = useTheme()
  const { value: currentValue, setValue } = useContext(TabsContext)
  const isActive = currentValue === value
  
  return (
    <button
      disabled={disabled}
      onClick={() => !disabled && setValue(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? isDarkMode
            ? 'bg-[#1a1a1a] text-[#e5e5e5] shadow-sm'
            : 'bg-white text-[#37322F] shadow-sm'
          : isDarkMode
            ? 'hover:bg-[rgba(255,255,255,0.08)] hover:text-[#e5e5e5]'
            : 'hover:bg-[rgba(55,50,47,0.08)] hover:text-[#37322F]'
      } ${className}`}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function TabsContent({ value, className = "", children }: TabsContentProps) {
  const { value: currentValue } = useContext(TabsContext)
  
  if (currentValue !== value) return null
  
  return (
    <div 
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  )
}
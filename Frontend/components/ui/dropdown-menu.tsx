"use client"

import React, { createContext, useContext, useState } from "react"
import { useTheme } from "@/lib/theme-context"

const DropdownMenuContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

interface DropdownMenuProps {
  children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

export function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps) {
  const { setOpen } = useContext(DropdownMenuContext)
  
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => setOpen(true)
    })
  }
  
  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

interface DropdownMenuContentProps {
  align?: "start" | "center" | "end"
  className?: string
  children: React.ReactNode
}

export function DropdownMenuContent({ align = "start", className = "", children }: DropdownMenuContentProps) {
  const { isDarkMode } = useTheme()
  const { open, setOpen } = useContext(DropdownMenuContext)
  
  if (!open) return null
  
  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setOpen(false)}
      />
      <div 
        className={`absolute z-50 min-w-[8rem] rounded-md border p-1 shadow-md ${
          isDarkMode 
            ? 'bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]' 
            : 'bg-white border-[#E0DEDB]'
        } ${
          align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
        } top-full mt-1 ${className}`}
      >
        {children}
      </div>
    </>
  )
}

interface DropdownMenuItemProps {
  className?: string
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
  children: React.ReactNode
}

export function DropdownMenuItem({ className = "", onClick, disabled, children }: DropdownMenuItemProps) {
  const { isDarkMode } = useTheme()
  const { setOpen } = useContext(DropdownMenuContext)
  
  return (
    <div
      className={`flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors ${
        disabled 
          ? 'opacity-50 pointer-events-none' 
          : isDarkMode
            ? 'hover:bg-[rgba(255,255,255,0.1)] focus:bg-[rgba(255,255,255,0.1)]'
            : 'hover:bg-[rgba(55,50,47,0.1)] focus:bg-[rgba(55,50,47,0.1)]'
      } ${className}`}
      onClick={(e) => {
        if (!disabled) {
          onClick?.(e)
          setOpen(false)
        }
      }}
    >
      {children}
    </div>
  )
}
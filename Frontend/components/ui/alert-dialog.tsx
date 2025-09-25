"use client"

import React, { createContext, useContext, useState } from "react"
import { useTheme } from "@/lib/theme-context"
import { Button } from "./button"

const AlertDialogContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

interface AlertDialogProps {
  children: React.ReactNode
}

export function AlertDialog({ children }: AlertDialogProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

interface AlertDialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

export function AlertDialogTrigger({ asChild, children }: AlertDialogTriggerProps) {
  const { setOpen } = useContext(AlertDialogContext)
  
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

interface AlertDialogContentProps {
  className?: string
  children: React.ReactNode
}

export function AlertDialogContent({ className = "", children }: AlertDialogContentProps) {
  const { isDarkMode } = useTheme()
  const { open } = useContext(AlertDialogContext)
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" />
      <div 
        className={`relative z-50 w-full max-w-lg rounded-lg border p-6 shadow-lg ${
          isDarkMode 
            ? 'bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]' 
            : 'bg-white border-[#E0DEDB]'
        } ${className}`}
      >
        {children}
      </div>
    </div>
  )
}

interface AlertDialogHeaderProps {
  className?: string
  children: React.ReactNode
}

export function AlertDialogHeader({ className = "", children }: AlertDialogHeaderProps) {
  return (
    <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}>
      {children}
    </div>
  )
}

interface AlertDialogTitleProps {
  className?: string
  children: React.ReactNode
}

export function AlertDialogTitle({ className = "", children }: AlertDialogTitleProps) {
  const { isDarkMode } = useTheme()
  
  return (
    <h3 className={`text-lg font-semibold ${
      isDarkMode ? 'text-[#e5e5e5]' : 'text-[#37322F]'
    } ${className}`}>
      {children}
    </h3>
  )
}

interface AlertDialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

export function AlertDialogDescription({ className = "", children }: AlertDialogDescriptionProps) {
  const { isDarkMode } = useTheme()
  
  return (
    <p className={`text-sm ${
      isDarkMode ? 'text-[rgba(229,229,229,0.70)]' : 'text-[#605A57]'
    } ${className}`}>
      {children}
    </p>
  )
}

interface AlertDialogFooterProps {
  className?: string
  children: React.ReactNode
}

export function AlertDialogFooter({ className = "", children }: AlertDialogFooterProps) {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>
      {children}
    </div>
  )
}

interface AlertDialogActionProps {
  className?: string
  onClick?: () => void
  children: React.ReactNode
}

export function AlertDialogAction({ className = "", onClick, children }: AlertDialogActionProps) {
  const { setOpen } = useContext(AlertDialogContext)
  
  return (
    <Button 
      className={className}
      onClick={() => {
        onClick?.()
        setOpen(false)
      }}
    >
      {children}
    </Button>
  )
}

interface AlertDialogCancelProps {
  className?: string
  onClick?: () => void
  children: React.ReactNode
}

export function AlertDialogCancel({ className = "", onClick, children }: AlertDialogCancelProps) {
  const { setOpen } = useContext(AlertDialogContext)
  
  return (
    <Button 
      variant="outline"
      className={className}
      onClick={() => {
        onClick?.()
        setOpen(false)
      }}
    >
      {children}
    </Button>
  )
}
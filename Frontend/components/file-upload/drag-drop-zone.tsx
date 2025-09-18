"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme-context"

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 11-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 001 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

const LoaderIcon = ({ className }: { className?: string }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
)

interface DragDropZoneProps {
  onFileUpload: (file: File) => Promise<void>
  supportedFileTypes: string[]
  isUploading: boolean
  className?: string
}

export function DragDropZone({ onFileUpload, supportedFileTypes, isUploading, className = "" }: DragDropZoneProps) {
  const { isDarkMode } = useTheme()
  const [isDragOver, setIsDragOver] = useState(false)

  const isValidFileType = useCallback(
    (fileName: string) => {
      return supportedFileTypes.some((type) => fileName.toLowerCase().endsWith(type))
    },
    [supportedFileTypes],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const file = files[0]
        if (isValidFileType(file.name)) {
          onFileUpload(file)
        } else {
          alert(`Unsupported file type. Please upload files with these extensions: ${supportedFileTypes.join(", ")}`)
        }
      }
    },
    [onFileUpload, isValidFileType, supportedFileTypes],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        if (isValidFileType(file.name)) {
          onFileUpload(file)
        } else {
          alert(`Unsupported file type. Please upload files with these extensions: ${supportedFileTypes.join(", ")}`)
        }
      }
      e.target.value = ""
    },
    [onFileUpload, isValidFileType, supportedFileTypes],
  )

  return (
    <>
      {isDragOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            className={`p-8 rounded-lg border-2 border-dashed border-orange-500 ${
              isDarkMode ? "bg-[#2a2a2a]" : "bg-white"
            } text-center`}
          >
            <UploadIcon className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <p className={`text-lg font-medium ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"}`}>
              Drop your code file here
            </p>
            <p className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} mt-2`}>
              Supports: {supportedFileTypes.slice(0, 5).join(", ")} and more
            </p>
          </div>
        </div>
      )}

      <div className={className} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={supportedFileTypes.join(",")}
          onChange={handleFileInputChange}
          disabled={isUploading}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={`h-8 w-8 p-0 ${
            isDarkMode
              ? "text-[rgba(229,229,229,0.70)] hover:text-[#e5e5e5] hover:bg-[rgba(255,255,255,0.08)]"
              : "text-[#605A57] hover:text-[#49423D] hover:bg-[#F7F5F3]"
          } rounded-lg flex-shrink-0 transition-colors duration-500 ${
            isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={isUploading}
          title="Upload code file for review"
        >
          {isUploading ? <LoaderIcon className="w-5 h-5" /> : <UploadIcon className="w-5 h-5" />}
        </Button>
      </div>
    </>
  )
}

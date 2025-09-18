"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const BotIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
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

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { isDarkMode } = useTheme()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const supportedFileTypes = [
    ".txt",
    ".js",
    ".ts",
    ".py",
    ".java",
    ".cs",
    ".cpp",
    ".c",
    ".go",
    ".rs",
    ".php",
    ".rb",
    ".kt",
    ".swift",
    ".dart",
    ".html",
    ".css",
    ".sql",
    ".sh",
    ".yml",
    ".yaml",
    ".json",
    ".xml",
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const isValidFileType = (fileName: string) => {
    return supportedFileTypes.some((type) => fileName.toLowerCase().endsWith(type))
  }

  const handleFileUpload = async (file: File) => {
    if (!isValidFileType(file.name)) {
      alert(`Unsupported file type. Please upload files with these extensions: ${supportedFileTypes.join(", ")}`)
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("http://localhost:4000/api/review/submit-file", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()

        const userMessage: Message = {
          id: Date.now().toString(),
          type: "user",
          content: `Uploaded file: ${file.name}`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content:
            result.message ||
            `I've received your file "${file.name}" and will analyze it for security vulnerabilities, best practices, and optimization opportunities. The analysis is complete!`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("File upload error:", error)
      alert("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
    e.target.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    setTimeout(
      () => {
        const responses = [
          "I'm Griffin, your AI code review assistant. I can help you analyze code for security vulnerabilities, best practices, and optimization opportunities. Upload a file in the right panel for detailed analysis!",
          "Great question! For code review, I recommend focusing on security patterns, performance optimizations, and maintainability. Would you like me to analyze a specific code file?",
          "I can help you with code analysis, security audits, best practices, and refactoring suggestions. Upload your code file to the right panel and I'll provide detailed feedback.",
          "As your code review assistant, I specialize in identifying security vulnerabilities, suggesting performance improvements, and ensuring your code follows best practices. Ready to analyze some code?",
        ]

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      },
      1000 + Math.random() * 1000,
    )
  }

  if (authLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-[#1a1a1a]" : "bg-[#F7F5F3]"} transition-colors duration-500`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div
      className={`h-screen relative ${
        isDarkMode ? "bg-[#1a1a1a]" : "bg-[#F7F5F3]"
      } overflow-x-hidden transition-colors duration-500`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            className={`p-8 rounded-lg border-2 border-dashed border-orange-500 ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} text-center`}
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

      <div className="relative z-20 h-[84px]">
        <Navigation />
      </div>

      <div className="flex h-[calc(100vh-84px)]">
        <div className="flex-1 w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] mx-auto relative">
          <div
            className={`w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 ${
              isDarkMode ? "bg-[rgba(255,255,255,0.12)]" : "bg-[rgba(55,50,47,0.12)]"
            } ${
              isDarkMode ? "shadow-[1px_0px_0px_rgba(0,0,0,0.5)]" : "shadow-[1px_0px_0px_white]"
            } z-0 transition-colors duration-500`}
          ></div>
          <div
            className={`w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 ${
              isDarkMode ? "bg-[rgba(255,255,255,0.12)]" : "bg-[rgba(55,50,47,0.12)]"
            } ${
              isDarkMode ? "shadow-[1px_0px_0px_rgba(0,0,0,0.5)]" : "shadow-[1px_0px_0px_white]"
            } z-0 transition-colors duration-500`}
          ></div>

          <div className="h-full relative z-10 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto px-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
                    <h1
                      className={`text-3xl font-semibold ${
                        isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"
                      } mb-2 transition-colors duration-500`}
                    >
                      Hey, {user?.username || "there"}. Ready to dive in?
                    </h1>
                    <p
                      className={`${
                        isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"
                      } max-w-md text-lg transition-colors duration-500`}
                    >
                      Upload your code or ask me anything about code review, security, and best practices.
                    </p>
                  </div>
                )}

                <div className="space-y-6 py-8">
                  {messages.map((message) => (
                    <div key={message.id} className="group">
                      <div className="flex gap-4 px-4 py-6">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                          {message.type === "user" ? (
                            <UserIcon className="h-4 w-4 text-white" />
                          ) : (
                            <BotIcon className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"
                            } transition-colors duration-500`}
                          >
                            {message.type === "user" ? user?.username || "You" : "Griffin"}
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <div
                              className={`whitespace-pre-wrap ${
                                isDarkMode ? "text-[rgba(229,229,229,0.85)]" : "text-[#605A57]"
                              } leading-relaxed transition-colors duration-500`}
                            >
                              {message.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="group">
                      <div className="flex gap-4 px-4 py-6">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                          <LoaderIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"
                            } transition-colors duration-500`}
                          >
                            Griffin
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            <div
              className={`border-t ${isDarkMode ? "border-[rgba(255,255,255,0.12)]" : "border-[rgba(55,50,47,0.12)]"} ${
                isDarkMode ? "bg-[#1a1a1a]" : "bg-[#F7F5F3]"
              } px-4 py-6 transition-colors duration-500`}
            >
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit}>
                  <div
                    className={`relative ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} rounded-3xl border ${
                      isDarkMode ? "border-[rgba(255,255,255,0.15)]" : "border-[#E0DEDB]"
                    } shadow-sm transition-all duration-200`}
                  >
                    <div className="flex items-end gap-3 p-4">
                      <div className="relative">
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

                      <div className="flex-1 min-h-[24px] max-h-32">
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Ask Griffin anything about your code..."
                          className={`w-full bg-transparent ${
                            isDarkMode
                              ? "text-[#e5e5e5] placeholder-[rgba(229,229,229,0.70)]"
                              : "text-[#49423D] placeholder-[#605A57]"
                          } resize-none border-none outline-none text-base leading-6 transition-colors duration-500`}
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleSubmit(e as any)
                            }
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement
                            target.style.height = "auto"
                            target.style.height = target.scrollHeight + "px"
                          }}
                        />
                      </div>

                      <Button
                        type="submit"
                        size="sm"
                        disabled={!input.trim() || isLoading}
                        className="h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SendIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Griffin Interface 
        <div className="w-[480px] flex-shrink-0">
          <GriffinInterface />
        </div>*/}
      </div>
    </div>
  )
}

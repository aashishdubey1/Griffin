"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { JobTracker } from "@/components/job-status/job-tracker"
import { ReviewResults } from "@/components/code-review/review-results"
import { useJobTracker } from "@/hooks/use-job-tracker"
import apiService, { type ReviewSubmissionData } from "@/lib/api-service"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  jobId?: string
  reviewResult?: any
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
      d="M7 16a4 4 0 11-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 001 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
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
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
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
  const [isUploading, setIsUploading] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  const {
    jobStatus,
    isCompleted,
    isFailed,
    error: jobError,
  } = useJobTracker(currentJobId, {
    onComplete: (result) => {
      console.log("[v0] Job completed with result:", result)

      // Enhanced completion handling with better response display
      const completionMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "assistant",
        content: result?.message || "Analysis complete! Here are your detailed results:",
        timestamp: new Date(),
        reviewResult: result,
      }
      setMessages((prev) => [...prev, completionMessage])
      setCurrentJobId(null)
    },
    onError: (error) => {
      console.error("[v0] Job failed:", error)

      // Better error message formatting
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "assistant",
        content: `Analysis failed: ${typeof error === "string" ? error : "An unexpected error occurred"}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setCurrentJobId(null)
    },
  })

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

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)

    try {
      const result = await apiService.uploadFile(file)

      if (result.success) {
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
          content: result.jobId
            ? `I've received your file "${file.name}" and started analyzing it. You can track the progress below.`
            : "I've received your file and the analysis is complete!",
          timestamp: new Date(),
          jobId: result.jobId,
        }
        setMessages((prev) => [...prev, assistantMessage])

        if (result.jobId) {
          setCurrentJobId(result.jobId)
          console.log(`[v0] Started tracking job: ${result.jobId}`)
        }
      } else {
        throw new Error(result.message || "Upload failed")
      }
    } catch (error) {
      console.error("File upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload file. Please try again."

      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Sorry, I encountered an error while uploading your file: ${errorMessage}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorAssistantMessage])
    } finally {
      setIsUploading(false)
    }
  }

  const handleCodeSubmission = async (code: string) => {
    if (!code.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: `Submitted code for review:\n\`\`\`\n${code.substring(0, 200)}${code.length > 200 ? "..." : ""}\n\`\`\``,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      const submissionData: ReviewSubmissionData = {
        code: code.trim(),
      }

      const result = await apiService.submitReview(submissionData)

      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: result.jobId
            ? "I've received your code and started analyzing it. You can track the progress below."
            : "I've received your code and the analysis is complete!",
          timestamp: new Date(),
          jobId: result.jobId,
        }
        setMessages((prev) => [...prev, assistantMessage])

        if (result.jobId) {
          setCurrentJobId(result.jobId)
          console.log(`[v0] Started tracking code review job: ${result.jobId}`)
        } else if (result.result) {
          // Handle immediate results
          const resultMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: "assistant",
            content: "Here are your code review results:",
            timestamp: new Date(),
            reviewResult: result.result,
          }
          setMessages((prev) => [...prev, resultMessage])
        }
      } else {
        throw new Error(result.message || "Submission failed")
      }
    } catch (error) {
      console.error("Code submission error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to submit code. Please try again."

      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Sorry, I encountered an error while analyzing your code: ${errorMessage}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorAssistantMessage])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Check if the input is asking for job status
    const jobStatusPattern = /job[s]?\s*(status|result|response)/i
    const jobIdPattern = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i

    const isJobStatusQuery = jobStatusPattern.test(input.trim())
    const jobIdMatch = input.trim().match(jobIdPattern)

    if (isJobStatusQuery && jobIdMatch) {
      const jobId = jobIdMatch[1]

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: input.trim(),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      try {
        // Fetch job status directly
        const statusResult = await apiService.getJobStatus(jobId)

        if (statusResult.success && statusResult.data) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "assistant",
            content:
              statusResult.data.status === "completed"
                ? "Here are the results for your job:"
                : `Job Status: ${statusResult.data.status || "unknown"}`,
            timestamp: new Date(),
            reviewResult: statusResult.data.status === "completed" ? statusResult.data.result : null,
          }
          setMessages((prev) => [...prev, assistantMessage])
        } else {
          throw new Error(statusResult.error || "Failed to fetch job status")
        }
      } catch (error) {
        console.error("[v0] Job status fetch error:", error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: `Sorry, I couldn't fetch the status for job ${jobId}. ${error instanceof Error ? error.message : "Please try again."}`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Check if input looks like code (contains common code patterns)
    const codePatterns = [
      /function\s+\w+\s*\(/,
      /class\s+\w+/,
      /import\s+.+from/,
      /def\s+\w+\s*\(/,
      /public\s+class/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /{[\s\S]*}/,
      /\w+\s*$$[^)]*$$\s*{/,
    ]

    const looksLikeCode = codePatterns.some((pattern) => pattern.test(input.trim())) && input.trim().length > 50

    if (looksLikeCode) {
      // Handle as code submission
      await handleCodeSubmission(input.trim())
      setInput("")
      return
    }

    // Handle as regular chat message
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
          "I'm Griffin, your AI code review assistant. I can help you analyze code for security vulnerabilities, best practices, and optimization opportunities. Upload a file or paste code directly in the chat!",
          "Great question! For code review, I recommend focusing on security patterns, performance optimizations, and maintainability. Would you like me to analyze a specific code file?",
          "I can help you with code analysis, security audits, best practices, and refactoring suggestions. Upload your code file or paste code directly for detailed feedback.",
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

  const handleFileButtonClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = supportedFileTypes.join(",")
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleFileUpload(file)
      }
    }
    input.click()
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
    >
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
                      Upload your code, paste it directly, or ask me anything about code review, security, and best
                      practices.
                    </p>
                  </div>
                )}

                <div className="space-y-6 py-8">
                  {currentJobId && (
                    <div className="px-4">
                      <JobTracker
                        jobId={currentJobId}
                        onComplete={(result) => {
                          console.log("[v0] Job tracker completed:", result)
                        }}
                        onError={(error) => {
                          console.error("[v0] Job tracker error:", error)
                        }}
                      />
                    </div>
                  )}

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
                            {message.reviewResult && (
                              <div className="mt-4">
                                <ReviewResults result={message.reviewResult} />
                              </div>
                            )}
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
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleFileButtonClick}
                        disabled={isUploading}
                        className={`h-8 w-8 p-0 flex-shrink-0 ${
                          isDarkMode
                            ? "hover:bg-[rgba(255,255,255,0.1)] text-[rgba(229,229,229,0.70)]"
                            : "hover:bg-[rgba(55,50,47,0.1)] text-[#605A57]"
                        } transition-colors duration-200`}
                        title="Upload file"
                      >
                        {isUploading ? <LoaderIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                      </Button>

                      <div className="flex-1 min-h-[24px] max-h-32">
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Ask Griffin anything about your code, or paste code directly for analysis..."
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
      </div>
    </div>
  )
}

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
import { CodeMessage } from "@/components/chat/code-message"
import { useJobTracker } from "@/hooks/use-job-tracker"
import apiService, { type ReviewSubmissionData, type CodeReviewResult } from "@/lib/api-service"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  jobId?: string
  reviewResult?: CodeReviewResult
}

interface DebugLog {
  id: string
  timestamp: Date
  type: "info" | "error" | "success" | "warning"
  message: string
  data?: any
}

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 -12 158 158">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6.72129 53.8326C5.22886 54.369 3.79008 55.0461 2.42414 55.8549C1.99492 56.0692 1.62306 56.3841 1.33985 56.7732C1.05664 57.1622 0.870351 57.614 0.796627 58.0907C0.728141 58.9623 1.18429 59.8347 2.14826 60.6823C2.95005 61.3417 3.81412 61.9203 4.72808 62.4099C5.42909 62.8132 6.14303 63.1944 6.85696 63.575C7.87906 64.1201 8.93607 64.6808 9.92071 65.3035C23.2735 73.7162 35.4245 81.1753 48.7508 87.2021C48.7223 87.6822 48.6907 88.1609 48.6584 88.6377C48.5679 89.9855 48.4749 91.3782 48.4729 92.7533C48.4699 94.8297 48.4618 96.9073 48.4484 98.9863C48.4141 105.578 48.3786 112.395 48.5989 119.098C48.6784 121.515 49.5403 123.243 51.0256 123.964C52.5872 124.719 54.5946 124.279 56.6783 122.719C57.4297 122.156 58.1998 121.524 59.032 120.785C62.6824 117.545 66.3277 114.298 70.0078 111.02L73.343 108.049C73.3682 108.068 73.3927 108.087 73.4153 108.107L76.4991 110.778C80.01 113.816 83.6397 116.957 87.1829 120.08C88.1921 120.967 89.2071 121.85 90.2279 122.727C93.3395 125.417 96.5596 128.198 99.4515 131.179C100.984 132.756 102.474 133.498 104.264 133.498C105.036 133.487 105.803 133.372 106.546 133.158C109.158 132.442 110.843 130.835 112.011 127.954C116.411 117.096 120.915 106.068 125.269 95.4041C128.844 86.644 132.416 77.8832 135.985 69.1212C143.674 50.3116 150.308 31.082 155.854 11.5231C156.526 9.25442 156.998 6.93056 157.266 4.57852C157.355 4.03355 157.322 3.47531 157.169 2.945C157.015 2.41468 156.745 1.92589 156.379 1.51476C155.937 1.11363 155.412 0.817045 154.841 0.646857C154.272 0.476668 153.671 0.437215 153.083 0.531243C152.306 0.62523 151.539 0.799482 150.796 1.05151L150.696 1.08216C149.028 1.58303 147.355 2.06949 145.682 2.5567C141.796 3.6879 137.778 4.85757 133.878 6.19107C105.715 15.8287 77.1517 26.3209 48.9821 37.3766C40.8575 40.564 32.5849 43.7787 24.5844 46.8861C18.6266 49.1966 12.6722 51.5121 6.72129 53.8326ZM60.3339 83.5438C61.8845 82.2395 63.3543 81.0069 64.863 79.8484C70.7773 75.3015 76.6975 70.7617 82.6228 66.2304C94.2653 57.3147 106.305 48.0953 118.081 38.9404C121.682 36.1433 125.099 32.9988 128.404 29.9637C129.539 28.9229 130.673 27.8776 131.816 26.8465C132.728 26.0243 134.254 24.6486 133.408 21.9607C133.38 21.8729 133.335 21.7918 133.275 21.7225C133.215 21.6532 133.141 21.5973 133.059 21.5582C132.976 21.5193 132.886 21.4978 132.794 21.4951C132.703 21.4924 132.612 21.5085 132.527 21.5424C132.174 21.6862 131.833 21.8131 131.504 21.9328C130.819 22.1684 130.152 22.4534 129.508 22.7856C107.655 34.7331 88.645 50.3999 70.2617 65.552C66.1042 68.9781 62.1856 72.5122 58.0409 76.2499C56.2809 77.8377 54.5032 79.432 52.7074 81.0335L11.7046 58.6697C11.9409 58.5229 12.189 58.3963 12.4463 58.2911C19.0407 55.791 25.6326 53.2819 32.2218 50.7636C48.3566 44.61 65.0432 38.2463 81.5231 32.1929C96.1997 26.8017 111.219 21.5788 125.743 16.5278C130.572 14.8487 135.401 13.1663 140.228 11.4807C142.099 10.8263 143.986 10.3144 145.986 9.77318C146.515 9.63008 147.047 9.48508 147.581 9.33807C139.534 35.016 129.269 60.2022 119.336 84.5728C114.116 97.3783 108.723 110.61 103.68 123.835C89.9733 112.724 76.6781 100.978 63.8163 89.6134C62.0792 88.077 60.3384 86.5399 58.5939 85.0022C59.187 84.5045 59.7653 84.0193 60.3319 83.5438H60.3339ZM67.952 103.131L56.1931 113.163L55.2608 91.3281L67.952 103.131Z"
      fill="currentColor"
    />
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

const BotIconUpdated = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { isDarkMode } = useTheme()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([])
  
  // Add request management
  const [currentRequest, setCurrentRequest] = useState<AbortController | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stateResetTimeout, setStateResetTimeout] = useState<NodeJS.Timeout | null>(null)

  const addDebugLog = (type: DebugLog["type"], message: string, data?: any) => {
    const log: DebugLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      data,
    }
    setDebugLogs((prev) => [...prev, log].slice(-50)) // Keep only last 50 logs
  }

  // Safety mechanism to reset states after a timeout
  const setSafetyTimeout = () => {
    if (stateResetTimeout) {
      clearTimeout(stateResetTimeout)
    }
    
    const timeout = setTimeout(() => {
      console.log("[RequestManager] Safety timeout triggered - resetting states")
      resetStates()
    }, 30000) // 30 seconds timeout
    
    setStateResetTimeout(timeout)
  }

  // Cancel any ongoing request
  const cancelCurrentRequest = () => {
    if (currentRequest) {
      console.log("[RequestManager] Cancelling current request")
      currentRequest.abort()
      setCurrentRequest(null)
    }
  }

  // Reset all loading states
  const resetStates = () => {
    console.log("[RequestManager] Resetting all states")
    setIsLoading(false)
    setIsUploading(false)
    setIsProcessing(false)
    cancelCurrentRequest()
    
    // Clear any existing timeout
    if (stateResetTimeout) {
      clearTimeout(stateResetTimeout)
      setStateResetTimeout(null)
    }
  }

  const {
    jobStatus,
    isCompleted,
    isFailed,
    error: jobError,
  } = useJobTracker(currentJobId, {
    onComplete: (result) => {
      console.log("Job completed with result:", result)

      // Reset states first to prevent duplicate processing
      resetStates()
      
      // Enhanced completion handling with better response display
      const completionMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "assistant",
        content: result?.message || "Analysis complete! Here are your detailed results:",
        timestamp: new Date(),
        reviewResult: result?.data || result, // Use data field from new response structure
      }
      setMessages((prev) => [...prev, completionMessage])
      setCurrentJobId(null)
    },
    onError: (error) => {
      console.error("Job failed:", error)

      // Reset states on error
      resetStates()

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelCurrentRequest()
    }
  }, [])

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log("[StateMonitor]", {
      isLoading,
      isUploading,
      isProcessing,
      hasCurrentRequest: !!currentRequest,
      currentJobId
    })
  }, [isLoading, isUploading, isProcessing, currentRequest, currentJobId])

  const handleFileUpload = async (file: File) => {
    // Prevent multiple concurrent uploads
    if (isUploading || isProcessing) {
      console.log("[RequestManager] Upload blocked - request already in progress")
      return
    }

    // Cancel any existing request and reset states
    cancelCurrentRequest()
    resetStates()
    setIsUploading(true)
    setIsProcessing(true)

    // Create new abort controller for this request
    const abortController = new AbortController()
    setCurrentRequest(abortController)

    try {
      console.log("[RequestManager] Starting file upload:", file.name)
      
      const result = await apiService.uploadFile(file)

      // Check if request was aborted
      if (abortController.signal.aborted) {
        console.log("[RequestManager] File upload was cancelled")
        return
      }

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
          console.log(`Started tracking job: ${result.jobId}`)
          // Reset processing state but keep loading for job tracking
          setIsProcessing(false)
          setCurrentRequest(null)
        } else {
          // No job tracking needed, reset all states
          resetStates()
        }
      } else {
        throw new Error(result.message || "Upload failed")
      }
    } catch (error) {
      if (abortController.signal.aborted) {
        console.log("[RequestManager] File upload was cancelled")
        return
      }
      
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
      resetStates()
    }
  }

  const handleCodeSubmission = async (code: string) => {
    if (!code.trim()) return

    // Prevent multiple concurrent submissions
    if (isLoading || isProcessing) {
      console.log("[RequestManager] Code submission blocked - request already in progress")
      return
    }

    // Cancel any existing request and reset states
    cancelCurrentRequest()
    resetStates()
    setIsLoading(true)
    setIsProcessing(true)
    setSafetyTimeout() // Set safety timeout

    // Create new abort controller for this request
    const abortController = new AbortController()
    setCurrentRequest(abortController)

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: `Submitted code for review:\n\`\`\`\n${code.substring(0, 200)}${code.length > 200 ? "..." : ""}\n\`\`\``,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      console.log("[RequestManager] Starting code submission")
      
      const submissionData: ReviewSubmissionData = {
        code: code.trim(),
      }

      const result = await apiService.submitReview(submissionData, abortController.signal)
      
      // Check if request was aborted
      if (abortController.signal.aborted) {
        console.log("[RequestManager] Code submission was cancelled")
        return
      }
      
      console.log("Code submission result:", result)
      addDebugLog("info", "Code submission completed", result)

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
          console.log(`Started tracking code review job: ${result.jobId}`)
          // Reset processing state but keep loading for job tracking
          setIsProcessing(false)
          setCurrentRequest(null)
        } else if (result.data) {
          // Handle immediate results
          const resultMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: "assistant",
            content: "Here are your code review results:",
            timestamp: new Date(),
            reviewResult: result.data,
          }
          setMessages((prev) => [...prev, resultMessage])
          resetStates() // Reset here since no job tracking needed
        } else {
          // No jobId and no immediate data - something's wrong, reset states
          console.warn("[RequestManager] No jobId or data in response, resetting states")
          resetStates()
        }
      } else {
        throw new Error(result.message || "Submission failed")
      }
    } catch (error) {
      if (abortController.signal.aborted) {
        console.log("[RequestManager] Code submission was cancelled")
        return
      }
      
      console.error("Code submission error:", error)
      addDebugLog("error", "Code submission failed", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to submit code. Please try again."

      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Sorry, I encountered an error while analyzing your code: ${errorMessage}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorAssistantMessage])
      resetStates()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading || isProcessing) {
      console.log("[RequestManager] Submit blocked - request already in progress or empty message")
      return
    }

    // Cancel any existing request first
    cancelCurrentRequest()
    setIsLoading(true)

    const jobStatusPattern = /job[s]?\s*(status|result|response)/i
    const jobIdPattern = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i

    const isJobStatusQuery = jobStatusPattern.test(message.trim())
    const jobIdMatch = message.trim().match(jobIdPattern)

    if (isJobStatusQuery && jobIdMatch) {
      const jobId = jobIdMatch[1]

      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: message.trim(),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setMessage("")
      setIsLoading(true)

      try {
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
        console.error("Job status fetch error:", error)
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

    const looksLikeCode = codePatterns.some((pattern) => pattern.test(message.trim())) && message.trim().length > 50

    if (looksLikeCode) {
      await handleCodeSubmission(message.trim())
      setMessage("")
      // Don't set isLoading to false here - let handleCodeSubmission manage states
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsLoading(false)
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
      } overflow-hidden transition-colors duration-500`}
    >
      <div className="relative z-20 h-[84px]">
        <Navigation />
      </div>

      <div className="flex h-[calc(100vh-84px)]">
        <div className="flex-1 w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] mx-auto relative">
          <div className="h-full relative z-10 flex flex-col">
            <ScrollArea className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500">
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

                <div className="space-y-4 sm:space-y-6 py-4 sm:py-8 pb-8">
                  {currentJobId && (
                    <div className="px-2 sm:px-4">
                      <JobTracker
                        jobId={currentJobId}
                        onComplete={(result) => {
                          console.log("Job tracker completed:", result)
                          addDebugLog("success", "Job completed successfully", result)
                        }}
                        onError={(error) => {
                          console.error("Job tracker error:", error)
                          addDebugLog("error", "Job failed", error)
                        }}
                      />
                    </div>
                  )}


                  {messages.map((message) => (
                    <div key={message.id} className="group">
                      <div className="flex gap-3 sm:gap-4 px-2 sm:px-4 py-4 sm:py-6">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                          {message.type === "user" ? (
                            <UserIcon className="h-4 w-4 text-white" />
                          ) : (
                            <BotIconUpdated className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"
                            } transition-colors duration-500`}
                          >
                            {message.type === "user" ? user?.username || "You" : "Griffin"}
                          </div>
                          <div className="prose prose-sm max-w-none break-words overflow-hidden">
                            <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere">
                              <CodeMessage content={message.content} />
                            </div>
                            {message.reviewResult && (
                              <div className="mt-4 overflow-hidden">
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
                      <div className="flex gap-3 sm:gap-4 px-2 sm:px-4 py-4 sm:py-6">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <LoaderIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
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
              } px-2 sm:px-4 py-4 sm:py-6 transition-colors duration-500`}
            >
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit}>
                  <div
                    className={`relative ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} rounded-3xl border ${
                      isDarkMode ? "border-[rgba(255,255,255,0.15)]" : "border-[#E0DEDB]"
                    } shadow-sm transition-all duration-200`}
                  >
                    <div className="flex items-end gap-2 sm:gap-3 p-3 sm:p-4">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleFileButtonClick}
                        disabled={isUploading || isProcessing}
                        className={`h-8 w-8 p-0 flex-shrink-0 ${
                          isDarkMode
                            ? "hover:bg-[rgba(255,255,255,0.1)] text-[rgba(229,229,229,0.70)]"
                            : "hover:bg-[rgba(55,50,47,0.1)] text-[#605A57]"
                        } transition-colors duration-200`}
                        title="Upload file"
                      >
                        {isUploading ? <LoaderIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                      </Button>

                      <div className="flex-1 min-w-0 min-h-[24px] max-h-32 sm:max-h-40">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Ask Griffin"
                          className={`w-full bg-transparent ${
                            isDarkMode
                              ? "text-[#e5e5e5] placeholder-[rgba(229,229,229,0.70)]"
                              : "text-[#49423D] placeholder-[#605A57]"
                          } resize-none border-none outline-none text-sm sm:text-base leading-5 sm:leading-6 transition-colors duration-500 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500`}
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleSubmit(e as any)
                            }
                          }}
                          style={{
                            height: "auto",
                            minHeight: "24px",
                            maxHeight: window.innerWidth < 640 ? "128px" : "160px",
                          }}
                          ref={(textarea) => {
                            if (textarea) {
                              const adjustHeight = () => {
                                textarea.style.height = "auto"
                                const maxHeight = window.innerWidth < 640 ? 128 : 160
                                textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px"
                              }

                              // Initial adjustment
                              adjustHeight()

                              // Add event listener for input changes
                              const handleInput = () => adjustHeight()
                              textarea.addEventListener("input", handleInput)

                              // Cleanup
                              return () => {
                                textarea.removeEventListener("input", handleInput)
                              }
                            }
                          }}
                        />
                      </div>

                      {/* Debug button for development - remove in production */}
                      {process.env.NODE_ENV === "development" && (isLoading || isProcessing) && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log("[Debug] Manual state reset triggered")
                            resetStates()
                          }}
                          className="h-8 px-2 text-xs"
                          title="Reset states (debug)"
                        >
                          Reset
                        </Button>
                      )}

                      <Button
                        type="submit"
                        size="sm"
                        disabled={!message.trim() || isLoading || isProcessing}
                        className="h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!message.trim() ? "Enter a message" : (isLoading || isProcessing) ? "Processing..." : "Send message"}
                      >
                        {isLoading || isProcessing ? <LoaderIcon className="w-4 h-4" /> : <SendIcon className="w-4 h-4" />}
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

"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useTheme } from "@/lib/theme-context"
import apiService, { type JobStatus } from "@/lib/api-service"

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

interface JobTrackerProps {
  jobId: string
  onComplete?: (result: any) => void
  onError?: (error: string) => void
}

export function JobTracker({ jobId, onComplete, onError }: JobTrackerProps) {
  const { isDarkMode } = useTheme()
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobStatus = useCallback(async () => {
    try {
      const status = await apiService.getJobStatus(jobId)
      setJobStatus(status)

      if (status.status === "completed") {
        setIsPolling(false)
        onComplete?.(status.result)
      } else if (status.status === "failed") {
        setIsPolling(false)
        const errorMsg = status.error || "Job failed"
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err) {
      console.error("Error fetching job status:", err)
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch job status"
      setError(errorMsg)
      setIsPolling(false)
      onError?.(errorMsg)
    }
  }, [jobId, onComplete, onError])

  const fetchImmediateStatus = useCallback(async () => {
    try {
      const status = await apiService.getJobStatusImmediate(jobId)
      setJobStatus(status)

      if (status.status === "completed") {
        setIsPolling(false)
        onComplete?.(status.result)
      } else if (status.status === "failed") {
        setIsPolling(false)
        const errorMsg = status.error || "Job failed"
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err) {
      console.error("Error fetching immediate job status:", err)
      // Fall back to regular polling if immediate fails
      fetchJobStatus()
    }
  }, [jobId, onComplete, onError, fetchJobStatus])

  useEffect(() => {
    if (!isPolling) return

    // Try immediate status first
    fetchImmediateStatus()

    // Set up polling for regular status updates
    const interval = setInterval(fetchJobStatus, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [isPolling, fetchJobStatus, fetchImmediateStatus])

  const getStatusBadge = () => {
    if (!jobStatus) return null

    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        icon: <ClockIcon className="w-3 h-3" />,
      },
      processing: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        icon: <LoaderIcon className="w-3 h-3" />,
      },
      completed: {
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        icon: <CheckIcon className="w-3 h-3" />,
      },
      failed: {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: <XIcon className="w-3 h-3" />,
      },
    }

    const config = statusConfig[jobStatus.status]

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {jobStatus.status.charAt(0).toUpperCase() + jobStatus.status.slice(1)}
      </Badge>
    )
  }

  const getProgressValue = () => {
    if (!jobStatus) return 0
    if (jobStatus.progress !== undefined) return jobStatus.progress

    switch (jobStatus.status) {
      case "pending":
        return 10
      case "processing":
        return 50
      case "completed":
        return 100
      case "failed":
        return 0
      default:
        return 0
    }
  }

  if (error) {
    return (
      <Card
        className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Job Failed</CardTitle>
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1">
              <XIcon className="w-3 h-3" />
              Failed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p
            className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500`}
          >
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 bg-transparent"
            onClick={() => {
              setError(null)
              setIsPolling(true)
              fetchJobStatus()
            }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Analysis Progress</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription className="text-xs">Job ID: {jobId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Progress value={getProgressValue()} className="h-2" />

          {jobStatus && (
            <div className="flex justify-between text-xs">
              <span
                className={`${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500`}
              >
                Started: {new Date(jobStatus.createdAt).toLocaleTimeString()}
              </span>
              <span
                className={`${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500`}
              >
                {getProgressValue()}%
              </span>
            </div>
          )}

          {jobStatus?.status === "processing" && (
            <p
              className={`text-xs ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500`}
            >
              Analyzing your code for security vulnerabilities, best practices, and optimization opportunities...
            </p>
          )}

          {jobStatus?.status === "completed" && (
            <p className={`text-xs ${isDarkMode ? "text-green-400" : "text-green-600"} transition-colors duration-500`}>
              Analysis complete! Results are ready.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

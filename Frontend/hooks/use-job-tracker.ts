"use client"

import { useState, useEffect, useCallback } from "react"
import apiService, { type JobStatus } from "@/lib/api-service"

interface UseJobTrackerOptions {
  pollInterval?: number
  onComplete?: (result: any) => void
  onError?: (error: string) => void
  autoStart?: boolean
}

export function useJobTracker(jobId: string | null, options: UseJobTrackerOptions = {}) {
  const { pollInterval = 2000, onComplete, onError, autoStart = true } = options

  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [isPolling, setIsPolling] = useState(autoStart && !!jobId)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchJobStatus = useCallback(async () => {
    if (!jobId) return

    setIsLoading(true)
    try {
      const status = await apiService.getJobStatus(jobId)
      setJobStatus(status)
      setError(null)

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
    } finally {
      setIsLoading(false)
    }
  }, [jobId, onComplete, onError])

  const fetchImmediateStatus = useCallback(async () => {
    if (!jobId) return

    try {
      const status = await apiService.getJobStatusImmediate(jobId)
      setJobStatus(status)
      setError(null)

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

  const startPolling = useCallback(() => {
    if (jobId) {
      setIsPolling(true)
      setError(null)
    }
  }, [jobId])

  const stopPolling = useCallback(() => {
    setIsPolling(false)
  }, [])

  const retry = useCallback(() => {
    setError(null)
    setIsPolling(true)
    if (jobId) {
      fetchJobStatus()
    }
  }, [jobId, fetchJobStatus])

  useEffect(() => {
    if (!isPolling || !jobId) return

    // Try immediate status first
    fetchImmediateStatus()

    // Set up polling for regular status updates
    const interval = setInterval(fetchJobStatus, pollInterval)

    return () => clearInterval(interval)
  }, [isPolling, jobId, pollInterval, fetchJobStatus, fetchImmediateStatus])

  // Reset state when jobId changes
  useEffect(() => {
    if (jobId) {
      setJobStatus(null)
      setError(null)
      setIsPolling(autoStart)
    } else {
      setIsPolling(false)
    }
  }, [jobId, autoStart])

  const getProgress = useCallback(() => {
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
  }, [jobStatus])

  return {
    jobStatus,
    isPolling,
    error,
    isLoading,
    progress: getProgress(),
    startPolling,
    stopPolling,
    retry,
    isCompleted: jobStatus?.status === "completed",
    isFailed: jobStatus?.status === "failed",
    isPending: jobStatus?.status === "pending",
    isProcessing: jobStatus?.status === "processing",
  }
}

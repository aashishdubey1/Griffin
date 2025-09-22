"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import { Navigation } from "@/components/navigation"
import { CodeInputForm } from "@/components/code-review/code-input-form"
import { ReviewResults } from "@/components/code-review/review-results"
import { JobTracker } from "@/components/job-status/job-tracker"
import { useJobTracker } from "@/hooks/use-job-tracker"
import type { ReviewSubmissionData, ReviewResponse } from "@/lib/api-service"

export default function ReviewPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { isDarkMode } = useTheme()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [reviewResult, setReviewResult] = useState<ReviewResponse["result"] | null>(null)
  const [submissionData, setSubmissionData] = useState<ReviewSubmissionData | null>(null)

  const {
    jobStatus,
    isCompleted,
    isFailed,
    error: jobError,
  } = useJobTracker(currentJobId, {
    onComplete: (result) => {
      console.log("[v0] Review job completed:", result)
      setReviewResult(result)
      setCurrentJobId(null)
      setIsSubmitting(false)
    },
    onError: (error) => {
      console.error("[v0] Review job failed:", error)
      setCurrentJobId(null)
      setIsSubmitting(false)
    },
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleCodeSubmission = (data: ReviewSubmissionData, jobId?: string) => {
    setSubmissionData(data)
    setIsSubmitting(true)

    if (jobId) {
      setCurrentJobId(jobId)
      console.log(`[v0] Started tracking review job: ${jobId}`)
    } else {
      // Handle immediate results or errors
      setIsSubmitting(false)
    }
  }

  const handleNewReview = () => {
    setReviewResult(null)
    setSubmissionData(null)
    setCurrentJobId(null)
    setIsSubmitting(false)
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
    <div className={`min-h-screen ${isDarkMode ? "bg-[#1a1a1a]" : "bg-[#F7F5F3]"} transition-colors duration-500`}>
      <div className="relative z-20 h-[84px]">
        <Navigation />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1
              className={`text-3xl font-semibold ${
                isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"
              } transition-colors duration-500`}
            >
              Code Review
            </h1>
            <p
              className={`${
                isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"
              } max-w-2xl mx-auto transition-colors duration-500`}
            >
              Submit your code for comprehensive analysis including security vulnerabilities, best practices, and
              optimization opportunities.
            </p>
          </div>

          {/* Job Tracker */}
          {currentJobId && (
            <JobTracker
              jobId={currentJobId}
              onComplete={(result) => {
                console.log("[v0] Job tracker completed:", result)
              }}
              onError={(error) => {
                console.error("[v0] Job tracker error:", error)
              }}
            />
          )}

          {/* Results */}
          {reviewResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"
                  } transition-colors duration-500`}
                >
                  Review Results
                </h2>
                <button
                  onClick={handleNewReview}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    isDarkMode
                      ? "bg-[#2a2a2a] text-[#e5e5e5] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)]"
                      : "bg-white text-[#49423D] hover:bg-[#F7F5F3] border border-[#E0DEDB]"
                  } transition-colors duration-500`}
                >
                  New Review
                </button>
              </div>
              <ReviewResults result={reviewResult} />
            </div>
          )}

          {/* Code Input Form */}
          {!reviewResult && <CodeInputForm onSubmit={handleCodeSubmission} isSubmitting={isSubmitting} />}
        </div>
      </div>
    </div>
  )
}

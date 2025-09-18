"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/lib/theme-context"
import type { ReviewResponse } from "@/lib/api-service"

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
)

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
)

interface ReviewResultsProps {
  result: ReviewResponse["result"]
}

export function ReviewResults({ result }: ReviewResultsProps) {
  const { isDarkMode } = useTheme()

  if (!result) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card
        className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`${isDarkMode ? "text-[rgba(229,229,229,0.85)]" : "text-[#605A57]"} leading-relaxed transition-colors duration-500`}
          >
            {result.summary}
          </p>
        </CardContent>
      </Card>

      {/* Security Vulnerabilities */}
      {result.vulnerabilities && result.vulnerabilities.length > 0 && (
        <Card
          className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldIcon className="w-5 h-5 text-red-500" />
              Security Vulnerabilities
              <Badge variant="destructive">{result.vulnerabilities.length}</Badge>
            </CardTitle>
            <CardDescription>Critical security issues that need immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.vulnerabilities.map((vuln, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span
                          className={`font-medium ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}
                        >
                          {vuln.type}
                        </span>
                        <Badge className={getSeverityColor(vuln.severity)}>{vuln.severity}</Badge>
                        {vuln.line && <Badge variant="outline">Line {vuln.line}</Badge>}
                      </div>
                      <p
                        className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500 mb-2`}
                      >
                        {vuln.description}
                      </p>
                      {vuln.suggestion && (
                        <div
                          className={`text-sm p-3 rounded-md ${isDarkMode ? "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)]" : "bg-[#F7F5F3] border border-[#E0DEDB]"} transition-colors duration-500`}
                        >
                          <strong
                            className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}
                          >
                            Suggestion:
                          </strong>{" "}
                          {vuln.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < result.vulnerabilities.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best Practices */}
      {result.bestPractices && result.bestPractices.length > 0 && (
        <Card
          className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-blue-500" />
              Best Practices
              <Badge variant="secondary">{result.bestPractices.length}</Badge>
            </CardTitle>
            <CardDescription>Recommendations to improve code quality and maintainability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.bestPractices.map((practice, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-medium ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}
                        >
                          {practice.type}
                        </span>
                        {practice.line && <Badge variant="outline">Line {practice.line}</Badge>}
                      </div>
                      <p
                        className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500 mb-2`}
                      >
                        {practice.description}
                      </p>
                      <div
                        className={`text-sm p-3 rounded-md ${isDarkMode ? "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)]" : "bg-[#F7F5F3] border border-[#E0DEDB]"} transition-colors duration-500`}
                      >
                        <strong
                          className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}
                        >
                          Suggestion:
                        </strong>{" "}
                        {practice.suggestion}
                      </div>
                    </div>
                  </div>
                  {index < result.bestPractices.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refactoring Suggestions */}
      {result.refactoring && result.refactoring.length > 0 && (
        <Card
          className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshIcon className="w-5 h-5 text-green-500" />
              Refactoring Opportunities
              <Badge variant="secondary">{result.refactoring.length}</Badge>
            </CardTitle>
            <CardDescription>Suggestions to improve performance, readability, and architecture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.refactoring.map((refactor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <RefreshIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-medium ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}
                        >
                          {refactor.type}
                        </span>
                        <Badge className={getImpactColor(refactor.impact)}>{refactor.impact} impact</Badge>
                        {refactor.line && <Badge variant="outline">Line {refactor.line}</Badge>}
                      </div>
                      <p
                        className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500 mb-2`}
                      >
                        {refactor.description}
                      </p>
                      <div
                        className={`text-sm p-3 rounded-md ${isDarkMode ? "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)]" : "bg-[#F7F5F3] border border-[#E0DEDB]"} transition-colors duration-500`}
                      >
                        <strong
                          className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}
                        >
                          Suggestion:
                        </strong>{" "}
                        {refactor.suggestion}
                      </div>
                    </div>
                  </div>
                  {index < result.refactoring.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

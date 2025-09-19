"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/lib/theme-context"
import type { CodeReviewResult } from "@/lib/api-service"

// Icon components
const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const SpeedIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const ClipboardCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

interface ReviewResultsProps {
  result: CodeReviewResult
}

export function ReviewResults({ result }: ReviewResultsProps) {
  const { isDarkMode } = useTheme()

  if (!result) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "warning": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "low": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Summary - Always shown at the top */}
      <Card className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`${isDarkMode ? "text-[rgba(229,229,229,0.85)]" : "text-[#605A57]"} leading-relaxed transition-colors duration-500`}>
            {result.summary}
          </p>
        </CardContent>
      </Card>

      {/* Security Vulnerabilities */}
      {result.vulnerabilities && result.vulnerabilities.length > 0 && (
        <Card className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}>
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
                  <div className="flex items-start gap-2">
                    <AlertTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}>
                          {vuln.type}
                        </span>
                        <Badge className={getSeverityColor(vuln.severity)}>{vuln.severity}</Badge>
                        {vuln.line && <Badge variant="outline">Line {vuln.line}</Badge>}
                      </div>
                      <p className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500 mb-2`}>
                        {vuln.description}
                      </p>
                      {vuln.suggestion && (
                        <div className={`text-sm p-3 rounded-md ${isDarkMode ? "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)]" : "bg-[#F7F5F3] border border-[#E0DEDB]"} transition-colors duration-500`}>
                          <strong className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}>Suggestion:</strong> {vuln.suggestion}
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
                          {practice.category}
                        </span>
                        <Badge className={getSeverityColor(practice.severity)}>{practice.severity}</Badge>
                        {practice.lineNumber && <Badge variant="outline">Line {practice.lineNumber}</Badge>}
                      </div>
                      <p
                        className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500 mb-2`}
                      >
                        {practice.message}
                      </p>
                      <div
                        className={`text-sm p-3 rounded-md ${isDarkMode ? "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)]" : "bg-[#F7F5F3] border border-[#E0DEDB]"} transition-colors duration-500`}
                      >
                        <strong
                          className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}
                        >
                          Suggestion:
                        </strong>{" "}
                        {/* No suggestion property in best practices from the JSON */}
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
                          Refactoring Suggestion
                        </span>
                        <Badge className={getImpactColor(refactor.impact)}>{refactor.impact} impact</Badge>
                        {refactor.lineNumber && <Badge variant="outline">Line {refactor.lineNumber}</Badge>}
                      </div>
                      <p
                        className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500 mb-2`}
                      >
                        {refactor.suggestion}
                      </p>
                      <div
                        className={`text-sm p-3 rounded-md ${isDarkMode ? "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)]" : "bg-[#F7F5F3] border border-[#E0DEDB]"} transition-colors duration-500`}
                      >
                        <strong
                          className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}
                        >
                          Suggestion:
                        </strong>{" "}
                        {/* Suggestion is already displayed above as main content */}
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

      {/* Performance Issues */}
      {result.performance && result.performance.length > 0 && (
        <Card className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SpeedIcon className="w-5 h-5 text-purple-500" />
              Performance Issues
              <Badge variant="secondary">{result.performance.length}</Badge>
            </CardTitle>
            <CardDescription>Performance bottlenecks and optimization opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.performance.map((perf, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <SpeedIcon className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}>
                          Performance Issue
                        </span>
                        <Badge className={getImpactColor(perf.impact)}>{perf.impact} impact</Badge>
                        {perf.lineNumber && <Badge variant="outline">Line {perf.lineNumber}</Badge>}
                      </div>
                      <p className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500 mb-2`}>
                        {perf.issue}
                      </p>
                      <div className={`text-sm p-3 rounded-md ${isDarkMode ? "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)]" : "bg-[#F7F5F3] border border-[#E0DEDB]"} transition-colors duration-500`}>
                        <strong className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}>Suggestion:</strong> {perf.suggestion}
                      </div>
                    </div>
                  </div>
                  {index < result.performance.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintainability */}
      {result.maintainability && (result.maintainability.score || result.maintainability.issues.length > 0) && (
        <Card className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-indigo-500" />
              Maintainability
              {result.maintainability.score && (
                <Badge variant="outline" className={getScoreColor(result.maintainability.score)}>
                  Score: {result.maintainability.score}/100
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Code maintainability analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {result.maintainability.issues && result.maintainability.issues.length > 0 && (
              <div className="space-y-4">
                {result.maintainability.issues.map((issue, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <BookOpenIcon className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}>
                            {issue.category}
                          </span>
                          {issue.lineNumber && <Badge variant="outline">Line {issue.lineNumber}</Badge>}
                        </div>
                        <p className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500 mb-2`}>
                          {issue.description}
                        </p>
                        <div className={`text-sm p-3 rounded-md ${isDarkMode ? "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)]" : "bg-[#F7F5F3] border border-[#E0DEDB]"} transition-colors duration-500`}>
                          <strong className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}>Suggestion:</strong> {issue.suggestion}
                        </div>
                      </div>
                    </div>
                    {index < result.maintainability.issues.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Complexity Analysis */}
      {result.complexity && (
        result.complexity.cyclomaticComplexity ||
        result.complexity.cognitiveComplexity ||
        (result.complexity.suggestions && result.complexity.suggestions.length > 0)
      ) && (
        <Card className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="w-5 h-5 text-orange-500" />
              Complexity Analysis
            </CardTitle>
            <CardDescription>Code complexity metrics and optimization suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(result.complexity.cyclomaticComplexity || result.complexity.cognitiveComplexity) && (
                <div className="flex gap-4">
                  {result.complexity.cyclomaticComplexity && (
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500`}>
                        Cyclomatic Complexity:
                      </span>
                      <Badge variant="outline" className={getScoreColor(result.complexity.cyclomaticComplexity * 10)}>
                        {result.complexity.cyclomaticComplexity}
                      </Badge>
                    </div>
                  )}
                  {result.complexity.cognitiveComplexity && (
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500`}>
                        Cognitive Complexity:
                      </span>
                      <Badge variant="outline" className={getScoreColor(result.complexity.cognitiveComplexity * 10)}>
                        {result.complexity.cognitiveComplexity}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              {result.complexity.suggestions && result.complexity.suggestions.length > 0 && (
                <div className="space-y-3">
                  {result.complexity.suggestions.map((suggestion, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangleIcon className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}>
                              Complexity Suggestion
                            </span>
                            {suggestion.lineNumber && <Badge variant="outline">Line {suggestion.lineNumber}</Badge>}
                          </div>
                          <p className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500 mb-2`}>
                            {suggestion.description}
                          </p>
                          <div className={`text-sm p-3 rounded-md ${isDarkMode ? "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)]" : "bg-[#F7F5F3] border border-[#E0DEDB]"} transition-colors duration-500`}>
                            <strong className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}>Suggestion:</strong> {suggestion.suggestion}
                          </div>
                        </div>
                      </div>
                      {index < result.complexity.suggestions.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation */}
      {result.documentation && (result.documentation.coverageScore || result.documentation.suggestions.length > 0) && (
        <Card className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-teal-500" />
              Documentation
              {result.documentation.coverageScore && (
                <Badge variant="outline" className={getScoreColor(result.documentation.coverageScore)}>
                  Coverage: {result.documentation.coverageScore}%
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Documentation coverage and improvement suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            {result.documentation.suggestions && result.documentation.suggestions.length > 0 && (
              <div className="space-y-3">
                {result.documentation.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <BookOpenIcon className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500`}>
                      {suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Testing */}
      {result.testing && (result.testing.recommendations.length > 0 || result.testing.coverageAnalysis) && (
        <Card className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheckIcon className="w-5 h-5 text-emerald-500" />
              Testing
            </CardTitle>
            <CardDescription>Test coverage analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.testing.coverageAnalysis && (
                <div className={`p-3 rounded-md ${isDarkMode ? "bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)]" : "bg-[#F7F5F3] border border-[#E0DEDB]"} transition-colors duration-500`}>
                  <strong className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}>Coverage Analysis:</strong>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500`}>
                    {result.testing.coverageAnalysis}
                  </p>
                </div>
              )}
              {result.testing.recommendations && result.testing.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className={`font-medium ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}>Recommendations:</h4>
                  {result.testing.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <ClipboardCheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className={`text-sm ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500`}>
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

// Add the missing sections that are not in the current component
// These would be added dynamically based on the backend response structure

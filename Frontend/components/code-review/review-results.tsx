"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/lib/theme-context"
import type { CodeReviewResult } from "@/lib/api-service"

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
  result: CodeReviewResult
}

export function ReviewResults({ result }: ReviewResultsProps) {
  const { isDarkMode } = useTheme()

  if (!result) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return isDarkMode
          ? "bg-gradient-to-r from-red-950/60 to-red-900/40 text-red-200 border border-red-800/40 shadow-sm"
          : "bg-gradient-to-r from-red-50 to-red-100/80 text-red-800 border border-red-300/60 shadow-sm"
      case "high":
        return isDarkMode
          ? "bg-gradient-to-r from-orange-950/60 to-orange-900/40 text-orange-200 border border-orange-800/40 shadow-sm"
          : "bg-gradient-to-r from-orange-50 to-orange-100/80 text-orange-800 border border-orange-300/60 shadow-sm"
      case "medium":
        return isDarkMode
          ? "bg-gradient-to-r from-amber-950/60 to-amber-900/40 text-amber-200 border border-amber-800/40 shadow-sm"
          : "bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-800 border border-amber-300/60 shadow-sm"
      case "low":
        return isDarkMode
          ? "bg-gradient-to-r from-blue-950/60 to-blue-900/40 text-blue-200 border border-blue-800/40 shadow-sm"
          : "bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-800 border border-blue-300/60 shadow-sm"
      default:
        return isDarkMode
          ? "bg-gradient-to-r from-slate-800/60 to-slate-700/40 text-slate-200 border border-slate-600/40 shadow-sm"
          : "bg-gradient-to-r from-slate-50 to-slate-100/80 text-slate-800 border border-slate-300/60 shadow-sm"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return isDarkMode
          ? "bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 text-emerald-200 border border-emerald-800/40 shadow-sm"
          : "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-800 border border-emerald-300/60 shadow-sm"
      case "medium":
        return isDarkMode
          ? "bg-gradient-to-r from-cyan-950/60 to-cyan-900/40 text-cyan-200 border border-cyan-800/40 shadow-sm"
          : "bg-gradient-to-r from-cyan-50 to-cyan-100/80 text-cyan-800 border border-cyan-300/60 shadow-sm"
      case "low":
        return isDarkMode
          ? "bg-gradient-to-r from-slate-800/60 to-slate-700/40 text-slate-200 border border-slate-600/40 shadow-sm"
          : "bg-gradient-to-r from-slate-50 to-slate-100/80 text-slate-800 border border-slate-300/60 shadow-sm"
      default:
        return isDarkMode
          ? "bg-gradient-to-r from-slate-800/60 to-slate-700/40 text-slate-200 border border-slate-600/40 shadow-sm"
          : "bg-gradient-to-r from-slate-50 to-slate-100/80 text-slate-800 border border-slate-300/60 shadow-sm"
    }
  }

  return (
    <div className="space-y-8">
      <Card
        className={`${
          isDarkMode
            ? "bg-gradient-to-br from-[#2a2a2a]/95 to-[#1f1f1f]/90 border-[rgba(255,255,255,0.15)] shadow-[0px_8px_32px_rgba(0,0,0,0.4)]"
            : "bg-gradient-to-br from-white to-[#F7F5F3]/80 border-[#E0DEDB]/60 shadow-[0px_8px_32px_rgba(50,45,43,0.08)]"
        } transition-all duration-500 hover:shadow-[0px_12px_48px_rgba(0,0,0,0.12)] hover:scale-[1.01]`}
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${isDarkMode ? "bg-emerald-900/30 shadow-inner" : "bg-emerald-100/80 shadow-sm"}`}
            >
              <CheckCircleIcon className={`w-6 h-6 ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`} />
            </div>
            <span
              className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} font-semibold text-xl tracking-tight`}
            >
              Analysis Summary
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`${
              isDarkMode ? "text-[rgba(229,229,229,0.85)]" : "text-[#605A57]"
            } leading-relaxed text-base transition-colors duration-500 text-pretty`}
          >
            {result.summary}
          </p>
        </CardContent>
      </Card>

      {result.vulnerabilities && result.vulnerabilities.length > 0 && (
        <Card
          className={`${
            isDarkMode
              ? "bg-gradient-to-br from-red-950/15 to-[#2a2a2a]/95 border-red-800/40 shadow-[0px_8px_32px_rgba(220,38,38,0.1)]"
              : "bg-gradient-to-br from-red-50/60 to-white border-red-200/80 shadow-[0px_8px_32px_rgba(220,38,38,0.06)]"
          } transition-all duration-500 hover:shadow-[0px_12px_48px_rgba(220,38,38,0.15)] hover:scale-[1.01]`}
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${isDarkMode ? "bg-red-900/30 shadow-inner" : "bg-red-100/80 shadow-sm"}`}
              >
                <ShieldIcon className={`w-6 h-6 ${isDarkMode ? "text-red-300" : "text-red-700"}`} />
              </div>
              <span
                className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} font-semibold text-xl tracking-tight`}
              >
                Security Vulnerabilities
              </span>
              <Badge
                className={`${
                  isDarkMode
                    ? "bg-gradient-to-r from-red-900/60 to-red-800/40 text-red-200 border-red-700/50 shadow-sm"
                    : "bg-gradient-to-r from-red-100 to-red-200/80 text-red-800 border-red-300/60 shadow-sm"
                } font-medium px-3 py-1`}
              >
                {result.vulnerabilities.length}
              </Badge>
            </CardTitle>
            <CardDescription className={`${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} text-base`}>
              Critical security issues that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {result.vulnerabilities.map((vuln, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? "bg-red-900/20" : "bg-red-100/60"}`}>
                          <AlertTriangleIcon className={`w-5 h-5 ${isDarkMode ? "text-red-300" : "text-red-600"}`} />
                        </div>
                        <span
                          className={`font-semibold text-lg ${
                            isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"
                          } transition-colors duration-500`}
                        >
                          {vuln.type}
                        </span>
                        <Badge className={`${getSeverityColor(vuln.severity)} px-3 py-1 font-medium`}>
                          {vuln.severity}
                        </Badge>
                        {vuln.line && (
                          <Badge
                            className={`${
                              isDarkMode
                                ? "bg-[rgba(255,255,255,0.08)] text-[rgba(229,229,229,0.85)] border-[rgba(255,255,255,0.15)]"
                                : "bg-[#F7F5F3] text-[#605A57] border-[#E0DEDB]/60"
                            } px-3 py-1 shadow-sm`}
                          >
                            Line {vuln.line}
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-base ${
                          isDarkMode ? "text-[rgba(229,229,229,0.85)]" : "text-[#605A57]"
                        } transition-colors duration-500 mb-4 leading-relaxed text-pretty`}
                      >
                        {vuln.description}
                      </p>
                      {vuln.suggestion && (
                        <div
                          className={`text-base p-5 rounded-xl ${
                            isDarkMode
                              ? "bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] shadow-inner"
                              : "bg-[#F7F5F3]/80 border border-[#E0DEDB]/60 shadow-sm"
                          } transition-colors duration-500`}
                        >
                          <strong
                            className={`${
                              isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"
                            } transition-colors duration-500 text-base`}
                          >
                            💡 Suggestion:
                          </strong>{" "}
                          <span
                            className={`${isDarkMode ? "text-[rgba(229,229,229,0.85)]" : "text-[#605A57]"} text-pretty`}
                          >
                            {vuln.suggestion}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < result.vulnerabilities.length - 1 && (
                    <Separator className={`${isDarkMode ? "bg-[rgba(255,255,255,0.12)]" : "bg-[#E0DEDB]/60"} my-6`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result.bestPractices && result.bestPractices.length > 0 && (
        <Card
          className={`${
            isDarkMode
              ? "bg-gradient-to-br from-blue-950/15 to-[#2a2a2a]/95 border-blue-800/40 shadow-[0px_8px_32px_rgba(59,130,246,0.1)]"
              : "bg-gradient-to-br from-blue-50/60 to-white border-blue-200/80 shadow-[0px_8px_32px_rgba(59,130,246,0.06)]"
          } transition-all duration-500 hover:shadow-[0px_12px_48px_rgba(59,130,246,0.15)] hover:scale-[1.01]`}
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${isDarkMode ? "bg-blue-900/30 shadow-inner" : "bg-blue-100/80 shadow-sm"}`}
              >
                <CheckCircleIcon className={`w-6 h-6 ${isDarkMode ? "text-blue-300" : "text-blue-700"}`} />
              </div>
              <span
                className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} font-semibold text-xl tracking-tight`}
              >
                Best Practices
              </span>
              <Badge
                className={`${
                  isDarkMode
                    ? "bg-gradient-to-r from-blue-900/60 to-blue-800/40 text-blue-200 border-blue-700/50 shadow-sm"
                    : "bg-gradient-to-r from-blue-100 to-blue-200/80 text-blue-800 border-blue-300/60 shadow-sm"
                } font-medium px-3 py-1`}
              >
                {result.bestPractices.length}
              </Badge>
            </CardTitle>
            <CardDescription className={`${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} text-base`}>
              Recommendations to improve code quality and maintainability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {result.bestPractices.map((practice, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg mt-1 ${isDarkMode ? "bg-blue-900/20" : "bg-blue-100/60"}`}>
                      <CheckCircleIcon className={`w-5 h-5 ${isDarkMode ? "text-blue-300" : "text-blue-600"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <span
                          className={`font-semibold text-lg ${
                            isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"
                          } transition-colors duration-500`}
                        >
                          {practice.category}
                        </span>
                        {practice.lineNumber && (
                          <Badge
                            className={`${
                              isDarkMode
                                ? "bg-[rgba(255,255,255,0.08)] text-[rgba(229,229,229,0.85)] border-[rgba(255,255,255,0.15)]"
                                : "bg-[#F7F5F3] text-[#605A57] border-[#E0DEDB]/60"
                            } px-3 py-1 shadow-sm`}
                          >
                            Line {practice.lineNumber}
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-base ${
                          isDarkMode ? "text-[rgba(229,229,229,0.85)]" : "text-[#605A57]"
                        } transition-colors duration-500 mb-4 leading-relaxed text-pretty`}
                      >
                        {practice.message}
                      </p>
                      {/* Best practices don't have suggestions in the backend interface, so we'll skip the suggestion display for now */}
                    </div>
                  </div>
                  {index < result.bestPractices.length - 1 && (
                    <Separator className={`${isDarkMode ? "bg-[rgba(255,255,255,0.12)]" : "bg-[#E0DEDB]/60"} my-6`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result.refactoring && result.refactoring.length > 0 && (
        <Card
          className={`${
            isDarkMode
              ? "bg-gradient-to-br from-emerald-950/15 to-[#2a2a2a]/95 border-emerald-800/40 shadow-[0px_8px_32px_rgba(16,185,129,0.1)]"
              : "bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200/80 shadow-[0px_8px_32px_rgba(16,185,129,0.06)]"
          } transition-all duration-500 hover:shadow-[0px_12px_48px_rgba(16,185,129,0.15)] hover:scale-[1.01]`}
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${isDarkMode ? "bg-emerald-900/30 shadow-inner" : "bg-emerald-100/80 shadow-sm"}`}
              >
                <RefreshIcon className={`w-6 h-6 ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`} />
              </div>
              <span
                className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"} font-semibold text-xl tracking-tight`}
              >
                Refactoring Opportunities
              </span>
              <Badge
                className={`${
                  isDarkMode
                    ? "bg-gradient-to-r from-emerald-900/60 to-emerald-800/40 text-emerald-200 border-emerald-700/50 shadow-sm"
                    : "bg-gradient-to-r from-emerald-100 to-emerald-200/80 text-emerald-800 border-emerald-300/60 shadow-sm"
                } font-medium px-3 py-1`}
              >
                {result.refactoring.length}
              </Badge>
            </CardTitle>
            <CardDescription className={`${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} text-base`}>
              Suggestions to improve performance, readability, and architecture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {result.refactoring.map((refactor, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg mt-1 ${isDarkMode ? "bg-emerald-900/20" : "bg-emerald-100/60"}`}>
                      <RefreshIcon className={`w-5 h-5 ${isDarkMode ? "text-emerald-300" : "text-emerald-600"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <span
                          className={`font-semibold text-lg ${
                            isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"
                          } transition-colors duration-500`}
                        >
                          Refactoring Opportunity
                        </span>
                        <Badge className={`${getImpactColor(refactor.impact)} px-3 py-1 font-medium`}>
                          {refactor.impact} impact
                        </Badge>
                        {refactor.lineNumber && (
                          <Badge
                            className={`${
                              isDarkMode
                                ? "bg-[rgba(255,255,255,0.08)] text-[rgba(229,229,229,0.85)] border-[rgba(255,255,255,0.15)]"
                                : "bg-[#F7F5F3] text-[#605A57] border-[#E0DEDB]/60"
                            } px-3 py-1 shadow-sm`}
                          >
                            Line {refactor.lineNumber}
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-base ${
                          isDarkMode ? "text-[rgba(229,229,229,0.85)]" : "text-[#605A57]"
                        } transition-colors duration-500 mb-4 leading-relaxed text-pretty`}
                      >
                        {refactor.suggestion}
                      </p>
                      <div
                        className={`text-base p-5 rounded-xl ${
                          isDarkMode
                            ? "bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] shadow-inner"
                            : "bg-[#F7F5F3]/80 border border-[#E0DEDB]/60 shadow-sm"
                        } transition-colors duration-500`}
                      >
                        <strong
                          className={`${
                            isDarkMode ? "text-[#e5e5e5]" : "text-[#37322F]"
                          } transition-colors duration-500 text-base`}
                        >
                          💡 Suggestion:
                        </strong>{" "}
                        <span
                          className={`${isDarkMode ? "text-[rgba(229,229,229,0.85)]" : "text-[#605A57]"} text-pretty`}
                        >
                          {refactor.suggestion}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < result.refactoring.length - 1 && (
                    <Separator className={`${isDarkMode ? "bg-[rgba(255,255,255,0.12)]" : "bg-[#E0DEDB]/60"} my-6`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

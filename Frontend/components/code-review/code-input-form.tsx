"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/lib/theme-context"
import apiService, { type ReviewSubmissionData } from "@/lib/api-service"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

const CodeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
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

interface CodeInputFormProps {
  onSubmit: (data: ReviewSubmissionData, jobId?: string) => void
  isSubmitting?: boolean
}

const languageOptions = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
  { value: "dart", label: "Dart" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "shell", label: "Shell" },
  { value: "yaml", label: "YAML" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
]

export function CodeInputForm({ onSubmit, isSubmitting = false }: CodeInputFormProps) {
  const { isDarkMode } = useTheme()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("")
  const [filename, setFilename] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    // Check authentication before submitting
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit code for review.",
        variant: "destructive",
      })
      return
    }

    // Verify token exists in localStorage
    const token = localStorage.getItem("authToken")
    if (!token) {
      toast({
        title: "Token Missing",
        description: "Authentication token not found. Please login again.",
        variant: "destructive",
      })
      return
    }

    try {
      const submissionData: ReviewSubmissionData = {
        code: code.trim(),
        language: language || undefined,
        filename: filename.trim() || undefined,
      }

      const result = await apiService.submitReview(submissionData)

      if (result.success) {
        onSubmit(submissionData, result.jobId)
        // Clear form on successful submission
        setCode("")
        setLanguage("")
        setFilename("")
      } else {
        throw new Error(result.message || "Submission failed")
      }
    } catch (error) {
      console.error("Code submission error:", error)
      // Pass error to parent component
      onSubmit({ code: "", language: "", filename: "" }, undefined)
    }
  }

  return (
    <Card
      className={`${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <CodeIcon className="w-5 h-5 text-orange-500" />
          <CardTitle className="text-lg">Submit Code for Review</CardTitle>
        </div>
        <CardDescription>
          Paste your code below and get detailed analysis for security, best practices, and optimization opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language (Optional)</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filename">Filename (Optional)</Label>
              <input
                id="filename"
                type="text"
                placeholder="e.g., main.js, app.py"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className={`w-full px-3 py-2 rounded-md border ${
                  isDarkMode
                    ? "bg-[#1a1a1a] border-[rgba(255,255,255,0.15)] text-[#e5e5e5] placeholder-[rgba(229,229,229,0.70)]"
                    : "bg-white border-[#E0DEDB] text-[#49423D] placeholder-[#605A57]"
                } transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Textarea
              id="code"
              placeholder="Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`min-h-[200px] font-mono text-sm ${
                isDarkMode
                  ? "bg-[#1a1a1a] border-[rgba(255,255,255,0.15)] text-[#e5e5e5] placeholder-[rgba(229,229,229,0.70)]"
                  : "bg-white border-[#E0DEDB] text-[#49423D] placeholder-[#605A57]"
              } transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-orange-500`}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={!code.trim() || isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <LoaderIcon className="w-4 h-4 mr-2" />
                Analyzing Code...
              </>
            ) : (
              <>
                <CodeIcon className="w-4 h-4 mr-2" />
                Submit for Review
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

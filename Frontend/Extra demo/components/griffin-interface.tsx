"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Plus } from "lucide-react"
import type { GriffinResponse } from "@/types/griffin-response"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  fileName?: string
  timestamp: Date
}

export function GriffinInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [reviewData, setReviewData] = useState<GriffinResponse | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark")
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        setIsDarkMode(prefersDark)
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error)
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !fileInputRef.current?.files?.[0]) return

    const file = fileInputRef.current?.files?.[0]
    let codeContent = input.trim()
    let fileName = "pasted-code.txt"
    let language = "text"

    if (file) {
      fileName = file.name
      language = getLanguageFromExtension(file.name)

      try {
        codeContent = await readFileContent(file)
      } catch (error) {
        console.error("Error reading file:", error)
        alert("Error reading file. Please try again.")
        return
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: file ? `Uploaded file: ${file.name}` : input,
      fileName: file?.name,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: fileName,
          code: codeContent,
          language: language,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reviewData: GriffinResponse = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I've analyzed your code and found several areas for improvement.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setReviewData(reviewData)
    } catch (error) {
      console.error("Analysis error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I encountered an error while analyzing your code. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file extension
      const validExtensions =
        /\.(txt|js|ts|py|java|cs|cpp|c|go|rs|php|rb|kt|swift|dart|html|css|sql|sh|yml|yaml|json|xml)$/i
      if (!validExtensions.test(file.name)) {
        alert("Please select a valid code file")
        return
      }
      // Auto-submit when file is selected
      handleSubmit(e as any)
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  const getLanguageFromExtension = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      java: "java",
      cs: "csharp",
      cpp: "cpp",
      c: "c",
      go: "go",
      rs: "rust",
      php: "php",
      rb: "ruby",
      kt: "kotlin",
      swift: "swift",
      dart: "dart",
      html: "html",
      css: "css",
      sql: "sql",
      sh: "bash",
      yml: "yaml",
      yaml: "yaml",
      json: "json",
      xml: "xml",
      txt: "text",
    }
    return languageMap[extension || "txt"] || "text"
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel - Chat Interface */}
      <div className="flex-1 flex flex-col max-w-2xl">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="space-y-2">
                <h2
                  className={`text-3xl font-semibold ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}
                >
                  What are you working on?
                </h2>
                <p
                  className={`${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} max-w-md text-lg transition-colors duration-500`}
                >
                  Upload your code file or paste your code below to get intelligent feedback from Griffin
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-lg ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-orange-500 to-red-600"
                      : isDarkMode
                        ? "bg-[#2a2a2a]"
                        : "bg-white"
                  } rounded-2xl px-4 py-3 ${
                    message.type === "assistant" && isDarkMode
                      ? "shadow-[0px_0px_0px_0.75px_rgba(255,255,255,0.1)]"
                      : message.type === "assistant"
                        ? "shadow-[0px_0px_0px_0.75px_#E0DEDB_inset]"
                        : ""
                  } transition-colors duration-500`}
                >
                  <p
                    className={
                      message.type === "user" ? "text-white" : isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"
                    }
                  >
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div
                className={`${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} rounded-2xl px-4 py-3 max-w-lg ${isDarkMode ? "shadow-[0px_0px_0px_0.75px_rgba(255,255,255,0.1)]" : "shadow-[0px_0px_0px_0.75px_#E0DEDB_inset]"} transition-colors duration-500`}
              >
                <div className="flex items-center gap-3">
                  <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                  <span className={isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"}>
                    Griffin is analyzing your code...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div
              className={`relative ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} rounded-2xl ${isDarkMode ? "border border-[rgba(255,255,255,0.15)]" : "border border-[#E0DEDB]"} p-4 transition-colors duration-500`}
            >
              {/* File upload indicator */}
              {fileInputRef.current?.files?.[0] && (
                <div
                  className={`mb-3 p-2 ${isDarkMode ? "bg-[rgba(255,255,255,0.08)]" : "bg-[#F7F5F3]"} rounded-lg flex items-center gap-2 transition-colors duration-500`}
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className={`text-sm ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"}`}>
                    {fileInputRef.current.files[0].name}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                    className={`ml-auto h-6 w-6 p-0 ${isDarkMode ? "text-[rgba(229,229,229,0.70)] hover:text-[#e5e5e5]" : "text-[#605A57] hover:text-[#49423D]"} transition-colors duration-500`}
                  >
                    ×
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleFileSelect}
                  className={`h-8 w-8 p-0 ${isDarkMode ? "text-[rgba(229,229,229,0.70)] hover:text-[#e5e5e5] hover:bg-[rgba(255,255,255,0.08)]" : "text-[#605A57] hover:text-[#49423D] hover:bg-[#F7F5F3]"} rounded-lg flex-shrink-0 transition-colors duration-500`}
                >
                  <Plus className="w-5 h-5" />
                </Button>

                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Griffin"
                    className={`w-full bg-transparent ${isDarkMode ? "text-[#e5e5e5] placeholder-[rgba(229,229,229,0.70)]" : "text-[#49423D] placeholder-[#605A57]"} resize-none border-none outline-none min-h-[24px] max-h-32 text-base transition-colors duration-500`}
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
                  disabled={!input.trim() && !fileInputRef.current?.files?.[0]}
                  className={`h-8 w-8 p-0 bg-transparent ${isDarkMode ? "hover:bg-[rgba(255,255,255,0.08)] text-[rgba(229,229,229,0.70)] hover:text-[#e5e5e5]" : "hover:bg-[#F7F5F3] text-[#605A57] hover:text-[#49423D]"} rounded-lg flex-shrink-0 transition-colors duration-500`}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.js,.ts,.py,.java,.cs,.cpp,.c,.go,.rs,.php,.rb,.kt,.swift,.dart,.html,.css,.sql,.sh,.yml,.yaml,.json,.xml"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Right Panel - Review Results */}
      <div
        className={`w-96 ${isDarkMode ? "border-l border-[rgba(255,255,255,0.15)] bg-[#1a1a1a]" : "border-l border-[#E0DEDB] bg-[#F7F5F3]"} overflow-y-auto transition-colors duration-500`}
      >
        {reviewData ? (
          <div className="p-6 space-y-4">
            <h2
              className={`text-xl font-semibold ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} mb-6 transition-colors duration-500`}
            >
              Code Review Results
            </h2>
            <ReviewResults data={reviewData} isDarkMode={isDarkMode} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-6">
            <div className="space-y-4 max-w-sm">
              <div
                className={`w-16 h-16 mx-auto ${isDarkMode ? "bg-[#2a2a2a]" : "bg-white"} rounded-2xl flex items-center justify-center ${isDarkMode ? "border border-[rgba(255,255,255,0.15)]" : "border border-[#E0DEDB]"} transition-colors duration-500`}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h3
                  className={`text-lg font-semibold ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} transition-colors duration-500`}
                >
                  Code Review Results
                </h3>
                <p
                  className={`${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} text-sm leading-relaxed transition-colors duration-500`}
                >
                  Submit your code to see detailed review results here. Griffin will analyze your code for security
                  vulnerabilities, best practices, and optimization opportunities.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewResults({ data, isDarkMode }: { data: GriffinResponse; isDarkMode: boolean }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600"
      case "high":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      case "info":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card
        className={`p-4 ${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
      >
        <h3 className="font-semibold text-orange-500 mb-2">Summary</h3>
        <p className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-sm transition-colors duration-500`}>
          {data.summary}
        </p>
      </Card>

      {/* Vulnerabilities */}
      {data.vulnerabilities.length > 0 && (
        <Card
          className={`p-4 ${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
        >
          <h3 className="font-semibold text-red-500 mb-3">Security Vulnerabilities</h3>
          <div className="space-y-3">
            {data.vulnerabilities.map((vuln, i) => (
              <div key={i} className="border-l-2 border-red-500 pl-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={`${getSeverityColor(vuln.severity)} text-xs`}>{vuln.severity}</Badge>
                  <span
                    className={`text-xs ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} transition-colors duration-500`}
                  >
                    Line {vuln.lineNumber}
                  </span>
                </div>
                <p
                  className={`font-medium ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-sm transition-colors duration-500`}
                >
                  {vuln.type}
                </p>
                <p
                  className={`${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} text-xs transition-colors duration-500`}
                >
                  {vuln.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Best Practices */}
      {data.bestPractices.length > 0 && (
        <Card
          className={`p-4 ${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
        >
          <h3 className="font-semibold text-blue-500 mb-3">Best Practices</h3>
          <div className="space-y-3">
            {data.bestPractices.map((practice, i) => (
              <div key={i} className="border-l-2 border-blue-500 pl-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={`${getSeverityColor(practice.severity)} text-xs`}>{practice.severity}</Badge>
                  <span className={`text-xs ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"}`}>
                    Line {practice.lineNumber}
                  </span>
                </div>
                <p
                  className={`font-medium ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-sm transition-colors duration-500`}
                >
                  {practice.category}
                </p>
                <p
                  className={`${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} text-xs transition-colors duration-500`}
                >
                  {practice.message}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Refactoring */}
      {data.refactoring.length > 0 && (
        <Card
          className={`p-4 ${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
        >
          <h3 className="font-semibold text-green-500 mb-3">Refactoring</h3>
          <div className="space-y-3">
            {data.refactoring.map((refactor, i) => (
              <div key={i} className="border-l-2 border-green-500 pl-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"}`}
                  >
                    {refactor.impact} impact
                  </Badge>
                  <span className={`text-xs ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"}`}>
                    Line {refactor.lineNumber}
                  </span>
                </div>
                <p
                  className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-sm transition-colors duration-500`}
                >
                  {refactor.suggestion}
                </p>
                {refactor.originalCode && (
                  <div className="space-y-1">
                    <div
                      className={`bg-red-900/20 p-2 rounded text-xs font-mono ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"}`}
                    >
                      <span className="text-red-400">- </span>
                      <span>{refactor.originalCode}</span>
                    </div>
                    <div
                      className={`bg-green-900/20 p-2 rounded text-xs font-mono ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"}`}
                    >
                      <span className="text-green-400">+ </span>
                      <span>{refactor.suggestedCode}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Maintainability */}
      {data.maintainability && (
        <Card
          className={`p-4 ${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
        >
          <h3 className="font-semibold text-orange-500 mb-3">Maintainability</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"}`}
              >
                {data.maintainability.score.toFixed(1)} score
              </Badge>
            </div>
            {data.maintainability.issues.map((issue, i) => (
              <div key={i} className="border-l-2 border-orange-500 pl-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"}`}>
                    Line {issue.lineNumber}
                  </span>
                </div>
                <p
                  className={`font-medium ${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-sm transition-colors duration-500`}
                >
                  {issue.type}
                </p>
                <p
                  className={`${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"} text-xs transition-colors duration-500`}
                >
                  {issue.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Complexity */}
      {data.complexity && (
        <Card
          className={`p-4 ${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
        >
          <h3 className="font-semibold text-purple-500 mb-3">Complexity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"}`}
              >
                Cyclomatic Complexity: {data.complexity.cyclomaticComplexity}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"}`}
              >
                Cognitive Complexity: {data.complexity.cognitiveComplexity}
              </Badge>
            </div>
            {data.complexity.suggestions.map((suggestion, i) => (
              <div key={i} className="border-l-2 border-purple-500 pl-3 space-y-1">
                <p
                  className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-sm transition-colors duration-500`}
                >
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Documentation */}
      {data.documentation && (
        <Card
          className={`p-4 ${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
        >
          <h3 className="font-semibold text-teal-500 mb-3">Documentation</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${isDarkMode ? "text-[rgba(229,229,229,0.70)]" : "text-[#605A57]"}`}
              >
                {data.documentation.coverageScore}% coverage
              </Badge>
            </div>
            {data.documentation.suggestions.map((suggestion, i) => (
              <div key={i} className="border-l-2 border-teal-500 pl-3 space-y-1">
                <p
                  className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-sm transition-colors duration-500`}
                >
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Testing */}
      {data.testing && (
        <Card
          className={`p-4 ${isDarkMode ? "bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]" : "bg-white border-[#E0DEDB]"} transition-colors duration-500`}
        >
          <h3 className="font-semibold text-pink-500 mb-3">Testing</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p
                className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-sm transition-colors duration-500`}
              >
                {data.testing.coverageAnalysis}
              </p>
            </div>
            {data.testing.recommendations.map((recommendation, i) => (
              <div key={i} className="border-l-2 border-pink-500 pl-3 space-y-1">
                <p
                  className={`${isDarkMode ? "text-[#e5e5e5]" : "text-[#49423D]"} text-sm transition-colors duration-500`}
                >
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

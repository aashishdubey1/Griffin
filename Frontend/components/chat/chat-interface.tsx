"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2, User, Bot, Plus, Mic, FileText, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useChat as useChatContext } from "@/lib/chat-context"
import { cn } from "@/lib/utils"

interface ChatInterfaceProps {
  chatId?: string
  className?: string
}

interface UploadedFile {
  id: string
  name: string
  type: string
  content: string
  size: number
}

const SUPPORTED_FILE_TYPES = [
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

export function ChatInterface({ chatId, className }: ChatInterfaceProps) {
  const { user } = useAuth()
  const { currentChat, sendMessage: sendChatMessage, isLoading: chatLoading } = useChatContext()
  const [input, setInput] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: () => {
      if (currentChat && messages.length > 0) {
        const lastMessage = messages[messages.length - 1]
        if (lastMessage.role === "assistant") {
          console.log("[Griffin] Chat completed")
        }
      }
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && uploadedFiles.length === 0) || status === "in_progress") return

    let messageContent = input.trim()

    if (uploadedFiles.length > 0) {
      const fileContents = uploadedFiles.map((file) => `\n\n--- File: ${file.name} ---\n${file.content}`).join("")
      messageContent = messageContent ? `${messageContent}${fileContents}` : fileContents.substring(2)
    }

    setInput("")
    setUploadedFiles([])

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: messageContent }],
    })

    if (currentChat && sendChatMessage) {
      await sendChatMessage(messageContent)
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach((file) => {
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

      if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
        alert(`File type ${fileExtension} is not supported. Supported types: ${SUPPORTED_FILE_TYPES.join(", ")}`)
        return
      }

      if (file.size > 1024 * 1024) {
        alert("File size must be less than 1MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: fileExtension,
          content,
          size: file.size,
        }
        setUploadedFiles((prev) => [...prev, newFile])
      }
      reader.readAsText(file)
    })
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-[#212121] transition-colors duration-300", className)}>
      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
              <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Hey, {user?.username || "Aman"}. Ready to dive in?
              </h1>
            </div>
          )}

          <div className="space-y-6 py-8">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className="flex gap-4 px-4 py-6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {message.role === "user" ? user?.username || "You" : "Griffin"}
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <div
                              key={index}
                              className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed"
                            >
                              {part.text}
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {status === "in_progress" && (
              <div className="group">
                <div className="flex gap-4 px-4 py-6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Griffin</div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
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
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* File Upload Section */}
      {uploadedFiles.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Attached Files ({uploadedFiles.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600"
                >
                  <FileText className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium truncate max-w-[120px] text-gray-700 dark:text-gray-300">
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-500/20 text-gray-500 hover:text-red-500"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area - ChatGPT Style */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#212121] px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div
              className={cn(
                "relative bg-gray-100 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200",
                isDragOver && "border-orange-400 bg-orange-50 dark:bg-orange-950/20",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex items-end gap-3 p-4">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleFileSelect}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
                >
                  <Plus className="w-5 h-5" />
                </Button>

                <div className="flex-1 min-h-[24px] max-h-32">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything"
                    className="w-full bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none border-none outline-none text-base leading-6"
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

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={!input.trim() && uploadedFiles.length === 0}
                    className="h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_FILE_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
        </div>
      </div>
    </div>
  )
}

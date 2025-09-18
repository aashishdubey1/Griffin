export interface ChatMessage {
  id: string
  chatId: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  attachments?: {
    type: "image" | "file"
    url: string
    name: string
  }[]
}

export interface Chat {
  id: string
  userId: string
  title: string
  createdAt: Date
  updatedAt: Date
  messages: ChatMessage[]
}

export interface CodeAnalysisResult {
  id: string
  chatId: string
  messageId: string
  analysis: {
    vulnerabilities: Array<{
      type: string
      severity: "low" | "medium" | "high" | "critical"
      description: string
      line?: number
      suggestion: string
    }>
    bestPractices: Array<{
      category: string
      description: string
      suggestion: string
      priority: "low" | "medium" | "high"
    }>
    refactoring: Array<{
      type: string
      description: string
      before: string
      after: string
      impact: string
    }>
    metrics: {
      complexity: number
      maintainability: number
      testCoverage?: number
    }
  }
  createdAt: Date
}

class ChatStorage {
  private readonly CHATS_KEY = "griffin-chats"
  private readonly ANALYSIS_KEY = "griffin-analysis"

  // Chat operations
  getChats(userId: string): Chat[] {
    const chats = localStorage.getItem(this.CHATS_KEY)
    if (!chats) return []

    try {
      const allChats: Chat[] = JSON.parse(chats)
      return allChats
        .filter((chat) => chat.userId === userId)
        .map((chat) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    } catch {
      return []
    }
  }

  getChat(chatId: string, userId: string): Chat | null {
    const chats = this.getChats(userId)
    return chats.find((chat) => chat.id === chatId) || null
  }

  createChat(userId: string, title = "New Chat"): Chat {
    const newChat: Chat = {
      id: Date.now().toString(),
      userId,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    }

    const chats = this.getAllChats()
    chats.push(newChat)
    localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats))

    return newChat
  }

  updateChat(chatId: string, userId: string, updates: Partial<Chat>): Chat | null {
    const chats = this.getAllChats()
    const chatIndex = chats.findIndex((chat) => chat.id === chatId && chat.userId === userId)

    if (chatIndex === -1) return null

    chats[chatIndex] = {
      ...chats[chatIndex],
      ...updates,
      updatedAt: new Date(),
    }

    localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats))
    return chats[chatIndex]
  }

  deleteChat(chatId: string, userId: string): boolean {
    const chats = this.getAllChats()
    const filteredChats = chats.filter((chat) => !(chat.id === chatId && chat.userId === userId))

    if (filteredChats.length === chats.length) return false

    localStorage.setItem(this.CHATS_KEY, JSON.stringify(filteredChats))
    return true
  }

  // Message operations
  addMessage(
    chatId: string,
    userId: string,
    message: Omit<ChatMessage, "id" | "chatId" | "timestamp">,
  ): ChatMessage | null {
    const chats = this.getAllChats()
    const chatIndex = chats.findIndex((chat) => chat.id === chatId && chat.userId === userId)

    if (chatIndex === -1) return null

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      chatId,
      timestamp: new Date(),
      ...message,
    }

    chats[chatIndex].messages.push(newMessage)
    chats[chatIndex].updatedAt = new Date()

    // Update title if it's the first user message
    if (chats[chatIndex].messages.filter((m) => m.role === "user").length === 1 && message.role === "user") {
      chats[chatIndex].title = message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
    }

    localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats))
    return newMessage
  }

  // Analysis operations
  saveAnalysis(analysis: CodeAnalysisResult): void {
    const analyses = this.getAllAnalyses()
    analyses.push(analysis)
    localStorage.setItem(this.ANALYSIS_KEY, JSON.stringify(analyses))
  }

  getAnalysis(chatId: string, messageId: string): CodeAnalysisResult | null {
    const analyses = this.getAllAnalyses()
    return analyses.find((a) => a.chatId === chatId && a.messageId === messageId) || null
  }

  private getAllChats(): Chat[] {
    const chats = localStorage.getItem(this.CHATS_KEY)
    if (!chats) return []

    try {
      return JSON.parse(chats)
    } catch {
      return []
    }
  }

  private getAllAnalyses(): CodeAnalysisResult[] {
    const analyses = localStorage.getItem(this.ANALYSIS_KEY)
    if (!analyses) return []

    try {
      return JSON.parse(analyses)
    } catch {
      return []
    }
  }
}

export const chatStorage = new ChatStorage()

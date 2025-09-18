"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import { chatStorage, type Chat } from "./chat-storage"

interface ChatContextType {
  chats: Chat[]
  currentChat: Chat | null
  isLoading: boolean
  createNewChat: () => Chat
  selectChat: (chatId: string) => void
  sendMessage: (content: string, attachments?: any[]) => Promise<void>
  deleteChat: (chatId: string) => void
  refreshChats: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshChats = () => {
    if (user) {
      const userChats = chatStorage.getChats(user.id)
      setChats(userChats)
    }
  }

  useEffect(() => {
    refreshChats()
  }, [user])

  const createNewChat = (): Chat => {
    if (!user) throw new Error("User not authenticated")

    const newChat = chatStorage.createChat(user.id)
    setChats((prev) => [newChat, ...prev])
    setCurrentChat(newChat)
    return newChat
  }

  const selectChat = (chatId: string) => {
    if (!user) return

    const chat = chatStorage.getChat(chatId, user.id)
    setCurrentChat(chat)
  }

  const sendMessage = async (content: string, attachments?: any[]) => {
    if (!user || !currentChat) return

    setIsLoading(true)

    try {
      // Add user message
      const userMessage = chatStorage.addMessage(currentChat.id, user.id, {
        content,
        role: "user",
        attachments,
      })

      if (userMessage) {
        // Update current chat with new message
        const updatedChat = chatStorage.getChat(currentChat.id, user.id)
        if (updatedChat) {
          setCurrentChat(updatedChat)
          refreshChats()
        }

        // Simulate AI response (will be replaced with actual API call)
        setTimeout(() => {
          const aiResponse = chatStorage.addMessage(currentChat.id, user.id, {
            content:
              "I'm analyzing your code and will provide detailed feedback shortly. This is a simulated response until the AI integration is complete.",
            role: "assistant",
          })

          if (aiResponse) {
            const finalChat = chatStorage.getChat(currentChat.id, user.id)
            if (finalChat) {
              setCurrentChat(finalChat)
              refreshChats()
            }
          }
          setIsLoading(false)
        }, 1500)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
    }
  }

  const deleteChat = (chatId: string) => {
    if (!user) return

    const success = chatStorage.deleteChat(chatId, user.id)
    if (success) {
      refreshChats()
      if (currentChat?.id === chatId) {
        setCurrentChat(null)
      }
    }
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        isLoading,
        createNewChat,
        selectChat,
        sendMessage,
        deleteChat,
        refreshChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, MessageSquare, Trash2, MoreHorizontal, Settings, User, Search, Edit3, Archive, Star } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useChat } from "@/lib/chat-context"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { format, isToday, isYesterday, isThisWeek } from "date-fns"

interface ChatSidebarProps {
  className?: string
}

export function ChatSidebar({ className }: ChatSidebarProps) {
  const { user } = useAuth()
  const { chats, currentChat, createNewChat, selectChat, deleteChat } = useChat()
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null)

  const handleNewChat = () => {
    createNewChat()
  }

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId)
  }

  const handleDeleteChat = async (chatId: string) => {
    setDeletingChatId(chatId)
    try {
      deleteChat(chatId)
    } finally {
      setDeletingChatId(null)
    }
  }

  const formatChatDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, "HH:mm")
    } else if (isYesterday(date)) {
      return "Yesterday"
    } else if (isThisWeek(date)) {
      return format(date, "EEEE")
    } else {
      return format(date, "MMM d")
    }
  }

  if (!user) {
    return (
      <div className={cn("w-64 bg-gray-900 text-white flex flex-col", className)}>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-400">Please log in to access chat history</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-64 bg-gray-900 text-white flex flex-col h-full", className)}>
      {/* Header with New Chat Button */}
      <div className="p-3 border-b border-gray-700">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-3 h-10 bg-transparent hover:bg-gray-800 border border-gray-600 hover:border-gray-500 text-white rounded-lg transition-colors"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">New chat</span>
        </Button>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-2 p-3 border-b border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm">ChatGPT</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Explore GPTs</span>
        </Button>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {chats.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-800",
                    currentChat?.id === chat.id && "bg-gray-800",
                  )}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate font-medium">{chat.title || "New conversation"}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700 text-gray-400 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                      <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700 gap-2">
                        <Edit3 className="h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700 gap-2">
                        <Star className="h-4 w-4" />
                        Pin
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700 gap-2">
                        <Archive className="h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400 hover:text-red-300 hover:bg-gray-700 gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteChat(chat.id)
                        }}
                        disabled={deletingChatId === chat.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Section with User Info */}
      <div className="border-t border-gray-700 p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{user.username || "User"}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700">
            <Settings className="h-3 w-3" />
          </Button>
        </div>

        <div className="mt-2 px-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-8 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-xs"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Upgrade to Go
          </Button>
        </div>
      </div>
    </div>
  )
}

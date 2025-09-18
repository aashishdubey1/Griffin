"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/lib/theme-context'
import { Bug, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

interface DebugLog {
  id: string
  timestamp: Date
  type: 'info' | 'error' | 'success' | 'warning'
  message: string
  data?: any
}

interface DebugPanelProps {
  logs: DebugLog[]
  onClearLogs: () => void
  className?: string
}

export function DebugPanel({ logs, onClearLogs, className = '' }: DebugPanelProps) {
  const { isDarkMode } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [filter, setFilter] = useState<'all' | 'error' | 'info' | 'success' | 'warning'>('all')

  const filteredLogs = logs.filter(log => filter === 'all' || log.type === filter)
  
  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-500'
      case 'success':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      default:
        return 'text-blue-500'
    }
  }

  const getLogBgColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20'
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20'
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <Card className={`${isDarkMode ? 'bg-[#2a2a2a] border-[rgba(255,255,255,0.15)]' : 'bg-white border-[#E0DEDB]'} transition-colors duration-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Debug Panel
            <Badge variant="secondary">{logs.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearLogs}
              className="h-6 px-2 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2"
            >
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="flex gap-1 mt-2">
            {(['all', 'error', 'warning', 'info', 'success'] as const).map((type) => (
              <Button
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(type)}
                className="h-6 px-2 text-xs"
              >
                {type}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <p className={`text-sm ${isDarkMode ? 'text-[rgba(229,229,229,0.70)]' : 'text-[#605A57]'} text-center py-4`}>
                No logs to display
              </p>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded text-xs ${getLogBgColor(log.type)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${getLogColor(log.type)}`}>
                      [{log.type.toUpperCase()}]
                    </span>
                    <span className={`${isDarkMode ? 'text-[rgba(229,229,229,0.70)]' : 'text-[#605A57]'}`}>
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={`${isDarkMode ? 'text-[#e5e5e5]' : 'text-[#49423D]'} mb-1`}>
                    {log.message}
                  </p>
                  {log.data && (
                    <pre className={`text-xs ${isDarkMode ? 'text-[rgba(229,229,229,0.70)]' : 'text-[#605A57]'} bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto`}>
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

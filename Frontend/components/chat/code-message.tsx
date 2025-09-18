"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CodeBlock, InlineCode } from '@/components/ui/syntax-highlighter'
import { useTheme } from '@/lib/theme-context'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

interface CodeMessageProps {
  content: string
  language?: string
  className?: string
}

export function CodeMessage({ content, language = 'javascript', className = '' }: CodeMessageProps) {
  const { isDarkMode } = useTheme()
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Extract code blocks from markdown-style content
  const codeBlocks = content.match(/```(\w+)?\n([\s\S]*?)```/g) || []
  const inlineCode = content.match(/`([^`]+)`/g) || []
  
  // Split content by code blocks
  const parts = content.split(/(```[\w]*\n[\s\S]*?```|`[^`]+`)/g)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }
  
  const shouldTruncate = content.length > 500 && !isExpanded
  const displayContent = shouldTruncate ? content.substring(0, 500) + '...' : content
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={`h-8 px-2 ${
            isDarkMode
              ? 'hover:bg-[rgba(255,255,255,0.1)] text-[rgba(229,229,229,0.70)]'
              : 'hover:bg-[rgba(55,50,47,0.1)] text-[#605A57]'
          }`}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="ml-1 text-xs">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </Button>
        
        {content.length > 500 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`h-8 px-2 ${
              isDarkMode
                ? 'hover:bg-[rgba(255,255,255,0.1)] text-[rgba(229,229,229,0.70)]'
                : 'hover:bg-[rgba(55,50,47,0.1)] text-[#605A57]'
            }`}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span className="ml-1 text-xs">
              {isExpanded ? 'Show less' : 'Show more'}
            </span>
          </Button>
        )}
      </div>
      
      {/* Content with syntax highlighting */}
      <div className="space-y-2">
        {parts.map((part, index) => {
          // Check if this part is a code block
          const codeBlockMatch = part.match(/```(\w+)?\n([\s\S]*?)```/)
          if (codeBlockMatch) {
            const [, lang, code] = codeBlockMatch
            return (
              <CodeBlock
                key={index}
                code={code}
                language={lang || language}
              />
            )
          }
          
          // Check if this part is inline code
          const inlineCodeMatch = part.match(/`([^`]+)`/)
          if (inlineCodeMatch) {
            return (
              <span key={index}>
                {part.split(/(`[^`]+`)/).map((subPart, subIndex) => {
                  const inlineMatch = subPart.match(/`([^`]+)`/)
                  if (inlineMatch) {
                    return (
                      <InlineCode key={subIndex}>
                        {inlineMatch[1]}
                      </InlineCode>
                    )
                  }
                  return subPart
                })}
              </span>
            )
          }
          
          // Regular text
          return (
            <span
              key={index}
              className={`whitespace-pre-wrap ${
                isDarkMode ? 'text-[rgba(229,229,229,0.85)]' : 'text-[#605A57]'
              } leading-relaxed`}
            >
              {part}
            </span>
          )
        })}
      </div>
    </div>
  )
}

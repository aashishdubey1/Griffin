"use client"

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '@/lib/theme-context'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language = 'javascript', className = '' }: CodeBlockProps) {
  const { isDarkMode } = useTheme()
  
  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <SyntaxHighlighter
        language={language}
        style={isDarkMode ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        showLineNumbers={code.split('\n').length > 5}
        wrapLines={true}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

interface InlineCodeProps {
  children: string
  className?: string
}

export function InlineCode({ children, className = '' }: InlineCodeProps) {
  const { isDarkMode } = useTheme()
  
  return (
    <code
      className={`px-1.5 py-0.5 rounded text-sm font-mono ${
        isDarkMode 
          ? 'bg-[#2a2a2a] text-[#e5e5e5] border border-[rgba(255,255,255,0.1)]' 
          : 'bg-[#F7F5F3] text-[#49423D] border border-[#E0DEDB]'
      } ${className}`}
    >
      {children}
    </code>
  )
}

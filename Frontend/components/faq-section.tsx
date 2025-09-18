"use client"

import { useState } from "react"
import { useTheme } from "@/lib/theme-context"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What is Griffin and who is it for?",
    answer:
      "Griffin is an intelligent code review assistant designed for developers and teams who want to improve code quality. It's perfect for individual developers, development teams, and organizations looking to enhance their code review processes with AI-powered insights.",
  },
  {
    question: "How does Griffin's security analysis work?",
    answer:
      "Griffin uses advanced static analysis and AI to scan your code for security vulnerabilities like SQL injection, hardcoded secrets, and insecure API usage. It provides detailed reports with severity levels and actionable recommendations to fix identified issues.",
  },
  {
    question: "Can I integrate Griffin with my existing development workflow?",
    answer:
      "Yes! Griffin integrates seamlessly with popular version control systems, CI/CD pipelines, and development tools. We support APIs and webhooks for custom integrations with your existing workflow and development environment.",
  },
  {
    question: "What kind of support do you provide?",
    answer:
      "We offer comprehensive support including community forums for free users, priority email support for professional users, and dedicated account managers for enterprise clients. We also provide extensive documentation and onboarding assistance.",
  },
  {
    question: "Is my code secure with Griffin?",
    answer:
      "Absolutely. We use enterprise-grade security measures including end-to-end encryption, secure processing environments, and strict data privacy policies. Your code is never stored permanently and is processed in isolated, secure containers.",
  },
  {
    question: "How do I get started with Griffin?",
    answer:
      "Getting started is simple! Sign up for our free plan, connect your repository or upload your code, and Griffin will immediately start providing intelligent code review insights. Our onboarding guide will help you set up your first analysis within minutes.",
  },
]

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const { isDarkMode } = useTheme()

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <div className="w-full flex justify-center items-start">
      <div className="flex-1 px-4 md:px-12 py-16 md:py-20 flex flex-col lg:flex-row justify-start items-start gap-6 lg:gap-12">
        {/* Left Column - Header */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-start gap-4 lg:py-5">
          <div
            className={`w-full flex flex-col justify-center ${isDarkMode ? "text-[#f5f5f5]" : "text-[#37322F]"} font-semibold leading-tight md:leading-[44px] font-sans text-4xl tracking-tight transition-colors duration-500`}
          >
            Frequently Asked Questions
          </div>
          <div
            className={`w-full ${isDarkMode ? "text-[#e0e0e0]" : "text-[#4a4540]"} text-base font-normal leading-7 font-sans transition-colors duration-500`}
          >
            Get answers to common questions about Griffin,
            <br className="hidden md:block" />
            our intelligent code review assistant.
          </div>
        </div>

        {/* Right Column - FAQ Items */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-center">
          <div className="w-full flex flex-col">
            {faqData.map((item, index) => {
              const isOpen = openItems.includes(index)

              return (
                <div
                  key={index}
                  className={`w-full ${isDarkMode ? "border-b border-[rgba(255,255,255,0.2)]" : "border-b border-[rgba(55,50,47,0.2)]"} overflow-hidden transition-colors duration-500`}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className={`w-full px-5 py-[18px] flex justify-between items-center gap-5 text-left ${isDarkMode ? "hover:bg-[rgba(255,255,255,0.05)]" : "hover:bg-[rgba(55,50,47,0.05)]"} transition-colors duration-200`}
                    aria-expanded={isOpen}
                  >
                    <div
                      className={`flex-1 ${isDarkMode ? "text-[#f5f5f5]" : "text-[#37322F]"} text-base font-medium leading-6 font-sans transition-colors duration-500`}
                    >
                      {item.question}
                    </div>
                    <div className="flex justify-center items-center">
                      <ChevronDownIcon
                        className={`w-6 h-6 ${isDarkMode ? "text-[rgba(255,255,255,0.8)]" : "text-[rgba(55,50,47,0.8)]"} transition-all duration-300 ease-in-out ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div
                      className={`px-5 pb-[18px] ${isDarkMode ? "text-[#e0e0e0]" : "text-[#4a4540]"} text-sm font-normal leading-6 font-sans transition-colors duration-500`}
                    >
                      {item.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

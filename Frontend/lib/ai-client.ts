"use client"

import type { UIMessage } from "ai"

export interface CodeAnalysisRequest {
  code: string
  language: string
  options?: {
    focus?: string
  }
}

export interface CodeExplanationRequest {
  code: string
  language: string
  level?: "beginner" | "intermediate" | "advanced"
  focus?: string
}

export class GriffinAI {
  private baseUrl: string

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  async analyzeCode(request: CodeAnalysisRequest) {
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`)
    }

    return response.json()
  }

  async explainCode(request: CodeExplanationRequest) {
    const response = await fetch(`${this.baseUrl}/explain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Explanation failed: ${response.statusText}`)
    }

    return response.json()
  }

  async sendChatMessage(messages: UIMessage[]) {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      throw new Error(`Chat failed: ${response.statusText}`)
    }

    return response
  }
}

export const griffinAI = new GriffinAI()

import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, streamText, type UIMessage, tool } from "ai"
import { z } from "zod"

export const maxDuration = 30

const analyzeCodeTool = tool({
  description: "Analyze code for security vulnerabilities, best practices, and refactoring suggestions",
  inputSchema: z.object({
    code: z.string().describe("The code to analyze"),
    language: z.string().describe("Programming language of the code"),
    analysisType: z.enum(["security", "best-practices", "refactoring", "all"]).describe("Type of analysis to perform"),
  }),
  async execute({ code, language, analysisType }) {
    // Simulate code analysis - in production this would use actual static analysis tools
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const analysis = {
      vulnerabilities:
        analysisType === "security" || analysisType === "all"
          ? [
              {
                type: "SQL Injection",
                severity: "high" as const,
                description: "Potential SQL injection vulnerability detected",
                line: 15,
                suggestion: "Use parameterized queries or prepared statements",
              },
            ]
          : [],
      bestPractices:
        analysisType === "best-practices" || analysisType === "all"
          ? [
              {
                category: "Code Style",
                description: "Consider using more descriptive variable names",
                suggestion: "Replace single-letter variables with meaningful names",
                priority: "medium" as const,
              },
            ]
          : [],
      refactoring:
        analysisType === "refactoring" || analysisType === "all"
          ? [
              {
                type: "Function Extraction",
                description: "Large function can be broken down",
                before: "function processData() { /* 50+ lines */ }",
                after: "function processData() { validateInput(); transformData(); saveResults(); }",
                impact: "Improved readability and maintainability",
              },
            ]
          : [],
      metrics: {
        complexity: 7,
        maintainability: 85,
        testCoverage: 78,
      },
    }

    return analysis
  },
})

const explainCodeTool = tool({
  description: "Explain how code works and provide educational insights",
  inputSchema: z.object({
    code: z.string().describe("The code to explain"),
    language: z.string().describe("Programming language of the code"),
    level: z.enum(["beginner", "intermediate", "advanced"]).describe("Explanation complexity level"),
  }),
  async execute({ code, language, level }) {
    // Simulate code explanation generation
    await new Promise((resolve) => setTimeout(resolve, 800))

    return {
      explanation: `This ${language} code demonstrates several key concepts...`,
      keyPoints: [
        "Variable declaration and initialization",
        "Function definition and invocation",
        "Control flow structures",
      ],
      complexity: level,
      relatedConcepts: ["Object-oriented programming", "Functional programming"],
    }
  },
})

const tools = {
  analyzeCode: analyzeCodeTool,
  explainCode: explainCodeTool,
} as const

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const prompt = convertToModelMessages(messages)

    const result = streamText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: `You are Griffin, an intelligent code review assistant. You help developers by:
          
          1. Analyzing code for security vulnerabilities, performance issues, and bugs
          2. Suggesting best practices and coding standards improvements  
          3. Providing refactoring recommendations for better architecture
          4. Explaining complex code concepts in an educational way
          5. Generating structured reports with actionable insights
          
          When users share code, automatically analyze it and provide comprehensive feedback. 
          Use the available tools to perform detailed analysis and explanations.
          
          Be helpful, thorough, and educational in your responses. Focus on practical, actionable advice.`,
        },
        ...prompt,
      ],
      tools,
      maxSteps: 3,
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      onFinish: async ({ isAborted, usage }) => {
        if (isAborted) {
          console.log("[Griffin] Chat request aborted")
        } else {
          console.log("[Griffin] Chat completed:", usage)
        }
      },
    })
  } catch (error) {
    console.error("[Griffin] Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

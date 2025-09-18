import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const codeAnalysisSchema = z.object({
  vulnerabilities: z.array(
    z.object({
      type: z.string().describe("Type of vulnerability (e.g., SQL Injection, XSS)"),
      severity: z.enum(["low", "medium", "high", "critical"]),
      description: z.string().describe("Detailed description of the vulnerability"),
      line: z.number().optional().describe("Line number where vulnerability occurs"),
      suggestion: z.string().describe("How to fix the vulnerability"),
      cweId: z.string().optional().describe("Common Weakness Enumeration ID"),
    }),
  ),
  bestPractices: z.array(
    z.object({
      category: z.string().describe("Category of best practice (e.g., Code Style, Performance)"),
      description: z.string().describe("Description of the issue"),
      suggestion: z.string().describe("Recommended improvement"),
      priority: z.enum(["low", "medium", "high"]),
      references: z.array(z.string()).optional().describe("Links to documentation or standards"),
    }),
  ),
  refactoring: z.array(
    z.object({
      type: z.string().describe("Type of refactoring (e.g., Extract Method, Rename Variable)"),
      description: z.string().describe("What should be refactored and why"),
      before: z.string().describe("Code before refactoring"),
      after: z.string().describe("Code after refactoring"),
      impact: z.string().describe("Expected impact of the refactoring"),
      effort: z.enum(["low", "medium", "high"]).describe("Estimated effort required"),
    }),
  ),
  metrics: z.object({
    complexity: z.number().describe("Cyclomatic complexity score"),
    maintainability: z.number().describe("Maintainability index (0-100)"),
    testCoverage: z.number().optional().describe("Test coverage percentage"),
    linesOfCode: z.number().describe("Total lines of code"),
    duplicatedLines: z.number().optional().describe("Number of duplicated lines"),
  }),
  summary: z.object({
    overallScore: z.number().describe("Overall code quality score (0-100)"),
    criticalIssues: z.number().describe("Number of critical issues"),
    recommendations: z.array(z.string()).describe("Top 3 recommendations"),
    estimatedFixTime: z.string().describe("Estimated time to address major issues"),
  }),
})

export async function POST(req: Request) {
  try {
    const { code, language, options } = await req.json()

    if (!code || !language) {
      return Response.json({ error: "Code and language are required" }, { status: 400 })
    }

    const analysisPrompt = `
    Analyze the following ${language} code for:
    - Security vulnerabilities and potential exploits
    - Best practices and coding standards compliance
    - Refactoring opportunities for better architecture
    - Code metrics and quality indicators
    
    Provide specific, actionable recommendations with examples.
    
    Code to analyze:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    ${options?.focus ? `Focus particularly on: ${options.focus}` : ""}
    `

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: codeAnalysisSchema,
      prompt: analysisPrompt,
      maxTokens: 4000,
    })

    return Response.json({
      analysis: object,
      metadata: {
        language,
        analyzedAt: new Date().toISOString(),
        codeLength: code.length,
      },
    })
  } catch (error) {
    console.error("[Griffin] Analysis API error:", error)
    return Response.json({ error: "Analysis failed" }, { status: 500 })
  }
}

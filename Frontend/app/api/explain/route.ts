import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { code, language, level = "intermediate", focus } = await req.json()

    if (!code || !language) {
      return Response.json({ error: "Code and language are required" }, { status: 400 })
    }

    const explanationPrompt = `
    Explain the following ${language} code at a ${level} level.
    
    Code to explain:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    ${focus ? `Focus particularly on: ${focus}` : ""}
    
    Provide:
    1. A clear overview of what the code does
    2. Step-by-step breakdown of key parts
    3. Explanation of important concepts used
    4. Common patterns or best practices demonstrated
    5. Potential improvements or alternatives
    
    Tailor the explanation to a ${level} developer's understanding.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: explanationPrompt,
      maxTokens: 2000,
      temperature: 0.7,
    })

    return Response.json({
      explanation: text,
      metadata: {
        language,
        level,
        focus,
        explainedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[Griffin] Explanation API error:", error)
    return Response.json({ error: "Explanation failed" }, { status: 500 })
  }
}

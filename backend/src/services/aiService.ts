import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SemgrepResult } from "./semgrepService";
import serverConfig from "../config/server.config";

export interface CodeReviewResult {
  summary: string;
  bestPractices: Array<{
    category: string;
    message: string;
    severity: "info" | "warning" | "error";
    lineNumber?: number;
  }>;
  refactoring: Array<{
    suggestion: string;
    impact: "low" | "medium" | "high";
    lineNumber?: number;
    originalCode?: string;
    suggestedCode?: string;
  }>;
  vulnerabilities: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    lineNumber?: number;
    cwe?: string;
  }>;
  performance: Array<{
    issue: string;
    impact: "low" | "medium" | "high";
    suggestion: string;
    lineNumber?: number;
  }>;
  maintainability: {
    score: number;
    issues: Array<{
      type: string;
      description: string;
      lineNumber?: number;
    }>;
  };
  complexity: {
    cyclomaticComplexity?: number;
    cognitiveComplexity?: number;
    suggestions: string[];
  };
  documentation: {
    coverageScore: number;
    suggestions: string[];
  };
  testing: {
    recommendations: string[];
    coverageAnalysis: string;
  };
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private static readonly MAX_TOKENS = 30000; // Conservative limit for Gemini
  private static readonly TIMEOUT_MS = 60000; // 60 seconds

  constructor() {
    const apiKey = serverConfig.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  /**
   * Analyze code using AI with Semgrep findings
   */
  async analyzeCode(
    code: string,
    language: string,
    filename?: string,
    semgrepFindings?: SemgrepResult
  ): Promise<CodeReviewResult> {
    try {
      // Validate input size
      if (this.estimateTokens(code) > AIService.MAX_TOKENS) {
        code = this.truncateCode(code);
      }

      // console.log("Ai service is get called ", code, language, filename);

      // Generate comprehensive prompt
      const prompt = this.buildPrompt(
        code,
        language,
        filename,
        semgrepFindings
      );

      // Call Gemini API with timeout
      const result = await Promise.race([
        this.callGeminiAPI(prompt),
        this.createTimeoutPromise(),
      ]);

      if (typeof result === "string" && result === "TIMEOUT") {
        throw new Error("AI analysis timed out");
      }

      return result as CodeReviewResult;
    } catch (error) {
      console.error("AI analysis failed:", error);
      throw new Error(
        `AI analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Build comprehensive prompt for code analysis
   */
  private buildPrompt(
    code: string,
    language: string,
    filename?: string,
    semgrepFindings?: SemgrepResult
  ): string {
    const systemPrompt = `You are a senior software engineer and security expert performing comprehensive code reviews. Analyze the provided code and return a detailed JSON response following the exact structure specified.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no markdown, no explanations, no extra text
2. Follow the exact schema provided
3. Provide specific, actionable feedback
4. Include line numbers when possible
5. Be thorough but concise

ANALYSIS AREAS:
- Security vulnerabilities and best practices
- Code quality and maintainability
- Performance optimization opportunities  
- Refactoring suggestions
- Documentation gaps
- Testing recommendations
- Complexity assessment

OUTPUT SCHEMA:
{
  "summary": "Brief overview of code quality and key findings",
  "bestPractices": [
    {
      "category": "Security|Performance|Code Quality|Style",
      "message": "Specific issue description",
      "severity": "info|warning|error",
      "lineNumber": 10
    }
  ],
  "refactoring": [
    {
      "suggestion": "Specific refactoring recommendation",
      "impact": "low|medium|high",
      "lineNumber": 15,
      "originalCode": "current code snippet",
      "suggestedCode": "improved code snippet"
    }
  ],
  "vulnerabilities": [
    {
      "type": "SQL Injection|XSS|Authentication|etc",
      "severity": "low|medium|high|critical", 
      "description": "Detailed vulnerability explanation",
      "lineNumber": 25,
      "cwe": "CWE-89"
    }
  ],
  "performance": [
    {
      "issue": "Performance problem description",
      "impact": "low|medium|high",
      "suggestion": "How to improve performance",
      "lineNumber": 30
    }
  ],
  "maintainability": {
    "score": 75,
    "issues": [
      {
        "type": "Complex Function|Long Method|etc",
        "description": "Maintainability issue description",
        "lineNumber": 40
      }
    ]
  },
  "complexity": {
    "cyclomaticComplexity": 8,
    "cognitiveComplexity": 12,
    "suggestions": ["Break down large functions", "Reduce nesting"]
  },
  "documentation": {
    "coverageScore": 60,
    "suggestions": ["Add function documentation", "Include usage examples"]
  },
  "testing": {
    "recommendations": ["Add unit tests", "Test edge cases"],
    "coverageAnalysis": "Assessment of current testing approach"
  }
}`;

    let userPrompt = `**LANGUAGE:** ${language}\n`;

    if (filename) {
      userPrompt += `**FILENAME:** ${filename}\n`;
    }

    userPrompt += `\n**CODE TO ANALYZE:**\n\`\`\`${language}\n${code}\n\`\`\`\n`;

    // Include Semgrep findings if available
    if (semgrepFindings?.results?.length) {
      userPrompt += `\n**STATIC ANALYSIS FINDINGS:**\n`;
      userPrompt += `Found ${semgrepFindings.results.length} potential issues:\n`;

      semgrepFindings.results.slice(0, 10).forEach((finding, index) => {
        userPrompt += `${index + 1}. ${finding.message} (Line ${
          finding.start.line
        }) - Severity: ${finding.severity}\n`;
      });

      if (semgrepFindings.results.length > 10) {
        userPrompt += `... and ${
          semgrepFindings.results.length - 10
        } more findings\n`;
      }
    }

    userPrompt += `\n**INSTRUCTIONS:**
Analyze the code thoroughly and integrate the static analysis findings. Provide comprehensive feedback covering all categories. Return only the JSON response.`;

    return systemPrompt + "\n\n" + userPrompt;
  }

  /**
   * Call Gemini API
   */
  private async callGeminiAPI(prompt: string): Promise<CodeReviewResult> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error) {
      console.error("Gemini API call failed:", error);
      throw new Error(
        `Gemini API failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Parse AI response and validate structure
   */
  private parseAIResponse(response: string): CodeReviewResult {
    try {
      // Clean response (remove markdown if present)
      let cleanedResponse = response.trim();

      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/^```json\s*\n/, "");
      cleanedResponse = cleanedResponse.replace(/\n```$/, "");
      cleanedResponse = cleanedResponse.trim();

      const parsed = JSON.parse(cleanedResponse);

      // Validate and provide defaults
      return {
        summary: parsed.summary || "Code analysis completed",
        bestPractices: Array.isArray(parsed.bestPractices)
          ? parsed.bestPractices
          : [],
        refactoring: Array.isArray(parsed.refactoring)
          ? parsed.refactoring
          : [],
        vulnerabilities: Array.isArray(parsed.vulnerabilities)
          ? parsed.vulnerabilities
          : [],
        performance: Array.isArray(parsed.performance)
          ? parsed.performance
          : [],
        maintainability: {
          score: parsed.maintainability?.score ?? 70,
          issues: Array.isArray(parsed.maintainability?.issues)
            ? parsed.maintainability.issues
            : [],
        },
        complexity: {
          cyclomaticComplexity: parsed.complexity?.cyclomaticComplexity,
          cognitiveComplexity: parsed.complexity?.cognitiveComplexity,
          suggestions: Array.isArray(parsed.complexity?.suggestions)
            ? parsed.complexity.suggestions
            : [],
        },
        documentation: {
          coverageScore: parsed.documentation?.coverageScore ?? 50,
          suggestions: Array.isArray(parsed.documentation?.suggestions)
            ? parsed.documentation.suggestions
            : [],
        },
        testing: {
          recommendations: Array.isArray(parsed.testing?.recommendations)
            ? parsed.testing.recommendations
            : [],
          coverageAnalysis:
            parsed.testing?.coverageAnalysis || "No testing analysis provided",
        },
      };
    } catch (error) {
      console.error("Failed to parse AI response:", response);
      throw new Error(
        `Failed to parse AI response: ${
          error instanceof Error ? error.message : "Invalid JSON"
        }`
      );
    }
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => resolve("TIMEOUT"), AIService.TIMEOUT_MS);
    });
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Truncate code to fit within token limits
   */
  private truncateCode(code: string): string {
    const lines = code.split("\n");
    const maxLines = Math.floor((AIService.MAX_TOKENS * 4) / 100); // Conservative estimate

    if (lines.length <= maxLines) {
      return code;
    }

    const truncatedLines = lines.slice(0, maxLines);
    truncatedLines.push(
      "",
      "// ... Code truncated for analysis ...",
      `// Original file had ${lines.length} lines, showing first ${maxLines} lines`
    );

    return truncatedLines.join("\n");
  }

  /**
   * Check if AI service is properly configured
   */
  static isConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }
}

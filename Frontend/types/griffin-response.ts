export interface GriffinResponse {
  summary: string
  vulnerabilities: Array<{
    type: string
    severity: string
    description: string
    lineNumber?: number
    cwe?: string
  }>
  bestPractices: Array<{
    category: string
    severity: string
    message: string
    lineNumber?: number
  }>
  refactoring: Array<{
    suggestion: string
    impact: string
    originalCode?: string
    suggestedCode?: string
    lineNumber?: number
  }>
  performance: Array<{
    issue: string
    impact: string
    suggestion: string
    lineNumber?: number
  }>
  maintainability: {
    score: number
    issues: Array<{
      type: string
      description: string
      lineNumber?: number
    }>
  }
  complexity?: {
    cyclomaticComplexity: number
    cognitiveComplexity: number
    suggestions: string[]
  }
  documentation: {
    coverageScore: number
    suggestions: string[]
  }
  testing?: {
    coverageAnalysis: string
    recommendations: string[]
  }
}

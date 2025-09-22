"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Lightbulb,
  RefreshCw,
  Zap,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Loader2,
} from "lucide-react"
import type { GriffinResponse } from "@/types/griffin-response"

interface ReviewResultsProps {
  data: GriffinResponse | null
  isLoading: boolean
}

export function ReviewResults({ data, isLoading }: ReviewResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Analyzing your code...</p>
            <p className="text-muted-foreground">
              Griffin is reviewing your code for security, best practices, and optimization opportunities.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No analysis yet</p>
            <p className="text-muted-foreground">
              Upload a code file to get started with Griffin's intelligent review.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4 text-destructive" />
      case "high":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "medium":
        return <Info className="w-4 h-4 text-blue-500" />
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "warning":
        return "secondary"
      case "medium":
        return "secondary"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-accent" />
            Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{data.summary}</p>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintainability</p>
                <p className="text-2xl font-bold">{data.maintainability.score}/10</p>
              </div>
              <Progress value={data.maintainability.score * 10} className="w-16" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documentation</p>
                <p className="text-2xl font-bold">{data.documentation.coverageScore}%</p>
              </div>
              <Progress value={data.documentation.coverageScore} className="w-16" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Tabs defaultValue="vulnerabilities" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vulnerabilities" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="best-practices" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Best Practices
          </TabsTrigger>
          <TabsTrigger value="refactoring" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refactoring
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vulnerabilities" className="space-y-4">
          {data.vulnerabilities.map((vuln, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(vuln.severity)}
                    <h4 className="font-medium">{vuln.type}</h4>
                  </div>
                  <Badge variant={getSeverityColor(vuln.severity) as any}>{vuln.severity}</Badge>
                </div>
                <p className="text-muted-foreground mb-2">{vuln.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {vuln.lineNumber && <span>Line {vuln.lineNumber}</span>}
                  {vuln.cwe && <span>{vuln.cwe}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-4">
          {data.bestPractices.map((practice, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(practice.severity)}
                    <h4 className="font-medium">{practice.category}</h4>
                  </div>
                  <Badge variant={getSeverityColor(practice.severity) as any}>{practice.severity}</Badge>
                </div>
                <p className="text-muted-foreground mb-2">{practice.message}</p>
                {practice.lineNumber && (
                  <span className="text-sm text-muted-foreground">Line {practice.lineNumber}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="refactoring" className="space-y-4">
          {data.refactoring.map((refactor, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{refactor.suggestion}</h4>
                  <Badge variant={getSeverityColor(refactor.impact) as any}>{refactor.impact} impact</Badge>
                </div>
                {refactor.originalCode && refactor.suggestedCode && (
                  <div className="space-y-2 mt-3">
                    <div className="bg-destructive/10 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Before:</p>
                      <code className="text-sm font-mono">{refactor.originalCode}</code>
                    </div>
                    <div className="bg-accent/10 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">After:</p>
                      <code className="text-sm font-mono">{refactor.suggestedCode}</code>
                    </div>
                  </div>
                )}
                {refactor.lineNumber && (
                  <span className="text-sm text-muted-foreground">Line {refactor.lineNumber}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {data.performance.map((perf, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{perf.issue}</h4>
                  <Badge variant={getSeverityColor(perf.impact) as any}>{perf.impact} impact</Badge>
                </div>
                <p className="text-muted-foreground mb-2">{perf.suggestion}</p>
                {perf.lineNumber && <span className="text-sm text-muted-foreground">Line {perf.lineNumber}</span>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

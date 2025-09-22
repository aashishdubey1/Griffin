"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import apiService from "@/lib/api-service"

export function DemoJobFlow() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<any>(null)

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    const emoji = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"
    setLogs(prev => [...prev, `[${timestamp}] ${emoji} ${message}`])
  }

  const handleSubmit = async () => {
    if (!code.trim()) return

    setIsLoading(true)
    setJobId(null)
    setJobStatus(null)
    setLogs([])

    try {
      // Step 1: POST request to http://localhost:4000/api/review/submit
      addLog("Step 1: Sending POST request to http://localhost:4000/api/review/submit")
      addLog(`Payload: ${JSON.stringify({ code: code.trim() }, null, 2)}`)
      
      const result = await apiService.submitReview({ code: code.trim() })
      
      addLog(`Response received: ${JSON.stringify(result, null, 2)}`, "success")
      
      if (result.success && result.jobId) {
        setJobId(result.jobId)
        addLog(`Job ID extracted: ${result.jobId}`, "success")
        
        // Step 2: Automatically use jobId to check status
        addLog("Step 2: Automatically checking job status...")
        await checkJobStatus(result.jobId)
      } else {
        addLog(`Submission failed: ${result.message || "Unknown error"}`, "error")
      }
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const checkJobStatus = async (jobIdToCheck: string) => {
    try {
      addLog(`Sending GET request to http://localhost:4000/api/review/jobs/${jobIdToCheck}/status`)
      
      const statusResult = await apiService.getJobStatus(jobIdToCheck)
      
      addLog(`Status response: ${JSON.stringify(statusResult, null, 2)}`, "success")
      setJobStatus(statusResult.data)
      
      if (statusResult.data?.status === "completed") {
        addLog("Job completed successfully!", "success")
      } else if (statusResult.data?.status === "failed") {
        addLog(`Job failed: ${statusResult.data.error}`, "error")
      } else {
        addLog(`Job status: ${statusResult.data?.status}`, "info")
      }
    } catch (error) {
      addLog(`Error checking status: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    }
  }

  const clearLogs = () => {
    setLogs([])
    setJobId(null)
    setJobStatus(null)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automatic Job Submission & Status Check Demo</CardTitle>
          <CardDescription>
            This demonstrates the exact flow you requested:
            <br />
            1. POST to <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">http://localhost:4000/api/review/submit</code>
            <br />
            2. Extract jobId from response
            <br />
            3. GET to <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">http://localhost:4000/api/review/jobs/{"{jobId}"}/status</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Test Code:</label>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter some code to test the flow..."
              className="mt-1"
              rows={4}
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !code.trim()}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Submit & Check Status Automatically"}
          </Button>

          {jobId && (
            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Job ID:</span>
                    <Badge variant="secondary">{jobId}</Badge>
                  </div>
                  
                  {jobStatus && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge variant={
                        jobStatus.status === "completed" ? "default" :
                        jobStatus.status === "failed" ? "destructive" :
                        "secondary"
                      }>
                        {jobStatus.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Request/Response Log</CardTitle>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Click submit to see the automatic flow...</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

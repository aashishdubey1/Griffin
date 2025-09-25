"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import apiService from "@/lib/api-service"
import simpleApiService from "@/lib/api-service-simple"

export function DebugApi() {
  const [logs, setLogs] = useState<string[]>([])
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    const emoji = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"
    setLogs(prev => [...prev, `[${timestamp}] ${emoji} ${message}`])
  }

  const testConnection = async () => {
    setIsLoading(true)
    addLog("Testing API connection...")
    
    try {
      // Test basic connectivity
      addLog("1. Testing basic connectivity to http://localhost:4000")
      const response = await fetch("http://localhost:4000/api/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      })
      
      if (response.ok) {
        addLog("✅ Backend is reachable", "success")
      } else {
        addLog(`❌ Backend responded with status: ${response.status}`, "error")
      }
    } catch (error) {
      addLog(`❌ Cannot reach backend: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
      addLog("Make sure your backend server is running on http://localhost:4000", "error")
    }
    
    setIsLoading(false)
  }

  const testSubmitReview = async () => {
    if (!code.trim()) {
      addLog("❌ Please enter some code to test", "error")
      return
    }

    setIsLoading(true)
    addLog("Testing review submission...")
    
    try {
      addLog("2. Testing POST to /api/review/submit")
      addLog(`Payload: ${JSON.stringify({ code: code.trim() }, null, 2)}`)
      
      // Try with simple API service first (no auth)
      addLog("Trying with simple API service (no authentication)...")
      const result = await simpleApiService.submitReview({ code: code.trim() })
      
      addLog(`✅ Review submission successful:`, "success")
      addLog(JSON.stringify(result, null, 2))
      
      if (result.jobId) {
        addLog(`3. Testing GET to /api/review/jobs/${result.jobId}/status`)
        
        const statusResult = await simpleApiService.getJobStatus(result.jobId)
        addLog(`✅ Job status check successful:`, "success")
        addLog(JSON.stringify(statusResult, null, 2))
      }
      
    } catch (error) {
      addLog(`❌ Review submission failed:`, "error")
      addLog(error instanceof Error ? error.message : "Unknown error", "error")
      
      // Try with regular API service as fallback
      try {
        addLog("Trying with regular API service (with authentication)...")
        const result = await apiService.submitReview({ code: code.trim() })
        addLog(`✅ Review submission successful with auth:`, "success")
        addLog(JSON.stringify(result, null, 2))
      } catch (authError) {
        addLog(`❌ Also failed with authentication:`, "error")
        addLog(authError instanceof Error ? authError.message : "Unknown error", "error")
      }
      
      // Check if it's a network error
      if (error instanceof Error && error.message.includes("fetch")) {
        addLog("This looks like a network connectivity issue", "error")
        addLog("Make sure your backend server is running on http://localhost:4000", "error")
      }
    }
    
    setIsLoading(false)
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Debug Tool</CardTitle>
          <CardDescription>
            This tool helps diagnose issues with the API connection and job submission flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={isLoading}>
              Test Backend Connection
            </Button>
            <Button onClick={testSubmitReview} disabled={isLoading || !code.trim()}>
              Test Review Submission
            </Button>
            <Button variant="outline" onClick={clearLogs}>
              Clear Logs
            </Button>
          </div>
          
          <div>
            <label className="text-sm font-medium">Test Code:</label>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter some code to test the review submission..."
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Click "Test Backend Connection" to start debugging...</p>
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

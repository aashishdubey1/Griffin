"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useJobTracker } from "@/hooks/use-job-tracker"
import apiService from "@/lib/api-service"

export function TestJobFlow() {
  const [code, setCode] = useState("")
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const {
    jobStatus,
    isCompleted,
    isFailed,
    isProcessing,
    progress,
    error: jobError
  } = useJobTracker(currentJobId, {
    onComplete: (result) => {
      addLog(`✅ Job completed successfully! Result: ${JSON.stringify(result, null, 2)}`)
      setCurrentJobId(null)
    },
    onError: (error) => {
      addLog(`❌ Job failed: ${error}`)
      setCurrentJobId(null)
    }
  })

  const handleSubmit = async () => {
    if (!code.trim()) return

    setIsSubmitting(true)
    addLog("🚀 Starting job submission...")

    try {
      // Step 1: POST request to /api/review/submit
      addLog("📤 Sending POST request to http://localhost:4000/api/review/submit")
      const result = await apiService.submitReview({ code: code.trim() })
      
      addLog(`📥 Response received: ${JSON.stringify(result, null, 2)}`)

      if (result.success && result.jobId) {
        addLog(`🎯 Job ID received: ${result.jobId}`)
        setCurrentJobId(result.jobId)
        
        // Step 2: Automatic GET requests to /api/review/jobs/{jobId}/status
        addLog(`🔄 Starting automatic polling of http://localhost:4000/api/review/jobs/${result.jobId}/status`)
        addLog("⏳ Job tracking will continue automatically until completion...")
      } else {
        addLog(`❌ Submission failed: ${result.message || "Unknown error"}`)
      }
    } catch (error) {
      addLog(`❌ Error during submission: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automatic Job Submission & Status Tracking Test</CardTitle>
          <CardDescription>
            This component demonstrates the automatic job submission and status checking flow:
            <br />
            1. POST to <code>http://localhost:4000/api/review/submit</code> → Returns jobId
            <br />
            2. Automatic GET requests to <code>http://localhost:4000/api/review/jobs/{"{jobId}"}/status</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Test Code:</label>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter some code to test the review flow..."
              className="mt-1"
              rows={6}
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !code.trim()}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Code for Review"}
          </Button>

          {currentJobId && (
            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Job ID:</span>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                      {currentJobId}
                    </code>
                  </div>
                  
                  {jobStatus && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Status:</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          isCompleted ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          isFailed ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                          isProcessing ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        }`}>
                          {jobStatus.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress:</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {jobError && (
                    <div className="text-red-600 dark:text-red-400 text-sm">
                      Error: {jobError}
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
            <CardTitle>Activity Log</CardTitle>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              Clear Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No activity yet...</p>
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

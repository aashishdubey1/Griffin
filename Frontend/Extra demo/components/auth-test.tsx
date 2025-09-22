"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import apiService from "@/lib/api-service"

export function AuthTest() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [jobId, setJobId] = useState("")
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user, login, logout, isAuthenticated } = useAuth()

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    const emoji = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"
    setLogs(prev => [...prev, `[${timestamp}] ${emoji} ${message}`])
  }

  // Step 1: Login Flow
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      addLog("Please enter both email and password", "error")
      return
    }

    setIsLoading(true)
    addLog("🚀 Starting Login Flow...")
    
    try {
      addLog(`1. Sending POST request to http://localhost:4000/api/auth/login`)
      addLog(`Payload: ${JSON.stringify({ email, password }, null, 2)}`)
      
      const success = await login(email, password)
      
      if (success) {
        addLog("✅ Login successful!", "success")
        addLog(`Token stored in localStorage as "authToken"`, "success")
        addLog(`User data: ${JSON.stringify(user, null, 2)}`)
        
        // Verify token is stored
        const storedToken = localStorage.getItem("authToken")
        addLog(`Verification: Token in localStorage = ${storedToken ? "Present" : "Missing"}`, "success")
      } else {
        addLog("❌ Login failed - invalid credentials", "error")
      }
    } catch (error) {
      addLog(`❌ Login error: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Submit Review (POST)
  const submitReview = async () => {
    if (!code.trim()) {
      addLog("Please enter some code to review", "error")
      return
    }

    setIsLoading(true)
    addLog("📤 Starting Submit Review Flow...")
    
    try {
      const token = localStorage.getItem("authToken")
      addLog(`Using token from localStorage: ${token ? "Present" : "Missing"}`)
      
      addLog(`2. Sending POST request to http://localhost:4000/api/review/submit`)
      addLog(`Headers: { "Content-Type": "application/json", "Authorization": "Bearer ${token}" }`)
      addLog(`Payload: ${JSON.stringify({ code: code.trim() }, null, 2)}`)
      
      const result = await apiService.submitReview({ code: code.trim() })
      
      addLog(`Response: ${JSON.stringify(result, null, 2)}`, "success")
      
      if (result.success && result.jobId) {
        setJobId(result.jobId)
        addLog(`✅ Review submitted successfully! Job ID: ${result.jobId}`, "success")
      } else {
        addLog(`❌ Review submission failed: ${result.message || "Unknown error"}`, "error")
      }
    } catch (error) {
      addLog(`❌ Review submission error: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Check Job Status (GET)
  const checkJobStatus = async () => {
    if (!jobId.trim()) {
      addLog("Please submit a review first to get a job ID", "error")
      return
    }

    setIsLoading(true)
    addLog("🔍 Starting Check Job Status Flow...")
    
    try {
      const token = localStorage.getItem("authToken")
      addLog(`Using token from localStorage: ${token ? "Present" : "Missing"}`)
      
      addLog(`3. Sending GET request to http://localhost:4000/api/review/jobs/${jobId}/status`)
      addLog(`Headers: { "Authorization": "Bearer ${token}" }`)
      
      const result = await apiService.getJobStatus(jobId)
      
      addLog(`Response: ${JSON.stringify(result, null, 2)}`, "success")
      
      if (result.success) {
        addLog(`✅ Job status retrieved successfully!`, "success")
        addLog(`Status: ${result.data?.status || "Unknown"}`, "info")
      } else {
        addLog(`❌ Job status check failed: ${result.error || "Unknown error"}`, "error")
      }
    } catch (error) {
      addLog(`❌ Job status check error: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const testLogout = async () => {
    addLog("🚪 Testing logout...")
    try {
      await logout()
      addLog("✅ Logout successful! Token removed from localStorage", "success")
      setJobId("")
    } catch (error) {
      addLog(`❌ Logout error: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Secure Authentication & API Flow Test</CardTitle>
          <CardDescription>
            Complete implementation of the authentication flow as specified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Login */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Login Flow</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={handleLogin} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Logging in..." : "Login & Store Token"}
            </Button>
          </div>

          {/* Step 2: Submit Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Submit Review (POST)</h3>
            <div className="space-y-2">
              <Label htmlFor="code">Code to Review</Label>
              <Textarea
                id="code"
                placeholder="Enter some code to review..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={4}
              />
            </div>
            <Button 
              onClick={submitReview} 
              disabled={isLoading || !isAuthenticated}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Submitting..." : "Submit Review with Token"}
            </Button>
          </div>

          {/* Step 3: Check Job Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 3: Check Job Status (GET)</h3>
            <div className="space-y-2">
              <Label htmlFor="jobId">Job ID</Label>
              <Input
                id="jobId"
                placeholder="Job ID from step 2"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              />
            </div>
            <Button 
              onClick={checkJobStatus} 
              disabled={isLoading || !isAuthenticated || !jobId}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Checking..." : "Check Status with Token"}
            </Button>
          </div>

          {/* Controls */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={testLogout} 
              disabled={isLoading}
              variant="outline"
            >
              Logout & Clear Token
            </Button>
            <Button onClick={clearLogs} variant="outline">
              Clear Logs
            </Button>
          </div>

          {/* Status */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold">Current Status:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}</p>
              <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : "None"}</p>
              <p><strong>Token in localStorage:</strong> {localStorage.getItem("authToken") ? "Present" : "Missing"}</p>
              <p><strong>Current Job ID:</strong> {jobId || "None"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Real-time Flow Logs</CardTitle>
          <CardDescription>Step-by-step execution logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Start with Step 1 to begin the flow.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

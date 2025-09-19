/**
 * Example Component Demonstrating Complete Authentication Flow
 * Shows the implementation of:
 * 1. Login with email → token storage
 * 2. Submit review → get jobId
 * 3. Poll job status → get results
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuthFlow } from "@/hooks/use-auth-flow";
import { useToast } from "@/hooks/use-toast";

export function AuthFlowExample() {
  const [email, setEmail] = useState("demo@griffin.dev");
  const [code, setCode] = useState(`function greet(name) {
  console.log("Hello, " + name);
  return "Hello, " + name;
}

greet("World");`);
  const [language, setLanguage] = useState("javascript");
  const [reviewResult, setReviewResult] = useState<any>(null);

  const {
    isLoading,
    error,
    currentJobId,
    jobStatus,
    login,
    submitReview,
    pollJobStatus,
    completeWorkflow,
    isAuthenticated,
    logout,
    clearError,
  } = useAuthFlow();

  const { toast } = useToast();

  // Step 1: Login with email only
  const handleLogin = async () => {
    clearError();
    const success = await login(email);
    
    if (success) {
      toast({
        title: "Login Successful",
        description: `Token stored in localStorage for ${email}`,
      });
    } else {
      toast({
        title: "Login Failed",
        description: error || "Please check your email",
        variant: "destructive",
      });
    }
  };

  // Step 2: Submit review and get jobId
  const handleSubmitReview = async () => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please login first",
        variant: "destructive",
      });
      return;
    }

    clearError();
    const jobId = await submitReview({
      code,
      language,
      filename: "example.js",
    });

    if (jobId) {
      toast({
        title: "Review Submitted",
        description: `Job ID: ${jobId}`,
      });
      
      // Step 3: Start polling for job status
      pollJobStatus(
        jobId,
        (result) => {
          setReviewResult(result);
          toast({
            title: "Review Completed",
            description: "Your code review is ready!",
          });
        },
        (error) => {
          toast({
            title: "Review Failed",
            description: error,
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Submission Failed",
        description: error || "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  // Complete workflow in one go
  const handleCompleteWorkflow = async () => {
    clearError();
    setReviewResult(null);

    await completeWorkflow(
      email,
      { code, language, filename: "example.js" },
      (result) => {
        setReviewResult(result);
        toast({
          title: "Workflow Completed",
          description: "Login → Submit → Review completed successfully!",
        });
      },
      (error) => {
        toast({
          title: "Workflow Failed",
          description: error,
          variant: "destructive",
        });
      }
    );
  };

  const handleLogout = () => {
    logout();
    setReviewResult(null);
    toast({
      title: "Logged Out",
      description: "Token cleared from localStorage",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-600";
      case "processing": return "text-blue-600";
      case "completed": return "text-green-600";
      case "failed": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Flow Demo</CardTitle>
          <CardDescription>
            Demonstrates the complete flow: Email login → Token storage → Authenticated API requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authentication Status */}
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  Status: {isAuthenticated() ? "✅ Authenticated" : "❌ Not Authenticated"}
                </p>
                {isAuthenticated() && (
                  <p className="text-sm text-gray-600">
                    Token: {localStorage.getItem("authToken")?.substring(0, 20)}...
                  </p>
                )}
              </div>
              {isAuthenticated() && (
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </div>
          </div>

          {/* Step 1: Login */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Login with Email</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@griffin.dev"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleLogin} disabled={isLoading || !email}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2: Submit Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Submit Code Review</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="javascript"
                />
              </div>
              <div>
                <Label htmlFor="code">Code</Label>
                <Textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-h-[120px] font-mono"
                  placeholder="Enter your code here..."
                />
              </div>
              <Button 
                onClick={handleSubmitReview} 
                disabled={isLoading || !isAuthenticated() || !code.trim()}
                className="w-full"
              >
                {isLoading ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>

          {/* Step 3: Job Status */}
          {currentJobId && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 3: Job Status</h3>
              <div className="p-4 border rounded-lg">
                <div className="space-y-2">
                  <p><strong>Job ID:</strong> {currentJobId}</p>
                  {jobStatus && (
                    <>
                      <p>
                        <strong>Status:</strong> 
                        <span className={`ml-2 font-medium ${getStatusColor(jobStatus.status)}`}>
                          {jobStatus.status.toUpperCase()}
                        </span>
                      </p>
                      {jobStatus.status === "processing" && (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                          <span className="text-sm text-gray-600">Processing your code...</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Complete Workflow Button */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Complete Workflow (All Steps)</h3>
            <Button 
              onClick={handleCompleteWorkflow}
              disabled={isLoading || !email || !code.trim()}
              className="w-full"
              variant="default"
            >
              {isLoading ? "Running Workflow..." : "Run Complete Workflow"}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Review Results */}
          {reviewResult && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review Results</h3>
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(reviewResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Implementation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold">Authentication Flow:</h4>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>User enters email and clicks login</li>
                <li>POST request to <code>http://localhost:4000/api/login</code></li>
                <li>Backend responds with token</li>
                <li>Token stored in <code>localStorage.setItem("authToken", token)</code></li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold">API Request Flow:</h4>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Get token from <code>localStorage.getItem("authToken")</code></li>
                <li>Include in headers: <code>Authorization: Bearer {'{'}{'{'}token{'}'}</code></li>
                <li>POST to <code>/api/review/submit</code> → get jobId</li>
                <li>GET <code>/api/review/jobs/{'{'}jobId{'}'}/status</code> → poll until complete</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
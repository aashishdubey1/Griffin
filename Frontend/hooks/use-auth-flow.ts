/**
 * Custom React Hook for Authentication Flow
 * Implements the complete usage flow:
 * 1. User logs in → token stored in localStorage
 * 2. User submits review → gets jobId  
 * 3. Frontend periodically checks job status using that jobId
 */

"use client";

import { useState, useCallback } from "react";
import { authService } from "@/lib/auth-service";

interface ReviewData {
  code: string;
  language?: string;
  filename?: string;
}

interface JobStatus {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: any;
  error?: string;
}

export function useAuthFlow() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);

  /**
   * Step 1: User logs in using email
   * Token is automatically stored in localStorage
   */
  const login = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await authService.handleLogin(email);
      
      if (token) {
        console.log("Login successful, token stored in localStorage");
        return true;
      } else {
        setError("Login failed. Please check your email.");
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Step 2: Submit review and get jobId
   * Token is automatically included in request headers
   */
  const submitReview = useCallback(async (reviewData: ReviewData): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const jobId = await authService.submitReview(reviewData);
      
      if (jobId) {
        setCurrentJobId(jobId);
        console.log(`Review submitted successfully, jobId: ${jobId}`);
        return jobId;
      } else {
        setError("Review submission failed");
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Review submission failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Step 3: Check job status using jobId
   * Token is automatically included in request headers
   */
  const checkJobStatus = useCallback(async (jobId?: string): Promise<JobStatus | null> => {
    const targetJobId = jobId || currentJobId;
    
    if (!targetJobId) {
      setError("No job ID available");
      return null;
    }

    try {
      const status = await authService.checkJobStatus(targetJobId);
      setJobStatus(status);
      
      if (status.status === "failed") {
        setError(status.error || "Job failed");
      }
      
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check job status";
      setError(errorMessage);
      return null;
    }
  }, [currentJobId]);

  /**
   * Periodically check job status until completion
   */
  const pollJobStatus = useCallback(async (
    jobId?: string,
    onComplete?: (result: any) => void,
    onError?: (error: string) => void,
    pollInterval: number = 2000
  ): Promise<void> => {
    const targetJobId = jobId || currentJobId;
    
    if (!targetJobId) {
      const error = "No job ID available for polling";
      setError(error);
      onError?.(error);
      return;
    }

    const poll = async () => {
      try {
        const status = await checkJobStatus(targetJobId);
        
        if (!status) {
          return;
        }

        if (status.status === "completed") {
          console.log("Job completed successfully:", status.result);
          onComplete?.(status.result);
          return;
        }
        
        if (status.status === "failed") {
          const error = status.error || "Job failed";
          console.error("Job failed:", error);
          onError?.(error);
          return;
        }

        // Continue polling if still pending or processing
        if (status.status === "pending" || status.status === "processing") {
          setTimeout(poll, pollInterval);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Polling failed";
        console.error("Polling error:", errorMessage);
        onError?.(errorMessage);
      }
    };

    // Start polling
    poll();
  }, [currentJobId, checkJobStatus]);

  /**
   * Complete workflow: login → submit → poll
   */
  const completeWorkflow = useCallback(async (
    email: string,
    reviewData: ReviewData,
    onComplete?: (result: any) => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    try {
      // Step 1: Login
      const loginSuccess = await login(email);
      if (!loginSuccess) {
        onError?.("Login failed");
        return;
      }

      // Step 2: Submit review
      const jobId = await submitReview(reviewData);
      if (!jobId) {
        onError?.("Review submission failed");
        return;
      }

      // Step 3: Poll for completion
      await pollJobStatus(jobId, onComplete, onError);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Workflow failed";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [login, submitReview, pollJobStatus]);

  /**
   * Check authentication status
   */
  const isAuthenticated = useCallback((): boolean => {
    return authService.isAuthenticated();
  }, []);

  /**
   * Logout and clear stored data
   */
  const logout = useCallback((): void => {
    authService.logout();
    setCurrentJobId(null);
    setJobStatus(null);
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    currentJobId,
    jobStatus,
    
    // Actions
    login,
    submitReview,
    checkJobStatus,
    pollJobStatus,
    completeWorkflow,
    
    // Utilities
    isAuthenticated,
    logout,
    
    // Clear state
    clearError: () => setError(null),
    clearJobId: () => setCurrentJobId(null),
  };
}

/**
 * Example usage:
 * 
 * const { login, submitReview, pollJobStatus, isAuthenticated } = useAuthFlow();
 * 
 * // Complete flow
 * await login("user@example.com");
 * const jobId = await submitReview({ code: "console.log('hello')" });
 * await pollJobStatus(jobId, (result) => console.log("Completed:", result));
 */
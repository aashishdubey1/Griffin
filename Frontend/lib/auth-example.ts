// Example implementation of the secure authentication flow
// This file demonstrates the exact pattern you requested

const API_BASE_URL = "http://localhost:4000/api";

// Store token after login
async function handleLogin(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (data.success && data.data?.token) {
      // Store token in localStorage as "authToken"
      localStorage.setItem("authToken", data.data.token);
      console.log("Token stored successfully:", data.data.token);
      return true;
    } else {
      console.error("Login failed:", data.message);
      return false;
    }
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

// Submit review with token in header
async function submitReview(reviewData: { code: string }) {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("No authentication token found. Please login first.");
  }

  const response = await fetch(`${API_BASE_URL}/review/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });

  const result = await response.json();
  
  if (result.success && result.jobId) {
    return result.jobId;
  } else {
    throw new Error(result.message || "Review submission failed");
  }
}

// Check job status with token in header
async function checkJobStatus(jobId: string) {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("No authentication token found. Please login first.");
  }

  const response = await fetch(
    `${API_BASE_URL}/review/jobs/${jobId}/status`,
    {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}` 
      },
    }
  );

  return response.json();
}

// Complete usage flow example
async function completeFlow() {
  try {
    // Step 1: User logs in → token stored in localStorage
    console.log("Step 1: Logging in...");
    const loginSuccess = await handleLogin("user@example.com", "password");
    
    if (!loginSuccess) {
      console.error("Login failed, cannot proceed");
      return;
    }

    // Step 2: User submits review → gets jobId
    console.log("Step 2: Submitting review...");
    const jobId = await submitReview({ 
      code: "function example() { return 'hello world'; }" 
    });
    console.log("Review submitted, Job ID:", jobId);

    // Step 3: Frontend periodically checks job status using that jobId
    console.log("Step 3: Checking job status...");
    const status = await checkJobStatus(jobId);
    console.log("Job status:", status);

  } catch (error) {
    console.error("Flow error:", error);
  }
}

// Export functions for use
export {
  handleLogin,
  submitReview,
  checkJobStatus,
  completeFlow
};

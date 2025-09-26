export interface LoginCredentials {
  email: string;
  password?: string; // Optional to support email-only login
}

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      username?: string;
      name?: string;
      profile?: {
        name?: string;
      };
    };
    token: string;
  };
  message?: string;
}

export interface FileUploadResponse {
  success: boolean;
  jobId?: string;
  message?: string;
  data?: any; // For immediate analysis results
}

export interface JobStatus {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: any;
  error?: string;
  processingTime?: number;
  completedAt?: string;
  createdAt: string;
  progress?: number;
}

export interface JobStatusResponse {
  success: boolean;
  data?: JobStatus;
  error?: string;
  jobId?: string;
}

export interface ReviewSubmissionData {
  code: string;
  language?: string;
  filename?: string;
}

export interface CodeReviewResult {
  summary: string;
  bestPractices: Array<{
    category: string;
    message: string;
    severity: "low" | "medium" | "high" | "critical" | "warning";
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
    line?: number;
    suggestion?: string;
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
      category: string;
      description: string;
      line?: number;
      suggestion: string;
      lineNumber?: number;
    }>;
  };
  complexity: {
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    suggestions: Array<{
      description: string;
      suggestion: string;
      lineNumber?: number;
    }>;
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

export interface ReviewResponse {
  success: boolean;
  message: string;
  data: CodeReviewResult;
  jobId?: string;
}

const API_BASE_URL = "https://griffin-7kap.onrender.com/api";

class ApiService {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("authToken");
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    signal?: AbortSignal
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = new Headers({
      "Content-Type": "application/json",
    });

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.append(key, value as string);
      });
    }

    if (this.token) {
      headers.append("Authorization", `Bearer ${this.token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal, // Add signal for request cancellation
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Support both email-only and email+password login
    const loginData = credentials.password
      ? credentials
      : { email: credentials.email };

    const response = await this.makeRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(loginData),
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", response.data.token);
      }
    }

    return response;
  }

  // Email-only login method as specified in requirements
  async loginWithEmail(email: string): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", response.data.token);
      }
    }

    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", response.data.token);
      }
    }

    return response;
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      await this.makeRequest("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }

    return { success: true };
  }

  // File upload methods
  async uploadFile(file: File, signal?: AbortSignal): Promise<FileUploadResponse> {
    console.log("[ApiService] Starting file upload:", file.name, "Size:", file.size);
    
    if (!this.token) {
      throw new Error("Authentication required. Please login first.");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/review/submit-file`, {
        method: "POST",
        headers: {
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
        body: formData,
        signal, // Add abort signal support
      });

      console.log("[ApiService] Upload response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[ApiService] Upload failed:", response.status, errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("[ApiService] Upload successful - FULL RESPONSE:", JSON.stringify(result, null, 2));
      console.log("[ApiService] Response properties:", {
        success: result.success,
        jobId: result.jobId,
        message: result.message,
        data: result.data,
        hasJobId: !!result.jobId,
        hasData: !!result.data,
        allKeys: Object.keys(result)
      });
      return result;
    } catch (error: any) {
      if (signal?.aborted) {
        console.log("[ApiService] Upload request was cancelled");
        throw new Error("Upload was cancelled");
      }
      if (error.message.includes("Failed to fetch") || error.message.includes("fetch")) {
        console.error("[ApiService] Network error during upload:", error);
        throw new Error("Cannot connect to backend server. Please ensure the backend is running.");
      }
      console.error("[ApiService] Upload error:", error);
      throw error;
    }
  }

  // Review submission methods - ensures token is always included
  async submitReview(data: ReviewSubmissionData, signal?: AbortSignal): Promise<ReviewResponse> {
    if (!this.token) {
      throw new Error("Authentication required. Please login first.");
    }

    try {
      return await this.makeRequest<ReviewResponse>("/review/submit", {
        method: "POST",
        body: JSON.stringify(data),
      }, signal);
    } catch (error: any) {
      if (signal?.aborted) {
        throw new Error("Request was cancelled");
      }
      if (error.message.includes("Failed to fetch") || error.message.includes("fetch")) {
        throw new Error("Cannot connect to backend server. Please ensure the backend is running on port 4000.");
      }
      throw error;
    }
  }

  // Backend health check
  async checkBackendHealth(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        return { status: "healthy", message: "Backend is running" };
      } else {
        return { status: "unhealthy", message: `Backend responded with status: ${response.status}` };
      }
    } catch (error: any) {
      return { status: "unreachable", message: "Backend server is not reachable. Please start the backend server." };
    }
  }

  // Job status tracking methods - ensures token is always included
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    if (!this.token) {
      throw new Error("Authentication required. Please login first.");
    }

    return this.makeRequest<JobStatusResponse>(`/review/jobs/${jobId}/status`);
  }

  async getJobStatusImmediate(jobId: string): Promise<JobStatusResponse> {
    if (!this.token) {
      throw new Error("Authentication required. Please login first.");
    }

    return this.makeRequest<JobStatusResponse>(
      `/review/jobs/${jobId}/status/immediate`
    );
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

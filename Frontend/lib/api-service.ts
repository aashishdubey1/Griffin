export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    email: string
    name?: string
  }
  message?: string
}

export interface FileUploadResponse {
  success: boolean
  jobId?: string
  message?: string
}

export interface JobStatus {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  progress?: number
  result?: any
  error?: string
  createdAt: string
  updatedAt: string
}

export interface ReviewSubmissionData {
  code: string
  language?: string
  filename?: string
}

export interface ReviewResponse {
  success: boolean
  jobId?: string
  result?: {
    summary: string
    vulnerabilities: Array<{
      type: string
      severity: "low" | "medium" | "high" | "critical"
      description: string
      line?: number
      suggestion?: string
    }>
    bestPractices: Array<{
      type: string
      description: string
      line?: number
      suggestion: string
    }>
    refactoring: Array<{
      type: string
      description: string
      line?: number
      suggestion: string
      impact: "low" | "medium" | "high"
    }>
  }
  message?: string
}

const API_BASE_URL = "http://localhost:4000/api"

class ApiService {
  private token: string | null = null

  constructor() {
    // Initialize token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const headers = new Headers({
      "Content-Type": "application/json",
    })

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.append(key, value as string)
      })
    }

    if (this.token) {
      headers.append("Authorization", `Bearer ${this.token}`)
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.success && response.token) {
      this.token = response.token
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token)
      }
    }

    return response
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (response.success && response.token) {
      this.token = response.token
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token)
      }
    }

    return response
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      await this.makeRequest("/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }

    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }

    return { success: true }
  }

  // File upload methods
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/review/submit-file`, {
      method: "POST",
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Review submission methods
  async submitReview(data: ReviewSubmissionData): Promise<ReviewResponse> {
    return this.makeRequest<ReviewResponse>("/review/submit", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Job status tracking methods
  async getJobStatus(jobId: string): Promise<JobStatus> {
    return this.makeRequest<JobStatus>(`/review/jobs/${jobId}/status`)
  }

  async getJobStatusImmediate(jobId: string): Promise<JobStatus> {
    return this.makeRequest<JobStatus>(`/review/jobs/${jobId}/status/immediate`)
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token
  }

  getToken(): string | null {
    return this.token
  }

  setToken(token: string): void {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }
}

// Export singleton instance
export const apiService = new ApiService()
export default apiService

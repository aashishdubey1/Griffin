/**
 * Authentication Service
 * Implements the secure authentication flow as specified:
 * 1. Email-only login
 * 2. Token storage in localStorage
 * 3. Automatic token inclusion in all API requests
 */

const API_BASE_URL = "https://griffin-7kap.onrender.com/api";

interface LoginResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    username?: string;
    name?: string;
  };
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("authToken");
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login with email only as specified in requirements
   */
  async handleLogin(email: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<LoginResponse> = await response.json();
      
      if (data.success && data.data?.token) {
        // Store token in localStorage as specified
        localStorage.setItem("authToken", data.data.token);
        this.token = data.data.token;
        return data.data.token;
      }
      
      throw new Error(data.message || "Login failed");
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  /**
   * Submit review with authentication
   * Ensures token is included in headers
   */
  async submitReview(reviewData: {
    code: string;
    language?: string;
    filename?: string;
  }): Promise<string | null> {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("Authentication required. Please login first.");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/review/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ jobId: string }> = await response.json();
      
      if (result.success && result.data?.jobId) {
        return result.data.jobId;
      }
      
      throw new Error(result.message || "Review submission failed");
    } catch (error) {
      console.error("Review submission error:", error);
      throw error;
    }
  }

  /**
   * Check job status with authentication
   * Uses the jobId from submitReview
   */
  async checkJobStatus(jobId: string): Promise<any> {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("Authentication required. Please login first.");
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/review/jobs/${jobId}/status`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Job status check error:", error);
      throw error;
    }
  }

  /**
   * Generic authenticated request helper
   * Automatically includes token in headers for any API call
   */
  async makeAuthenticatedRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("Authentication required. Please login first.");
    }

    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);
    
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  /**
   * Logout and clear stored token
   */
  logout(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("griffin-user");
    this.token = null;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

/**
 * Example usage as provided in requirements:
 * 
 * // Store token after login
 * const token = await authService.handleLogin("user@example.com");
 * 
 * // Submit review
 * const jobId = await authService.submitReview({
 *   code: "console.log('hello world')",
 *   language: "javascript"
 * });
 * 
 * // Check job status
 * const status = await authService.checkJobStatus(jobId);
 */
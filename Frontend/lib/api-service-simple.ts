// Simplified API service for testing without authentication
const API_BASE_URL = "https://griffin-7kap.onrender.com/api";

export interface ReviewSubmissionData {
  code: string;
  language?: string;
  filename?: string;
}

export interface ReviewResponse {
  success: boolean;
  jobId?: string;
  result?: any;
  message?: string;
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

class SimpleApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
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

    console.log(`[SimpleApiService] Making request to: ${url}`);
    console.log(`[SimpleApiService] Options:`, options);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`[SimpleApiService] Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      console.error(`[SimpleApiService] Error:`, errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`[SimpleApiService] Response data:`, data);
    return data;
  }

  async submitReview(data: ReviewSubmissionData): Promise<ReviewResponse> {
    console.log(`[SimpleApiService] Submitting review with data:`, data);
    return this.makeRequest<ReviewResponse>("/review/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    console.log(`[SimpleApiService] Getting job status for: ${jobId}`);
    return this.makeRequest<JobStatusResponse>(`/review/jobs/${jobId}/status`);
  }
}

export const simpleApiService = new SimpleApiService();
export default simpleApiService;

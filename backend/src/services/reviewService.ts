import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import {
  ReviewRepository,
  type CreateReviewJobData,
} from "../repositories/reviewRepository";
import {
  detectLanguageFromFilename,
  estimateProcessingTime,
} from "../utils/helper";
import type { ReviewSubmissionInput } from "../validator/reviewValidator";
import type { CodeReviewJobData } from "../jobs/codeReviewJob";
import { addCodeReviewJob } from "../producers/codeReviewJobProducers";

export class ReviewService {
  private reviewRepository: ReviewRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  async createJob(
    userId: string | undefined,
    guestId: string | undefined,
    submissionData: ReviewSubmissionInput
  ): Promise<{ jobId: string; estimatedTime: number; status: string }> {
    const jobId = uuidv4();
    const { code, filename, language, priority = 5 } = submissionData;

    // Detect language if not provided
    const detectedLanguage =
      language || (filename ? detectLanguageFromFilename(filename) : "other");

    // Calculate file size
    const fileSize = Buffer.byteLength(code, "utf8");

    // Create job in database
    const jobData: CreateReviewJobData = {
      jobId,
      userId,
      guestId,
      code,
      filename,
      language: detectedLanguage,
      fileSize,
      priority,
    };

    const reviewJob = await this.reviewRepository.createJob(jobData);

    // Add job to queue
    const queueJobData: CodeReviewJobData = {
      jobId,
      code,
      language: detectedLanguage,
      filename,
      fileSize,
      userId,
      guestId,
      priority,
    };

    await addCodeReviewJob(queueJobData, priority);

    // Estimate processing time
    const estimatedTime = estimateProcessingTime(code, detectedLanguage);

    return {
      jobId,
      estimatedTime,
      status: "pending",
    };
  }

  async validateCodeSubmission(code: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for potentially malicious content
    const suspiciousPatterns = [
      /system\s*\(/gi,
      /exec\s*\(/gi,
      /eval\s*\(/gi,
      /shell_exec/gi,
      /file_get_contents/gi,
      /__import__/gi,
    ];

    const foundPatterns = suspiciousPatterns.filter((pattern) =>
      pattern.test(code)
    );
    if (foundPatterns.length > 0) {
      warnings.push(
        "Code contains potentially dangerous functions. Review will proceed with additional security checks."
      );
    }

    // Check for binary content
    const hasBinaryContent = /[\x00-\x08\x0E-\x1F\x7F-\xFF]/.test(code);
    if (hasBinaryContent) {
      errors.push(
        "Binary content detected. Please submit text-based code only."
      );
    }

    // Check for excessive repetition (possible spam)
    const lines = code.split("\n");
    const uniqueLines = new Set(lines.map((line) => line.trim()));
    if (lines.length > 50 && uniqueLines.size < lines.length * 0.3) {
      warnings.push(
        "Code appears to have excessive repetition. This might affect analysis quality."
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

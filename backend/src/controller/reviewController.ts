import type { Request, Response } from "express";
import { ReviewService } from "../services/reviewService";
import { reviewSubmissionSchema } from "../validator/reviewValidator";
import { ZodError } from "zod";
import { upload } from "../config/multer.config";
import { ReviewRepository } from "../repositories/reviewRepository";

const reviewRepository = new ReviewRepository();

export class ReviewController {
  private reviewService: ReviewService;

  private static readonly POLL_TIMEOUT = 30000; // 30 seconds
  private static readonly POLL_INTERVAL = 2000; // 2 seconds
  private static readonly MAX_POLL_ATTEMPTS = 15; // 30s total

  constructor() {
    this.reviewService = new ReviewService();
  }

  /**
   * Long polling endpoint for job status
   */
  async getJobStatus(req: Request, res: Response) {
    const { jobId } = req.params;
    const timeoutParam = req.query.timeout
      ? parseInt(req.query.timeout as string)
      : null;

    // Use custom timeout or default
    const timeout =
      timeoutParam && timeoutParam <= 60000
        ? timeoutParam
        : ReviewController.POLL_TIMEOUT;
    const startTime = Date.now();

    try {
      // Set response headers for long polling
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Content-Type", "application/json");

      // Long polling loop
      while (Date.now() - startTime < timeout) {
        const job = await reviewRepository.getJobStatus(jobId!);

        if (!job) {
          return res.status(404).json({
            success: false,
            error: "Job not found",
            jobId,
          });
        }

        // If job is completed or failed, return immediately
        if (job.status === "completed" || job.status === "failed") {
          return res.json({
            success: true,
            data: {
              jobId,
              status: job.status,
              result: job.result,
              error: job.error,
              processingTime: job.processingTime,
              completedAt: job.completedAt,
              createdAt: job.createdAt,
            },
          });
        }

        // If still processing, wait before next check
        await new Promise((resolve) =>
          setTimeout(resolve, ReviewController.POLL_INTERVAL)
        );
      }

      // Timeout reached - return current status
      const finalJob = await reviewRepository.getJobStatus(jobId!);
      return res.json({
        success: true,
        data: {
          jobId,
          status: finalJob?.status || "unknown",
          message: "Job still in progress",
          createdAt: finalJob?.createdAt,
        },
      });
    } catch (error) {
      console.error(`Long polling error for job ${jobId}:`, error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch job status",
        jobId,
      });
    }
  }

  async getJobStatusImmediate(req: Request, res: Response) {
    const { jobId } = req.params;

    try {
      const job = await reviewRepository.getJobStatus(jobId!);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: "Job not found",
          jobId,
        });
      }

      return res.json({
        success: true,
        data: {
          jobId,
          status: job.status,
          result: job.result,
          error: job.error,
          processingTime: job.processingTime,
          completedAt: job.completedAt,
          createdAt: job.createdAt,
        },
      });
    } catch (error) {
      console.error(`Get job status error for ${jobId}:`, error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch job status",
        jobId,
      });
    }
  }

  // Submit code for review (paste)
  submitCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = reviewSubmissionSchema.parse(req.body);

      // Get user/guest identification
      const userId = req.user?.userId;
      const guestId = !userId
        ? req.ip || req.socket.remoteAddress || "unknown"
        : undefined;

      // Validate code content
      const validation = await this.reviewService.validateCodeSubmission(
        validatedData.code
      );
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Code validation failed",
          errors: validation.errors,
        });
        return;
      }

      // Create review job
      const result = await this.reviewService.createJob(
        userId,
        guestId,
        validatedData
      );

      res.status(202).json({
        success: true,
        message: "Code submitted for review",
        data: {
          jobId: result.jobId,
          status: result.status,
          estimatedTime: result.estimatedTime,
        },
        warnings:
          validation.warnings.length > 0 ? validation.warnings : undefined,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Submit file for review
  submitFile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
        return;
      }

      // Convert file buffer to string
      const code = req.file.buffer.toString("utf8");
      const filename = req.file.originalname;

      // Parse additional data from body
      const priority = req.body.priority ? parseInt(req.body.priority) : 5;
      const language = req.body.language;

      // Validate using the same schema
      const submissionData = {
        code,
        filename,
        language,
        priority,
      };

      const validatedData = reviewSubmissionSchema.parse(submissionData);

      // Get user/guest identification
      const userId = req.user?.userId;
      const guestId = !userId
        ? req.ip || req.connection.remoteAddress || "unknown"
        : undefined;

      // Validate code content
      const validation = await this.reviewService.validateCodeSubmission(code);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "File validation failed",
          errors: validation.errors,
        });
        return;
      }

      // Create review job
      const result = await this.reviewService.createJob(
        userId,
        guestId,
        validatedData
      );

      res.status(202).json({
        success: true,
        message: "File submitted for review",
        data: {
          jobId: result.jobId,
          status: result.status,
          estimatedTime: result.estimatedTime,
          filename,
        },
        warnings:
          validation.warnings.length > 0 ? validation.warnings : undefined,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Error handling helper
  private handleError(res: Response, error: any): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    if (error.message) {
      // Known application errors
      const statusCode = this.getErrorStatusCode(error.message);
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    // Unknown server errors
    console.error("Review Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

  private getErrorStatusCode(message: string): number {
    if (message.includes("not found")) return 404;
    if (message.includes("access denied")) return 403;
    if (message.includes("validation failed")) return 400;
    if (message.includes("file too large")) return 413;
    if (message.includes("unsupported")) return 415;
    return 400; // Bad Request (default)
  }
}

// Export multer upload middleware for use in routes
export const uploadMiddleware = upload.single("file");

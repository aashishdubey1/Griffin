import type { Job } from "bullmq";
import { AIService } from "../services/aiService";
import { SemgrepService } from "../services/semgrepService";
import { ReviewRepository } from "../repositories/reviewRepository";
import type { CreateReviewJobData } from "../repositories/reviewRepository";

const aiService = new AIService();
const semgrepService = new SemgrepService();
const reviewRepository = new ReviewRepository();

export interface CodeReviewJobData {
  jobId: string;
  code: string;
  language?: string;
  filename?: string;
  fileSize: number;
  userId?: string;
  guestId?: string;
  priority: number;
}

export interface IJob {
  name: string;
  payload?: CodeReviewJobData;
  handle: (job: Job) => void;
  failed: (job: Job) => void;
}

export class CodeReviewJob implements IJob {
  name: string;
  payload?: CodeReviewJobData;
  constructor(payload?: CodeReviewJobData) {
    this.name = this.constructor.name;
    this.payload = payload;
  }

  async handle(job: Job) {
    const jobData = job.data as CreateReviewJobData;
    const startTime = Date.now();
    console.log(
      `Processing CodeReviewJob ${jobData.jobId} - Language: ${jobData.language}, Size: ${jobData.fileSize} bytes`
    );

    try {
      // Update status to processing
      await reviewRepository.updateJobStatus(jobData.jobId, "processing");

      // Step 1: Run Semgrep analysis
      console.log(`Running static analysis for job ${jobData.jobId}`);
      const semgrepFindings = await semgrepService.analyze(
        jobData.code,
        jobData.language!,
        jobData.filename
      );

      // Step 2: Run AI analysis
      console.log(`Running AI analysis for job ${jobData.jobId}`);

      const aiData = await aiService.analyzeCode(
        jobData.code,
        jobData.language!,
        jobData.filename,
        semgrepFindings
      );

      // Step 3: Save results
      const processingTime = Date.now() - startTime;

      await reviewRepository.updateJobResult(
        jobData.jobId,
        aiData,
        processingTime
      );

      console.log(
        `CodeReviewJob ${jobData.jobId} completed successfully in ${processingTime}ms`
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`CodeReviewJob ${jobData.jobId} failed:`, error);

      await reviewRepository.updateJobError(
        jobData.jobId,
        error instanceof Error ? error.message : "Unknown error occurred"
      );

      throw error; // Re-throw to mark job as failed in BullMQ
    }
  }

  failed(job: Job) {
    console.log("Failed submission job");
  }
}

import { Queue } from "bullmq";
import redis from "../config/redis.config";
import type { CodeReviewJobData } from "../jobs/codeReviewJob";

export const QUEUE_NAMES = {
  CODE_REVIEW: "code-review",
  PRIORITY_REVIEW: "priority-review",
  CLEANUP: "cleanup",
} as const;

const defaultQueueOptions = {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
    attempts: 3,
    backoff: {
      type: "exponential" as const,
      delay: 2000,
    },
  },
};

export const codeReviewQueue = new Queue<CodeReviewJobData>(
  QUEUE_NAMES.CODE_REVIEW,
  {
    ...defaultQueueOptions,
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      delay: 0, // Process immediately
    },
  }
);

export const priorityReviewQueue = new Queue<CodeReviewJobData>(
  QUEUE_NAMES.PRIORITY_REVIEW,
  {
    ...defaultQueueOptions,
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      priority: 10, // High priority
    },
  }
);

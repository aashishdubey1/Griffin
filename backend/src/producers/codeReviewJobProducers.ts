import type { CodeReviewJobData } from "../jobs/codeReviewJob";
import {
  codeReviewQueue,
  priorityReviewQueue,
} from "../queues/codeReviewerQueue";

export async function addCodeReviewJob(
  payload: CodeReviewJobData,
  priority: number
) {
  const queue = priority >= 10 ? priorityReviewQueue : codeReviewQueue;

  await queue.add("CodeReviewJob", payload, {
    jobId: payload.jobId,
    priority,
    delay: 0,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  });

  console.log("Job added to queue", { payload, priority });
}

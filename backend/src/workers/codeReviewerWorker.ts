import { Worker, type Job } from "bullmq";
import { CodeReviewJob } from "../jobs/codeReviewJob";
import redis from "../config/redis.config";

export function worker(queueName: string) {
  console.log("Worker is called");
  new Worker(
    queueName,
    async (job: Job) => {
      console.log("inside job request ");
      if (job.name == "CodeReviewJob") {
        const codeReviewJob = new CodeReviewJob(job.data);
        await codeReviewJob.handle(job);
        return true;
      }
    },
    { connection: redis }
  );
}

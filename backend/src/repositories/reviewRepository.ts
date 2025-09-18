import { ReviewJob, type IReviewJob } from "../models/ReviewModel";
import { Types } from "mongoose";
import type { CodeReviewResult } from "../services/aiService";

export interface CreateReviewJobData {
  jobId: string;
  userId?: string;
  guestId?: string;
  code: string;
  filename?: string;
  language?: string;
  fileSize: number;
  priority?: number;
}

export interface JobFilters {
  userId?: string;
  guestId?: string;
  status?: string;
  language?: string;
}

export interface JobQueryOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class ReviewRepository {
  async getJobStatus(jobId: string): Promise<IReviewJob | null> {
    const job = await ReviewJob.findOne(
      { jobId },
      {
        status: 1,
        result: 1,
        error: 1,
        processingTime: 1,
        completedAt: 1,
        createdAt: 1,
      }
    ).lean();

    return job;
  }

  async createJob(jobData: CreateReviewJobData): Promise<IReviewJob> {
    const reviewJob = new ReviewJob(jobData);
    return await reviewJob.save();
  }

  async findJobById(jobId: string): Promise<IReviewJob | null> {
    return await ReviewJob.findOne({ jobId });
  }

  async findJobByIdAndUser(
    jobId: string,
    userId?: string,
    guestId?: string
  ): Promise<IReviewJob | null> {
    const query: any = { jobId };

    if (userId) {
      query.userId = new Types.ObjectId(userId);
    } else if (guestId) {
      query.guestId = guestId;
    } else {
      return null; // Must have either userId or guestId
    }

    return await ReviewJob.findOne(query);
  }

  async updateJobStatus(
    jobId: string,
    status: string,
    additionalData?: Partial<IReviewJob>
  ): Promise<IReviewJob | null> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
      ...additionalData,
    };

    if (status === "completed" || status === "failed") {
      updateData.completedAt = new Date();
    }

    return await ReviewJob.findOneAndUpdate({ jobId }, updateData, {
      new: true,
    });
  }

  async updateJobResult(
    jobId: string,
    result: CodeReviewResult,
    processingTime?: number
  ): Promise<IReviewJob | null> {
    return await ReviewJob.findOneAndUpdate(
      { jobId },
      {
        status: "completed",
        result,
        processingTime,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );
  }

  async updateJobError(
    jobId: string,
    error: string
  ): Promise<IReviewJob | null> {
    return await ReviewJob.findOneAndUpdate(
      { jobId },
      {
        status: "failed",
        error,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );
  }

  async findUserJobs(
    userId: string,
    options: JobQueryOptions,
    filters?: Omit<JobFilters, "userId">
  ): Promise<{ jobs: IReviewJob[]; total: number; totalPages: number }> {
    const { page, limit, sortBy = "createdAt", sortOrder = "desc" } = options;
    const skip = (page - 1) * limit;

    const query: any = { userId: new Types.ObjectId(userId) };

    if (filters?.status) query.status = filters.status;
    if (filters?.language) query.language = filters.language;

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [jobs, total] = await Promise.all([
      ReviewJob.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      ReviewJob.countDocuments(query),
    ]);

    return {
      jobs,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findGuestJobs(
    guestId: string,
    options: JobQueryOptions,
    filters?: Omit<JobFilters, "guestId">
  ): Promise<{ jobs: IReviewJob[]; total: number; totalPages: number }> {
    const { page, limit, sortBy = "createdAt", sortOrder = "desc" } = options;
    const skip = (page - 1) * limit;

    const query: any = { guestId };

    if (filters?.status) query.status = filters.status;
    if (filters?.language) query.language = filters.language;

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [jobs, total] = await Promise.all([
      ReviewJob.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      ReviewJob.countDocuments(query),
    ]);

    return {
      jobs,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPendingJobs(limit: number = 50): Promise<IReviewJob[]> {
    return await ReviewJob.find({ status: "pending" })
      .sort({ priority: -1, createdAt: 1 })
      .limit(limit)
      .lean();
  }

  async getJobStats(
    userId?: string,
    guestId?: string
  ): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const query: any = {};

    if (userId) {
      query.userId = new Types.ObjectId(userId);
    } else if (guestId) {
      query.guestId = guestId;
    }

    const stats = await ReviewJob.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    stats.forEach((stat) => {
      result[stat._id as keyof typeof result] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  async getLanguageStats(
    userId?: string
  ): Promise<Array<{ language: string; count: number }>> {
    const query: any = {};

    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    return await ReviewJob.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$language",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          language: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async deleteOldJobs(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await ReviewJob.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: { $in: ["completed", "failed"] },
    });

    return result.deletedCount || 0;
  }

  async findSimilarCode(
    codeHash: string,
    excludeJobId?: string
  ): Promise<IReviewJob | null> {
    // This would require implementing code hashing
    // For now, return null - can be implemented later
    return null;
  }

  async updateProcessingTime(
    jobId: string,
    processingTime: number
  ): Promise<void> {
    await ReviewJob.findOneAndUpdate(
      { jobId },
      { processingTime, updatedAt: new Date() }
    );
  }

  async getAverageProcessingTime(language?: string): Promise<number> {
    const query: any = {
      status: "completed",
      processingTime: { $exists: true, $ne: null },
    };

    if (language) {
      query.language = language;
    }

    const result = await ReviewJob.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgProcessingTime: { $avg: "$processingTime" },
        },
      },
    ]);

    return result[0]?.avgProcessingTime || 5000; // 5 seconds default
  }

  async getRecentCompletedJobs(limit: number = 10): Promise<IReviewJob[]> {
    return await ReviewJob.find({ status: "completed" })
      .sort({ completedAt: -1 })
      .limit(limit)
      .select("jobId language fileSize processingTime completedAt")
      .lean();
  }
}

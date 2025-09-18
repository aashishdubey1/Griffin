// repositories/githubRepository.ts
import type { PipelineStage } from "mongoose";
import { GitHubUser, type IGitHubUser } from "../models/githhubUserModel";
import {
  GitHubAnalysis,
  type IGitHubAnalysis,
} from "../models/githhubUserModel";
import type { GitHubUser as GitHubUserType } from "../services/githubOAuthService";

export interface CreateGitHubUserData {
  userId: string;
  githubId: number;
  username: string;
  email?: string;
  name: string;
  avatarUrl: string;
  accessToken: string;
  refreshToken?: string;
  scope: string;
  metadata?: {
    publicRepos?: number;
    privateRepos?: number;
    followers?: number;
    following?: number;
  };
}

export interface CreateGitHubAnalysisData {
  userId: string;
  githubUserId: string;
  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;
  analysisType: "repository" | "pull_request" | "file" | "branch_comparison";
  pullRequestNumber?: number;
  branchName?: string;
  commitSha?: string;
  filePaths?: string[];
  jobId: string;
  githubMetadata: {
    htmlUrl: string;
    lastCommitSha: string;
    lastCommitDate: Date;
    language: string;
    size: number;
    isPrivate: boolean;
  };
}

export class GitHubRepository {
  /**
   * Create or update GitHub user
   */
  async createOrUpdateGitHubUser(
    data: CreateGitHubUserData
  ): Promise<IGitHubUser> {
    const existingUser = await GitHubUser.findOne({
      $or: [{ githubId: data.githubId }, { userId: data.userId }],
    }).select("+accessToken +refreshToken");

    if (existingUser) {
      // Update existing user
      Object.assign(existingUser, {
        username: data.username,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        scope: data.scope,
        isActive: true,
        lastSyncAt: new Date(),
        ...(data.metadata && {
          metadata: { ...existingUser.metadata, ...data.metadata },
        }),
      });

      return await existingUser.save();
    }

    // Create new user
    return await GitHubUser.create(data);
  }

  /**
   * Get GitHub user by user ID
   */
  async getGitHubUserByUserId(userId: string): Promise<IGitHubUser | null> {
    return await GitHubUser.findOne({ userId, isActive: true });
  }

  /**
   * Get GitHub user with tokens (for API calls)
   */
  async getGitHubUserWithTokens(userId: string): Promise<IGitHubUser | null> {
    return await GitHubUser.findOne({ userId, isActive: true }).select(
      "+accessToken +refreshToken"
    );
  }

  /**
   * Get GitHub user by GitHub ID
   */
  async getGitHubUserByGitHubId(githubId: number): Promise<IGitHubUser | null> {
    return await GitHubUser.findOne({ githubId, isActive: true });
  }

  /**
   * Update GitHub user metadata
   */
  async updateGitHubUserMetadata(
    userId: string,
    metadata: Partial<IGitHubUser["metadata"]>
  ): Promise<void> {
    await GitHubUser.findOneAndUpdate(
      { userId, isActive: true },
      {
        $set: {
          metadata: metadata,
          lastSyncAt: new Date(),
        },
      }
    );
  }

  /**
   * Update GitHub user tokens
   */
  async updateGitHubUserTokens(
    userId: string,
    tokens: {
      accessToken: string;
      refreshToken?: string;
      expiresAt?: Date;
    }
  ): Promise<void> {
    const updateData: any = {
      accessToken: tokens.accessToken,
      lastSyncAt: new Date(),
    };

    if (tokens.refreshToken) {
      updateData.refreshToken = tokens.refreshToken;
    }
    if (tokens.expiresAt) {
      updateData.tokenExpiresAt = tokens.expiresAt;
    }

    await GitHubUser.findOneAndUpdate(
      { userId, isActive: true },
      { $set: updateData }
    );
  }

  /**
   * Disconnect GitHub account
   */
  async disconnectGitHubAccount(userId: string): Promise<void> {
    await GitHubUser.findOneAndUpdate(
      { userId },
      {
        $set: {
          isActive: false,
          accessToken: "",
          refreshToken: "",
          lastSyncAt: new Date(),
        },
      }
    );
  }

  /**
   * Create GitHub analysis record
   */
  async createGitHubAnalysis(
    data: CreateGitHubAnalysisData
  ): Promise<IGitHubAnalysis> {
    return await GitHubAnalysis.create(data);
  }

  /**
   * Get GitHub analysis by job ID
   */
  async getGitHubAnalysisByJobId(
    jobId: string
  ): Promise<IGitHubAnalysis | null> {
    return await GitHubAnalysis.findOne({ jobId })
      .populate("githubUserId", "username avatarUrl")
      .populate("userId", "email name");
  }

  /**
   * Update GitHub analysis summary
   */
  async updateGitHubAnalysisSummary(
    jobId: string,
    summary: IGitHubAnalysis["summary"]
  ): Promise<void> {
    await GitHubAnalysis.findOneAndUpdate({ jobId }, { $set: { summary } });
  }

  /**
   * Get user's GitHub analyses history
   */
  async getUserGitHubAnalyses(
    userId: string,
    options: {
      analysisType?:
        | "repository"
        | "pull_request"
        | "file"
        | "branch_comparison";
      repositoryFullName?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<IGitHubAnalysis[]> {
    const {
      analysisType,
      repositoryFullName,
      limit = 20,
      offset = 0,
    } = options;

    const filter: any = { userId };
    if (analysisType) filter.analysisType = analysisType;
    if (repositoryFullName) filter.repositoryFullName = repositoryFullName;

    return await GitHubAnalysis.find(filter)
      .populate("githubUserId", "username avatarUrl")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();
  }

  /**
   * Get repository analysis history
   */
  async getRepositoryAnalysisHistory(
    userId: string,
    repositoryFullName: string,
    limit: number = 10
  ): Promise<IGitHubAnalysis[]> {
    return await GitHubAnalysis.find({
      userId,
      repositoryFullName,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get analysis statistics for user
   */
  async getUserAnalyticsStats(userId: string): Promise<{
    totalAnalyses: number;
    repositoriesAnalyzed: number;
    pullRequestsAnalyzed: number;
    totalVulnerabilities: number;
    totalIssues: number;
    averageScore: number;
    recentActivity: IGitHubAnalysis[];
  }> {
    const analyses = await GitHubAnalysis.find({ userId }).lean();

    const stats = {
      totalAnalyses: analyses.length,
      repositoriesAnalyzed: new Set(analyses.map((a) => a.repositoryFullName))
        .size,
      pullRequestsAnalyzed: analyses.filter(
        (a) => a.analysisType === "pull_request"
      ).length,
      totalVulnerabilities: analyses.reduce(
        (sum, a) => sum + a.summary.vulnerabilitiesFound,
        0
      ),
      totalIssues: analyses.reduce((sum, a) => sum + a.summary.issuesFound, 0),
      averageScore:
        analyses.length > 0
          ? Math.round(
              analyses.reduce((sum, a) => sum + a.summary.overallScore, 0) /
                analyses.length
            )
          : 0,
      recentActivity: analyses
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    };

    return stats;
  }

  /**
   * Get popular repositories (most analyzed)
   */
  async getPopularRepositories(limit: number = 10): Promise<
    Array<{
      repositoryFullName: string;
      analysisCount: number;
      lastAnalyzed: Date;
      averageScore: number;
    }>
  > {
    const pipeline: PipelineStage[] = [
      {
        $group: {
          _id: "$repositoryFullName",
          analysisCount: { $sum: 1 },
          lastAnalyzed: { $max: "$createdAt" },
          averageScore: { $avg: "$summary.overallScore" },
        },
      },
      {
        $sort: { analysisCount: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          repositoryFullName: "$_id",
          analysisCount: 1,
          lastAnalyzed: 1,
          averageScore: { $round: ["$averageScore", 1] },
          _id: 0,
        },
      },
    ];

    return (await GitHubAnalysis.aggregate(pipeline)) as Array<{
      repositoryFullName: string;
      analysisCount: number;
      lastAnalyzed: Date;
      averageScore: number;
    }>;
  }

  /**
   * Clean up old analyses (for data retention)
   */
  async cleanupOldAnalyses(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await GitHubAnalysis.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return result.deletedCount || 0;
  }

  /**
   * Check if user has GitHub connected
   */
  async hasGitHubConnected(userId: string): Promise<boolean> {
    const user = await GitHubUser.findOne({ userId, isActive: true });
    return !!user;
  }

  /**
   * Get GitHub connection status with basic info
   */
  async getGitHubConnectionStatus(userId: string): Promise<{
    isConnected: boolean;
    username?: string;
    avatarUrl?: string;
    lastSyncAt?: Date;
    repositoriesCount?: number;
  }> {
    const githubUser = await GitHubUser.findOne({ userId, isActive: true });

    if (!githubUser) {
      return { isConnected: false };
    }

    const analysesCount = await GitHubAnalysis.countDocuments({ userId });

    return {
      isConnected: true,
      username: githubUser.username,
      avatarUrl: githubUser.avatarUrl,
      lastSyncAt: githubUser.lastSyncAt,
      repositoriesCount: analysesCount,
    };
  }

  /**
   * Health check for GitHub models
   */
  async healthCheck(): Promise<boolean> {
    try {
      await GitHubUser.findOne({}).limit(1);
      await GitHubAnalysis.findOne({}).limit(1);
      return true;
    } catch (error) {
      console.error("GitHub repository health check failed:", error);
      return false;
    }
  }
}

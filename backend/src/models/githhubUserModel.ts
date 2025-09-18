// models/githubUser.ts
import { Schema, model, Document } from "mongoose";
// import crypto from "crypto";

export interface IGitHubUser extends Document {
  userId: Schema.Types.ObjectId; // Reference to main User model
  githubId: number;
  username: string;
  email?: string;
  name: string;
  avatarUrl: string;
  accessToken: string; // Encrypted
  refreshToken?: string; // Encrypted
  scope: string;
  tokenExpiresAt?: Date;
  isActive: boolean;
  lastSyncAt?: Date;
  metadata: {
    publicRepos: number;
    privateRepos: number;
    followers: number;
    following: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const githubUserSchema = new Schema<IGitHubUser>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    githubId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
      select: false, // Don't include in queries by default
    },
    refreshToken: {
      type: String,
      select: false,
    },
    scope: {
      type: String,
      required: true,
    },
    tokenExpiresAt: Date,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastSyncAt: Date,
    metadata: {
      publicRepos: {
        type: Number,
        default: 0,
      },
      privateRepos: {
        type: Number,
        default: 0,
      },
      followers: {
        type: Number,
        default: 0,
      },
      following: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    collection: "github_users",
  }
);

// Instance methods
githubUserSchema.methods.getDecryptedAccessToken = function (): string {
  return this.decryptToken(this.accessToken);
};

githubUserSchema.methods.getDecryptedRefreshToken = function (): string | null {
  return this.refreshToken ? this.decryptToken(this.refreshToken) : null;
};

githubUserSchema.methods.updateTokens = function (tokens: {
  access_token: string;
  refresh_token?: string;
  expires_at?: Date;
}) {
  this.accessToken = tokens.access_token;
  if (tokens.refresh_token) {
    this.refreshToken = tokens.refresh_token;
  }
  if (tokens.expires_at) {
    this.tokenExpiresAt = tokens.expires_at;
  }
  this.lastSyncAt = new Date();
};

githubUserSchema.methods.isTokenExpired = function (): boolean {
  if (!this.tokenExpiresAt) return false;
  return new Date() >= this.tokenExpiresAt;
};

export const GitHubUser = model<IGitHubUser>("GitHubUser", githubUserSchema);

// GitHub Repository Analysis History Model
export interface IGitHubAnalysis extends Document {
  userId: Schema.Types.ObjectId;
  githubUserId: Schema.Types.ObjectId;
  repositoryId: string; // GitHub repo ID
  repositoryName: string;
  repositoryFullName: string;
  analysisType: "repository" | "pull_request" | "file" | "branch_comparison";

  // Analysis context
  pullRequestNumber?: number;
  branchName?: string;
  commitSha?: string;
  filePaths?: string[];

  // Review job reference
  jobId: string;

  // GitHub metadata
  githubMetadata: {
    htmlUrl: string;
    lastCommitSha: string;
    lastCommitDate: Date;
    language: string;
    size: number;
    isPrivate: boolean;
  };

  // Analysis results summary
  summary: {
    filesAnalyzed: number;
    vulnerabilitiesFound: number;
    issuesFound: number;
    overallScore: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const githubAnalysisSchema = new Schema<IGitHubAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    githubUserId: {
      type: Schema.Types.ObjectId,
      ref: "GitHubUser",
      required: true,
      index: true,
    },
    repositoryId: {
      type: String,
      required: true,
      index: true,
    },
    repositoryName: {
      type: String,
      required: true,
    },
    repositoryFullName: {
      type: String,
      required: true,
      index: true,
    },
    analysisType: {
      type: String,
      enum: ["repository", "pull_request", "file", "branch_comparison"],
      required: true,
      index: true,
    },
    pullRequestNumber: Number,
    branchName: String,
    commitSha: String,
    filePaths: [String],
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    githubMetadata: {
      htmlUrl: String,
      lastCommitSha: String,
      lastCommitDate: Date,
      language: String,
      size: Number,
      isPrivate: Boolean,
    },
    summary: {
      filesAnalyzed: {
        type: Number,
        default: 0,
      },
      vulnerabilitiesFound: {
        type: Number,
        default: 0,
      },
      issuesFound: {
        type: Number,
        default: 0,
      },
      overallScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
  },
  {
    timestamps: true,
    collection: "github_analyses",
  }
);

// Compound indexes for efficient queries
githubAnalysisSchema.index({ userId: 1, createdAt: -1 });
githubAnalysisSchema.index({
  repositoryFullName: 1,
  analysisType: 1,
  createdAt: -1,
});
githubAnalysisSchema.index({ githubUserId: 1, repositoryId: 1, createdAt: -1 });

export const GitHubAnalysis = model<IGitHubAnalysis>(
  "GitHubAnalysis",
  githubAnalysisSchema
);

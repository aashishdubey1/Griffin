import { Schema, model, Types, Document } from "mongoose";

// Best practice: Centralize enum definitions in one place
export enum JobStatus {
  Pending = "pending",
  Processing = "processing",
  Completed = "completed",
  Failed = "failed",
}

export enum Severity {
  Info = "info",
  Warning = "warning",
  Error = "error",
}

export enum Impact {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export enum VulnerabilitySeverity {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}

export interface IReviewJob extends Document {
  jobId: string;
  userId?: Types.ObjectId;
  guestId?: string;
  code: string;
  filename?: string;
  language?: string;
  fileSize: number;
  status: JobStatus;
  priority: number;
  result?: {
    summary?: string;
    bestPractices?: Array<{
      category: string;
      message: string;
      severity: Severity;
      lineNumber?: number;
    }>;
    refactoring?: Array<{
      suggestion: string;
      impact: Impact;
      lineNumber?: number;
      originalCode?: string;
      suggestedCode?: string;
    }>;
    vulnerabilities?: Array<{
      type: string;
      severity: VulnerabilitySeverity;
      description: string;
      lineNumber?: number;
      cwe?: string;
    }>;
    performance?: Array<{
      issue: string;
      impact: Impact;
      suggestion: string;
      lineNumber?: number;
    }>;
    maintainability?: {
      score: number;
      issues: Array<{
        type: string;
        description: string;
        lineNumber?: number;
      }>;
    };
    complexity?: {
      cyclomaticComplexity: number;
      cognitiveComplexity: number;
      suggestions: string[];
    };
    documentation?: {
      coverageScore: number;
      suggestions: string[];
    };
    testing?: {
      recommendations: string[];
      coverageAnalysis?: string;
    };
  };
  error?: string;
  processingTime?: number;
  completedAt?: Date;
  createdAt?: Date;
}

// Sub-schemas for arrays of objects
const bestPracticeSchema = new Schema(
  {
    category: String,
    message: String,
    severity: {
      type: String,
      enum: Object.values(Severity),
    },
    lineNumber: Number,
  },
  { _id: false }
);

const refactoringSchema = new Schema(
  {
    suggestion: String,
    impact: {
      type: String,
      enum: Object.values(Impact),
    },
    lineNumber: Number,
    originalCode: String,
    suggestedCode: String,
  },
  { _id: false }
);

const vulnerabilitySchema = new Schema(
  {
    type: String,
    severity: {
      type: String,
      enum: Object.values(VulnerabilitySeverity),
    },
    description: String,
    lineNumber: Number,
    cwe: String,
  },
  { _id: false }
);

const performanceSchema = new Schema(
  {
    issue: String,
    impact: {
      type: String,
      enum: Object.values(Impact),
    },
    suggestion: String,
    lineNumber: Number,
  },
  { _id: false }
);

const issueSchema = new Schema(
  {
    type: String,
    description: String,
    lineNumber: Number,
  },
  { _id: false }
);

// Main Schema
const reviewJobSchema = new Schema<IReviewJob>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    guestId: {
      type: String,
      sparse: true,
    },
    code: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      // Assuming SUPPORTED_LANGUAGES is defined elsewhere
      // If it's a static list, you could use an enum here as well
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.Pending,
      index: true,
    },
    priority: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
    result: {
      summary: String,
      bestPractices: [bestPracticeSchema],
      refactoring: [refactoringSchema],
      vulnerabilities: [vulnerabilitySchema],
      performance: [performanceSchema],
      maintainability: {
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
        issues: [issueSchema],
      },
      complexity: {
        cyclomaticComplexity: Number,
        cognitiveComplexity: Number,
        suggestions: [String],
      },
      documentation: {
        coverageScore: {
          type: Number,
          min: 0,
          max: 100,
        },
        suggestions: [String],
      },
      testing: {
        recommendations: [String],
        coverageAnalysis: String,
      },
    },
    error: String,
    processingTime: Number,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
reviewJobSchema.index({ userId: 1, createdAt: -1 });
reviewJobSchema.index({ guestId: 1, createdAt: -1 });
reviewJobSchema.index({ status: 1, priority: -1, createdAt: 1 });
reviewJobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

export const ReviewJob = model<IReviewJob>("ReviewJob", reviewJobSchema);

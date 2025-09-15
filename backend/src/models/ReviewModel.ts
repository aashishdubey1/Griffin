import { Schema, model, Types, Document } from "mongoose";
import { SUPPORTED_LANGUAGES } from "../utils/constants";

export interface IReviewJob extends Document {
  jobId: string;
  userId?: Types.ObjectId; // Optional for guest users
  guestId?: string; // IP address for guest tracking
  code: string;
  filename?: string;
  language?: string;
  fileSize: number; // in bytes
  status: "pending" | "processing" | "completed" | "failed";
  priority: number; // 1-10, higher is more priority
  result?: {
    summary?: string;
    bestPractices?: Array<{
      category: string;
      message: string;
      severity: "info" | "warning" | "error";
      lineNumber?: number;
    }>;
    refactoring?: Array<{
      suggestion: string;
      impact: "low" | "medium" | "high";
      lineNumber?: number;
      originalCode?: string;
      suggestedCode?: string;
    }>;
    vulnerabilities?: Array<{
      type: string;
      severity: "low" | "medium" | "high" | "critical";
      description: string;
      lineNumber?: number;
      cwe?: string; // Common Weakness Enumeration
    }>;
    performance?: Array<{
      issue: string;
      impact: "low" | "medium" | "high";
      suggestion: string;
      lineNumber?: number;
    }>;
    maintainability?: {
      score: number; // 0-100
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
      coverageScore: number; // 0-100
      suggestions: string[];
    };
    testing?: {
      recommendations: string[];
      coverageAnalysis?: string;
    };
  };
  error?: string;
  processingTime?: number; // in milliseconds
  completedAt?: Date;
}

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
      sparse: true, // Allows null values with index
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
      enum: SUPPORTED_LANGUAGES,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
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
      bestPractices: [
        {
          category: String,
          message: String,
          severity: {
            type: String,
            enum: ["info", "warning", "error"],
          },
          lineNumber: Number,
        },
      ],
      refactoring: [
        {
          suggestion: String,
          impact: {
            type: String,
            enum: ["low", "medium", "high"],
          },
          lineNumber: Number,
          originalCode: String,
          suggestedCode: String,
        },
      ],
      vulnerabilities: [
        {
          type: String,
          severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
          },
          description: String,
          lineNumber: Number,
          cwe: String,
        },
      ],
      performance: [
        {
          issue: String,
          impact: {
            type: String,
            enum: ["low", "medium", "high"],
          },
          suggestion: String,
          lineNumber: Number,
        },
      ],
      maintainability: {
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
        issues: [
          {
            type: String,
            description: String,
            lineNumber: Number,
          },
        ],
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

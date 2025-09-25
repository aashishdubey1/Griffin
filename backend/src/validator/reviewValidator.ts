import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "../utils/constants";

// Supported programming languages

// File upload limits
export const FILE_SIZE_LIMITS = {
  MAX_SIZE: 1024 * 1024, // 1MB
  MAX_LINES: 10000,
  MIN_SIZE: 10, // 10 bytes minimum
} as const;

// Review submission schema
export const reviewSubmissionSchema = z.object({
  code: z
    .string()
    .min(
      FILE_SIZE_LIMITS.MIN_SIZE,
      `Code must be at least ${FILE_SIZE_LIMITS.MIN_SIZE} characters`
    )
    .max(
      FILE_SIZE_LIMITS.MAX_SIZE,
      `Code must not exceed ${FILE_SIZE_LIMITS.MAX_SIZE} characters`
    )
    .refine((code) => {
      const lines = code.split("\n").length;
      return lines <= FILE_SIZE_LIMITS.MAX_LINES;
    }, `Code must not exceed ${FILE_SIZE_LIMITS.MAX_LINES} lines`),

  filename: z
    .string()
    .optional()
    .refine((filename) => {
      if (!filename) return true;
      // Basic filename validation
      const validExtensions =
        /\.(txt|js|ts|py|java|cs|cpp|c|go|rs|php|rb|kt|swift|dart|html|css|sql|sh|yml|yaml|json|xml)$/i;
      return validExtensions.test(filename) || filename.length > 0;
    }, "Invalid filename or extension"),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.any().refine((file) => {
    if (!file) return false;
    return file.size <= FILE_SIZE_LIMITS.MAX_SIZE;
  }, `File size must not exceed ${FILE_SIZE_LIMITS.MAX_SIZE / 1024 / 1024}MB`),

  language: z.enum(SUPPORTED_LANGUAGES).optional(),

  priority: z.number().min(1).max(10).optional().default(5),
});

// Job status check schema
export const jobStatusSchema = z.object({
  jobId: z.uuid("Invalid job ID format"),
});

// Job history query schema
export const jobHistorySchema = z.object({
  page: z.number().min(1).optional().default(1),

  limit: z.number().min(1).max(50).optional().default(10),

  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),

  language: z.enum(SUPPORTED_LANGUAGES).optional(),
});

// Type exports
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type JobStatusInput = z.infer<typeof jobStatusSchema>;
export type JobHistoryInput = z.infer<typeof jobHistorySchema>;

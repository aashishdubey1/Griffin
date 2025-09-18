import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    ),

  email: z.email("Please enter a valid email address").toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must not exceed 128 characters"),

  confirmPassword: z.string().optional(),

  profile: z
    .object({
      name: z
        .string()
        .trim()
        .max(50, "Name must not exceed 50 characters")
        .optional(),
      bio: z.string().max(200, "Bio must not exceed 200 characters").optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address").toLowerCase(),

  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  profile: z
    .object({
      name: z
        .string()
        .trim()
        .max(50, "Name must not exceed 50 characters")
        .optional(),
      bio: z.string().max(200, "Bio must not exceed 200 characters").optional(),
      avatar: z.url("Please provide a valid URL for avatar").optional(),
    })
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(128, "New password must not exceed 128 characters"),

    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  });

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address").toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),

    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(128, "New password must not exceed 128 characters"),

    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

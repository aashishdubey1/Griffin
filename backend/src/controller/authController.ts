import type { Request, Response } from "express";
import { AuthService } from "../services/authService";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validator/auth.validator";
import { ZodError } from "zod";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = registerSchema.parse(req.body);

      const result = await this.authService.register(validatedData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const result = await this.authService.login(validatedData);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // // Get User Profile
  // getProfile = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     if (!req.user) {
  //       res.status(401).json({
  //         success: false,
  //         message: "Authentication required",
  //       });
  //       return;
  //     }

  //     const user = await this.authService.getUserProfile(req.user.userId);

  //     res.status(200).json({
  //       success: true,
  //       message: "Profile retrieved successfully",
  //       data: { user },
  //     });
  //   } catch (error) {
  //     this.handleError(res, error);
  //   }
  // };

  // // Update User Profile
  // updateProfile = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     if (!req.user) {
  //       res.status(401).json({
  //         success: false,
  //         message: "Authentication required",
  //       });
  //       return;
  //     }

  //     const validatedData = updateProfileSchema.parse(req.body);

  //     const updatedUser = await this.authService.updateProfile(
  //       req.user.userId,
  //       validatedData
  //     );

  //     res.status(200).json({
  //       success: true,
  //       message: "Profile updated successfully",
  //       data: { user: updatedUser },
  //     });
  //   } catch (error) {
  //     this.handleError(res, error);
  //   }
  // };

  // // Change Password
  // changePassword = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     if (!req.user) {
  //       res.status(401).json({
  //         success: false,
  //         message: "Authentication required",
  //       });
  //       return;
  //     }

  //     const validatedData = changePasswordSchema.parse(req.body);

  //     await this.authService.changePassword(req.user.userId, validatedData);

  //     res.status(200).json({
  //       success: true,
  //       message: "Password changed successfully",
  //     });
  //   } catch (error) {
  //     this.handleError(res, error);
  //   }
  // };

  // // Verify Email
  // verifyEmail = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     if (!req.user) {
  //       res.status(401).json({
  //         success: false,
  //         message: "Authentication required",
  //       });
  //       return;
  //     }

  //     await this.authService.verifyEmail(req.user.userId);

  //     res.status(200).json({
  //       success: true,
  //       message: "Email verified successfully",
  //     });
  //   } catch (error) {
  //     this.handleError(res, error);
  //   }
  // };

  // // Forgot Password
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);

      const resetToken = await this.authService.forgotPassword(validatedData);

      // In production, send this token via email instead of returning it
      res.status(200).json({
        success: true,
        message: "Password reset token generated successfully",
        resetToken, // Remove this in production
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // // Reset Password
  // resetPassword = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const validatedData = resetPasswordSchema.parse(req.body);

  //     await this.authService.resetPassword(validatedData);

  //     res.status(200).json({
  //       success: true,
  //       message: "Password reset successfully",
  //     });
  //   } catch (error) {
  //     this.handleError(res, error);
  //   }
  // };

  // // Check Review Permission (for both authenticated and guest users)
  // checkReviewPermission = async (
  //   req: Request,
  //   res: Response
  // ): Promise<void> => {
  //   try {
  //     const ipAddress = req.ip || req.socket.remoteAddress || "unknown";

  //     if (req.user) {
  //       // Authenticated user
  //       const { canReview, reviewsLeft } = await this.authService.canUserReview(
  //         req.user.userId
  //       );

  //       res.status(200).json({
  //         success: true,
  //         data: {
  //           canReview,
  //           reviewsLeft,
  //           userType: "authenticated",
  //           userId: req.user.userId,
  //         },
  //       });
  //     } else {
  //       // Guest user
  //       const { canReview, reviewsLeft } =
  //         this.authService.canGuestReview(ipAddress);

  //       res.status(200).json({
  //         success: true,
  //         data: {
  //           canReview,
  //           reviewsLeft,
  //           userType: "guest",
  //           requiresLogin: !canReview,
  //         },
  //       });
  //     }
  //   } catch (error) {
  //     this.handleError(res, error);
  //   }
  // };

  // // Get user stats (for authenticated users)
  // getUserStats = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     if (!req.user) {
  //       res.status(401).json({
  //         success: false,
  //         message: "Authentication required",
  //       });
  //       return;
  //     }

  //     const user = await this.authService.getUserProfile(req.user.userId);
  //     const { canReview, reviewsLeft } = await this.authService.canUserReview(
  //       req.user.userId
  //     );

  //     res.status(200).json({
  //       success: true,
  //       data: {
  //         username: user.username,
  //         email: user.email,
  //         isVerified: user.isVerified,
  //         reviewLimit: user.reviewLimit,
  //         usageStats: user.usageStats,
  //         canReview,
  //         reviewsLeft,
  //       },
  //     });
  //   } catch (error) {
  //     this.handleError(res, error);
  //   }
  // };

  // Logout (client-side token removal, but we can track this)
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // In a more sophisticated setup, you might want to blacklist the token
      // For now, we'll just send a success response
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Refresh Token (if implementing refresh token strategy) // Not implemented
  // refreshToken = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     if (!req.user) {
  //       res.status(401).json({
  //         success: false,
  //         message: "Authentication required",
  //       });
  //       return;
  //     }

  //     // Generate new token
  //     // const newToken = await this.authService.generateToken({
  //     //   userId: req.user.userId,
  //     //   email: req.user.email,
  //     // });

  //     res.status(200).json({
  //       success: true,
  //       message: "Token refreshed successfully",
  //       data: { token: newToken },
  //     });
  //   } catch (error) {
  //     this.handleError(res, error);
  //   }
  // };

  // Deactivate Account
  deactivateAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      // This would need to be implemented in the service
      // await this.authService.deactivateAccount(req.user.userId);

      res.status(200).json({
        success: true,
        message: "Account deactivated successfully",
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Error handling helper
  private handleError(res: Response, error: any): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    if (error.message) {
      // Known application errors
      const statusCode = this.getErrorStatusCode(error.message);
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    // Unknown server errors
    console.error("Auth Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

  private getErrorStatusCode(message: string): number {
    if (
      message.includes("already registered") ||
      message.includes("already taken")
    ) {
      return 409; // Conflict
    }
    if (
      message.includes("Invalid email or password") ||
      message.includes("Current password is incorrect")
    ) {
      return 401; // Unauthorized
    }
    if (message.includes("not found")) {
      return 404; // Not Found
    }
    if (message.includes("expired") || message.includes("invalid token")) {
      return 401; // Unauthorized
    }
    if (
      message.includes("deactivated") ||
      message.includes("reached") ||
      message.includes("limit")
    ) {
      return 403; // Forbidden
    }
    return 400; // Bad Request (default)
  }
}

import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";

// Extend Request interface to include user and guest info
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        canReview?: boolean;
        reviewsLeft?: number;
      };
      guestInfo?: {
        ipAddress: string;
        canReview: boolean;
        reviewsLeft: number;
      };
    }
  }
}

const authService = new AuthService();

// Middleware to authenticate user (optional - for routes that work with or without auth)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = await authService.verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Don't throw error, just proceed without user
    next();
  }
};

// Middleware to require authentication
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = await authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Middleware to check if user can review (handles both authenticated and guest users)
export const checkReviewPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";

    if (req.user) {
      // Authenticated user
      const { canReview, reviewsLeft } = await authService.canUserReview(
        req.user.userId
      );

      if (!canReview) {
        return res.status(403).json({
          success: false,
          message: "You have reached your review limit",
          reviewsLeft: 0,
          requiresLogin: false,
        });
      }

      // Add user review info to request
      req.user.canReview = canReview;
      req.user.reviewsLeft = reviewsLeft;
    } else {
      // Guest user
      const { canReview, reviewsLeft } = authService.canGuestReview(ipAddress);

      if (!canReview) {
        return res.status(403).json({
          success: false,
          message:
            "You have reached the guest review limit (2 reviews). Please login to continue.",
          reviewsLeft: 0,
          requiresLogin: true,
        });
      }

      // Add guest info to request
      req.guestInfo = {
        ipAddress,
        canReview,
        reviewsLeft,
      };
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking review permissions",
    });
  }
};

// Middleware to increment review count after successful review
export const incrementReviewCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user) {
      // Increment for authenticated user
      await authService.incrementUserReview(req.user.userId);
    } else if (req.guestInfo) {
      // Increment for guest user
      authService.incrementGuestReview(req.guestInfo.ipAddress);
    }

    next();
  } catch (error) {
    // Log error but don't fail the request
    console.error("Error incrementing review count:", error);
    next();
  }
};

// Middleware to require verified email
export const requireVerifiedEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get user details to check verification status
    const user = await authService.getUserProfile(req.user.userId);

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email verification required",
        requiresVerification: true,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking verification status",
    });
  }
};

// Middleware to check if user is active
export const requireActiveUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get user details to check active status
    const user = await authService.getUserProfile(req.user.userId);

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking account status",
    });
  }
};

// Error handling middleware for auth-related errors
export const authErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  next(error);
};

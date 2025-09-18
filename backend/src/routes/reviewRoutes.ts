import { Router } from "express";

const router = Router();

import {
  ReviewController,
  uploadMiddleware,
} from "../controller/reviewController";
import {
  checkReviewPermission,
  incrementReviewCount,
  optionalAuth,
  requireActiveUser,
} from "../middlewares/authMiddleware";
const reviewController = new ReviewController();

router.post(
  "/submit",
  optionalAuth, // Check if user is authenticated (optional)
  checkReviewPermission, // Check if user/guest can review
  requireActiveUser, // If authenticated, ensure user is active (middleware should handle optional auth)
  incrementReviewCount, // Increment review count after successful submission
  reviewController.submitCode
);

router.post(
  "/submit-file",
  uploadMiddleware, // Handle file upload
  optionalAuth, // Check if user is authenticated (optional)
  checkReviewPermission, // Check if user/guest can review
  requireActiveUser, // If authenticated, ensure user is active
  incrementReviewCount, // Increment review count after successful submission
  reviewController.submitFile
);

router.get("/jobs/:jobId/status", reviewController.getJobStatus);

router.get(
  "/jobs/:jobId/status/immediate",
  reviewController.getJobStatusImmediate
);

export { router as reviewRoutes };

import express from "express";
import { AuthController } from "../controller/authController";
import {
  optionalAuth,
  requireAuth,
  checkReviewPermission,
  incrementReviewCount,
  requireVerifiedEmail,
  requireActiveUser,
  authErrorHandler,
} from "../middlewares/authMiddleware";

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes (require authentication)
router.get(
  "/profile",
  requireAuth,
  requireActiveUser,
  authController.getProfile
);

router.put(
  "/profile",
  requireAuth,
  requireActiveUser,
  authController.updateProfile
);

router.post(
  "/change-password",
  requireAuth,
  requireActiveUser,
  authController.changePassword
);

router.post(
  "/verify-email",
  requireAuth,
  requireActiveUser,
  authController.verifyEmail
);

router.get(
  "/stats",
  requireAuth,
  requireActiveUser,
  authController.getUserStats
);

router.post("/logout", requireAuth, authController.logout);

// router.post("/refresh-token", requireAuth, authController.refreshToken);

router.delete(
  "/deactivate",
  requireAuth,
  requireActiveUser,
  authController.deactivateAccount
);

// Review permission routes (work with both authenticated and guest users)
router.get(
  "/review-permission",
  optionalAuth,
  authController.checkReviewPermission
);

// // Example review route (this would be used in your review controller)
// router.post(
//   "/submit-review",
//   optionalAuth, // Check if user is authenticated (optional)
//   checkReviewPermission, // Check if user/guest can review
//   requireActiveUser, // If authenticated, ensure user is active
//   incrementReviewCount, // Increment review count after successful review
//   (req, res) => {
//     // Your actual review handler would go here
//     res.json({
//       success: true,
//       message: "Review submitted successfully",
//       reviewsLeft: req.user?.reviewsLeft || req.guestInfo?.reviewsLeft || 0,
//     });
//   }
// );

// Error handling middleware
router.use(authErrorHandler);

export { router as authRoutes };

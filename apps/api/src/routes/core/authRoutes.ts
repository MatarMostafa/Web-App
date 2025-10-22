import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { authRateLimit } from "../../middleware/rateLimitMiddleware";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} from "../../middleware/validationMiddleware";
import {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  changePassword,
  logout,
  getProfile,
} from "../../controllers/core/authController";

const router = express.Router();

// Public routes with rate limiting and validation
router.post("/register", authRateLimit, registerValidation, register);
router.post("/login", authRateLimit, loginValidation, login);
router.post("/refresh-token", authRateLimit, refreshToken);

router.post(
  "/forgot-password",
  authRateLimit,
  forgotPasswordValidation,
  forgotPassword
);

router.post(
  "/reset-password/:token",
  authRateLimit,
  resetPasswordValidation,
  resetPassword
);

router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", authRateLimit, resendVerificationEmail);

// Protected routes
router.post(
  "/change-password",
  authMiddleware,
  changePasswordValidation,
  changePassword
);
router.post("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, getProfile);

export default router;

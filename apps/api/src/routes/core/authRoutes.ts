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
  registerCustomer,
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
router.post("/register", registerValidation, register);
router.post("/register-customer", registerValidation, registerCustomer);
router.post("/login", loginValidation, login);
router.post("/refresh-token", refreshToken);

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPasswordValidation,
  resetPassword
);

router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

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

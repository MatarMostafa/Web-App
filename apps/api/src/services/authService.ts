import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";
import { sendEmail } from "./emailService";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret";

export const generateTokens = (userId: string, email: string, role: any) => {
  const accessToken = jwt.sign(
    { id: userId, email, role: String(role) },
    JWT_SECRET
  );
  const refreshToken = jwt.sign({ id: userId }, JWT_REFRESH_SECRET);
  return { accessToken, refreshToken };
};

export const register = async (userData: any) => {
  const { email, username, password, role = "EMPLOYEE" } = userData;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role,
      isActive: false,
    },
  });

  await sendEmail({
    to: email,
    subject: "Welcome! Please verify your email",
    html: `
      <h1>Welcome to Employee Manager!</h1>
      <p>Please click the link below to verify your email:</p>
      <a href="${process.env.BACKEND_URL}/verify-email/${user.id}">Verify Email</a>
    `,
  });

  return {
    message:
      "Registration successful. Please check your email to verify your account.",
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    throw new Error("Invalid credentials or account not verified");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  const { accessToken, refreshToken } = generateTokens(
    user.id,
    user.email,
    user.role
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLogin: new Date(),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.email,
      user.role
    );

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  // Create JWT token for password reset
  const resetToken = jwt.sign(
    { userId: user.id, email: user.email, type: "password-reset" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    html: `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.BACKEND_URL}/reset-password/${resetToken}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `,
  });

  return { message: "Password reset email sent" };
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== "password-reset") {
      throw new Error("Invalid token type");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: "Password reset successful" };
  } catch (error) {
    throw new Error("Invalid or expired reset token");
  }
};

export const verifyEmail = async (token: string) => {
  // Simple verification using token as user ID until schema is updated
  try {
    const user = await prisma.user.findUnique({ where: { id: token } });

    if (!user) {
      throw new Error("Invalid verification token");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
    });

    return { message: "Email verified successfully" };
  } catch (error) {
    throw new Error("Invalid or expired verification token");
  }
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  return { message: "Password changed successfully" };
};

export const logout = async (userId: string) => {
  // Refresh token clearing temporarily disabled until schema is updated

  return { message: "Logged out successfully" };
};

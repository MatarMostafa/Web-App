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
  const { name, email, username, password, role = "EMPLOYEE" } = userData;

  // Check for existing email
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new Error("Email already exists");
  }

  // Check for existing username
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new Error("Username is not available");
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

  // Create employee record if role is EMPLOYEE
  if (role === "EMPLOYEE") {
    await prisma.employee.create({
      data: {
        userId: user.id,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        employeeCode: `EMP${Date.now().toString().slice(-6)}`,
        hireDate: new Date(),
        isAvailable: true,
        priority: 1,
      },
    });
  }

  try {
    await sendEmail({
      to: email,
      subject: "Welcome! Please verify your email",
      html: `
        <h1>Welcome to Employee Manager!</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${process.env.FRONTEND_URL}/confirm-email?token=${user.id}">Verify Email</a>
      `,
    });
  } catch (emailError: any) {
    console.error('Registration email failed:', emailError);
    // Continue with registration even if email fails
  }

  return {
    message:
      "Registration successful. Please check your email to verify your account.",
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ 
    where: { email },
    include: {
      employee: true
    }
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid credentials or account not verified");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  // Check if employee is blocked after password validation
  if (user.employee && !user.employee.isAvailable) {
    throw new Error("Your access to the system has been blocked. Please contact admin.");
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
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
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
      data: { isActive: true, emailVerified:true },
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
export const resendVerificationEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    throw new Error("User not found");
  }

  if (user.isActive) {
    throw new Error("Email already verified");
  }

  // Check if user has requested resend recently (5 minutes cooldown)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (user.updatedAt > fiveMinutesAgo) {
    throw new Error("Please wait 5 minutes before requesting another verification email");
  }

  // Update user's updatedAt to track last resend time
  await prisma.user.update({
    where: { id: user.id },
    data: { updatedAt: new Date() },
  });

  await sendEmail({
    to: email,
    subject: "Verify your email - Resent",
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email:</p>
      <a href="${process.env.FRONTEND_URL}/confirm-email?token=${user.id}">Verify Email</a>
      <p>This is a resent verification email.</p>
    `,
  });

  return { message: "Verification email resent successfully" };
};
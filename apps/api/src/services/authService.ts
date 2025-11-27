import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";
import { sendEmail } from "./emailService";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret";

export const generateTokens = (userId: string, email: string | null, role: any) => {
  const accessToken = jwt.sign(
    { id: userId, email: email || null, role: String(role) },
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
    throw new Error("E-Mail-Adresse existiert bereits");
  }

  // Check for existing username
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new Error("Benutzername ist nicht verfügbar");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Generate secure verification token
  const verificationToken = jwt.sign(
    { userId: null, email, type: "email-verification" },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
  
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role,
      isActive: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    },
  });

  // Create employee record if role is EMPLOYEE
  if (role === "EMPLOYEE") {
    await prisma.employee.create({
      data: {
        userId: user.id,
        firstName: name ? name.split(' ')[0] : undefined,
        lastName: name ? name.split(' ').slice(1).join(' ') || undefined : undefined,
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
        <a href="${process.env.FRONTEND_URL}/confirm-email?token=${verificationToken}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });
  } catch (emailError: any) {
    console.error('Registration email failed:', emailError);
    // Continue with registration even if email fails
  }

  return {
    message:
      "Registrierung erfolgreich. Bitte überprüfen Sie Ihre E-Mail, um Ihr Konto zu verifizieren.",
  };
};

export const registerEmployee = async (userData: any) => {
  const { name, email, username, password, role = "EMPLOYEE" } = userData;

  // Check for existing email
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new Error("E-Mail-Adresse existiert bereits");
  }

  // Check for existing username
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new Error("Benutzername ist nicht verfügbar");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role,
      isActive: true,
      emailVerified: true,
    },
  });

  // Create employee record if role is EMPLOYEE
  if (role === "EMPLOYEE") {
    await prisma.employee.create({
      data: {
        userId: user.id,
        firstName: name ? name.split(' ')[0] : undefined,
        lastName: name ? name.split(' ').slice(1).join(' ') || undefined : undefined,
        employeeCode: `EMP${Date.now().toString().slice(-6)}`,
        hireDate: new Date(),
        isAvailable: true,
        priority: 1,
      },
    });
  }

  return {
    message: "Employee account created successfully.",
  };
};

export const registerCustomer = async (userData: any) => {
  const { email, username, password, companyName, contactPhone, industry, address, taxNumber } = userData;

  // Check for existing email
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new Error("E-Mail-Adresse existiert bereits");
  }

  // Check for existing username
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new Error("Benutzername ist nicht verfügbar");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user with CUSTOMER role (admin-created, immediately active)
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role: "CUSTOMER",
      isActive: true,
      emailVerified: true,
    },
  });

  // Create customer record
  await prisma.customer.create({
    data: {
      userId: user.id,
      companyName,
      contactEmail: email,
      contactPhone,
      industry,
      address,
      taxNumber,
      isActive: true,
    },
  });

  return {
    message: "Customer account created successfully.",
  };
};

export const login = async (identifier: string, password: string) => {
  console.log('Auth service - trying to find user with identifier:', identifier);
  
  // Try to find user by email first, then by username
  let user = await prisma.user.findUnique({ 
    where: { email: identifier },
    include: {
      employee: true,
      customer: true
    }
  });
  
  console.log('User found by email:', !!user);
  
  if (!user) {
    user = await prisma.user.findUnique({ 
      where: { username: identifier },
      include: {
        employee: true,
        customer: true
      }
    });
    console.log('User found by username:', !!user);
  }

  if (!user) {
    console.log('No user found with identifier:', identifier);
    throw new Error("Ungültige Anmeldedaten");
  }

  // Check if employee is blocked before password validation
  if (user.employee && !user.employee.isAvailable) {
    throw new Error("Ihr Zugang zum System wurde gesperrt. Bitte wenden Sie sich an den Administrator.");
  }
  
  // Check if customer is blocked before password validation
  if (user.customer && !user.customer.isActive) {
    throw new Error("Ihr Kundenkonto wurde deaktiviert. Bitte wenden Sie sich an den Support.");
  }
  
  
  if (!user.isActive) {
    console.log('User account not active');
    throw new Error("Konto nicht verifiziert");
  }

  

  const isValidPassword = await bcrypt.compare(password, user.password);
  console.log('Password valid:', isValidPassword);
  
  if (!isValidPassword) {
    throw new Error("Ungültige Anmeldedaten");
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
      throw new Error("Ungültiger Aktualisierungstoken");
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.email,
      user.role
    );

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error("Ungültiger Aktualisierungstoken");
  }
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Benutzer nicht gefunden");
  }

  // Create JWT token for password reset
  const resetToken = jwt.sign(
    { userId: user.id, email: user.email, type: "password-reset" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store token in database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    },
  });

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

  return { message: "E-Mail zum Zurücksetzen des Passworts gesendet" };
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== "password-reset") {
      throw new Error("Ungültiger Token-Typ");
    }

    // Find user by reset token and check expiration
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      throw new Error("Ungültiger oder abgelaufener Reset-Token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: "Passwort erfolgreich zurückgesetzt" };
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new Error("Ungültiger oder abgelaufener Reset-Token");
    }
    throw new Error(error.message || "Ungültiger oder abgelaufener Reset-Token");
  }
};

export const verifyEmail = async (token: string) => {
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.type !== "email-verification" && decoded.type !== "email-change-verification") {
      throw new Error("Ungültiger Token-Typ");
    }

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      throw new Error("Ungültiger oder abgelaufener Verifizierungstoken");
    }

    // Handle email change verification
    if (decoded.type === "email-change-verification") {
      // Update user email and mark as verified
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: decoded.email,
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });
      
      // Mark the settings change request as completed
      if (decoded.requestId) {
        await prisma.settingsChangeRequest.update({
          where: { id: decoded.requestId },
          data: { status: "APPROVED" },
        });
      }
      
      return { message: "E-Mail erfolgreich geändert" };
    }
    
    // Handle regular email verification
    if (user.isActive) {
      throw new Error("E-Mail bereits verifiziert");
    }

    // Activate user and clear verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return { message: "E-Mail erfolgreich verifiziert" };
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new Error("Ungültiger oder abgelaufener Verifizierungstoken");
    }
    throw new Error(error.message || "Ungültiger oder abgelaufener Verifizierungstoken");
  }
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("Benutzer nicht gefunden");
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    throw new Error("Aktuelles Passwort ist falsch");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  return { message: "Passwort erfolgreich geändert" };
};

export const logout = async (userId: string) => {
  // Refresh token clearing temporarily disabled until schema is updated

  return { message: "Erfolgreich abgemeldet" };
};
export const resendVerificationEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    throw new Error("Benutzer nicht gefunden");
  }

  if (user.isActive) {
    throw new Error("E-Mail bereits verifiziert");
  }

  // Check if user has requested resend recently (5 minutes cooldown)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (user.updatedAt > fiveMinutesAgo) {
    throw new Error("Bitte warten Sie 5 Minuten, bevor Sie eine weitere Verifizierungs-E-Mail anfordern");
  }

  // Generate new verification token
  const verificationToken = jwt.sign(
    { userId: user.id, email, type: "email-verification" },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
  
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Update user with new token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      updatedAt: new Date(),
    },
  });

  await sendEmail({
    to: email,
    subject: "Verify your email - Resent",
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email:</p>
      <a href="${process.env.FRONTEND_URL}/confirm-email?token=${verificationToken}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  });

  return { message: "Verifizierungs-E-Mail erfolgreich erneut gesendet" };
};
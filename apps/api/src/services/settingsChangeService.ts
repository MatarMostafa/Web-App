import { prisma } from "@repo/db";
import { createNotification } from "./notificationServices";

export const createSettingsChangeRequest = async (
  userId: string,
  requestType: string,
  currentValue: string | null,
  requestedValue: string,
  reason?: string
) => {
  // Check for existing pending request of same type
  const existingRequest = await prisma.settingsChangeRequest.findFirst({
    where: {
      userId,
      requestType: requestType as any,
      status: "PENDING",
    },
  });

  if (existingRequest) {
    throw new Error("You already have a pending request for this setting");
  }

  // Create the request
  const request = await prisma.settingsChangeRequest.create({
    data: {
      userId,
      requestType: requestType as any,
      currentValue,
      requestedValue,
      reason,
    },
    include: {
      user: {
        include: {
          employee: true,
        },
      },
    },
  });

  // Get admin users to notify
  const adminUsers = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "HR_MANAGER", "SUPER_ADMIN"] },
      isActive: true,
    },
  });

  // Send notification to admins
  if (adminUsers.length > 0) {
    const employeeName = request.user.employee
      ? `${request.user.employee.firstName} ${request.user.employee.lastName}`
      : request.user.username;

    await createNotification({
      templateKey: "SETTINGS_CHANGE_REQUESTED",
      title: "Settings Change Request",
      body: `${employeeName} has requested to change their ${requestType.toLowerCase().replace('_', ' ')}`,
      data: {
        requestId: request.id,
        employeeName,
        changeType: requestType.toLowerCase().replace('_', ' '),
        currentValue: currentValue || 'not set',
        requestedValue,
        reason: reason || 'No reason provided',
        category: 'settings',
        redirectUrl: '/dashboard-admin/settings-requests',
      },
      recipients: adminUsers.map(u => ({ userId: u.id })),
      createdBy: userId,
    });
  }

  return request;
};

export const getMySettingsRequests = async (userId: string) => {
  return prisma.settingsChangeRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getPendingSettingsRequests = async () => {
  return prisma.settingsChangeRequest.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          employee: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          customer: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const reviewSettingsRequest = async (
  requestId: string,
  reviewerId: string,
  action: "APPROVED" | "REJECTED",
  reviewNotes?: string
) => {
  const request = await prisma.settingsChangeRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        include: {
          employee: true,
          customer: true,
        },
      },
    },
  });

  if (!request) {
    throw new Error("Request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request has already been reviewed");
  }

  // Update request status
  const updatedRequest = await prisma.settingsChangeRequest.update({
    where: { id: requestId },
    data: {
      status: action,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNotes,
    },
  });

  // If approved, apply the change
  if (action === "APPROVED") {
    await applySettingsChange(request);
  }

  // Get reviewer info for notification
  const reviewer = await prisma.user.findUnique({
    where: { id: reviewerId },
    include: { employee: true },
  });

  const reviewerName = reviewer?.employee
    ? `${reviewer.employee.firstName} ${reviewer.employee.lastName}`
    : reviewer?.username || "Admin";

  // Send notification to user
  const templateKey = action === "APPROVED" ? "SETTINGS_CHANGE_APPROVED" : "SETTINGS_CHANGE_REJECTED";
  
  await createNotification({
    templateKey,
    title: `Settings Change ${action === "APPROVED" ? "Approved" : "Rejected"}`,
    body: `Your request to change ${request.requestType.toLowerCase().replace('_', ' ')} has been ${action.toLowerCase()}`,
    data: {
      requestId: request.id,
      changeType: request.requestType.toLowerCase().replace('_', ' '),
      reviewerName,
      reviewNotes: reviewNotes || '',
    },
    recipients: [{ userId: request.userId }],
    createdBy: reviewerId,
  });

  return updatedRequest;
};

const applySettingsChange = async (request: any) => {
  switch (request.requestType) {
    case "FIRST_NAME":
      if (request.user.employee) {
        await prisma.employee.update({
          where: { id: request.user.employee.id },
          data: { firstName: request.requestedValue },
        });
      }
      break;

    case "LAST_NAME":
      if (request.user.employee) {
        await prisma.employee.update({
          where: { id: request.user.employee.id },
          data: { lastName: request.requestedValue },
        });
      }
      break;

    case "EMAIL_ADDRESS":
      // Generate verification token for new email
      const jwt = require('jsonwebtoken');
      const { sendEmail } = require('./emailService');
      
      const verificationToken = jwt.sign(
        { 
          userId: request.userId, 
          email: request.requestedValue, 
          type: "email-change-verification",
          requestId: request.id 
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );
      
      // Store token in user record
      await prisma.user.update({
        where: { id: request.userId },
        data: {
          emailVerificationToken: verificationToken,
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      
      // Send verification email to NEW email address
      try {
        await sendEmail({
          to: request.requestedValue,
          subject: "Verify your new email address",
          html: `
            <h1>Email Change Verification</h1>
            <p>Please click the link below to verify your new email address:</p>
            <a href="${process.env.FRONTEND_URL}/confirm-email?token=${verificationToken}">Verify New Email</a>
            <p>This link expires in 24 hours.</p>
          `,
        });
      } catch (emailError) {
        console.error('Email verification failed:', emailError);
        throw new Error('Failed to send verification email');
      }
      break;

    case "COMPANY_NAME":
      if (request.user.customer) {
        await prisma.customer.update({
          where: { id: request.user.customer.id },
          data: { companyName: request.requestedValue },
        });
      }
      break;

    case "TAX_NUMBER":
      if (request.user.customer) {
        await prisma.customer.update({
          where: { id: request.user.customer.id },
          data: { taxNumber: request.requestedValue },
        });
      }
      break;
  }
};
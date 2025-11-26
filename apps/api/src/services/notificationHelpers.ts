// src/services/notificationHelpers.ts
import { createNotification } from "./notificationServices";
import { prisma } from "@repo/db";
import { getNotificationTranslation, getStatusMessageTranslation } from "../utils/notificationTranslations";

/**
 * Assignment Notifications
 */
export const notifyAssignmentCreated = async (assignmentId: string, createdBy?: string) => {
  console.log("🔔 notifyAssignmentCreated called for:", assignmentId);
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      employee: { include: { user: true } },
      order: { include: { customer: true } }
    }
  });

  if (!assignment) {
    console.log("❌ Assignment not found:", assignmentId);
    return;
  }

  console.log("📧 Creating notification for employee:", assignment.employeeId, "userId:", assignment.employee.userId);
  
  const customerName = assignment.order?.customer?.companyName || 'Unknown Customer';
  
  try {
    const translation = await getNotificationTranslation(
      assignment.employee.userId,
      'assignment',
      'created',
      {
        orderNumber: assignment.order?.orderNumber || 'Unknown',
        customerName
      }
    );
    
    const result = await createNotification({
      templateKey: "ASSIGNMENT_CREATED",
      title: translation.title,
      body: translation.body,
      data: {
        category: "assignment",
        assignmentId: assignment.id,
        orderId: assignment.orderId,
        orderNumber: assignment.order?.orderNumber || 'Unknown',
        customerName
      },
      recipients: [{ userId: assignment.employee.userId }],
      createdBy
    });
    
    console.log("✅ Notification created:", result);
  } catch (error) {
    console.error("❌ Failed to create notification:", error);
  }
};

export const notifyAssignmentUpdated = async (assignmentId: string, createdBy?: string) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      employee: { include: { user: true } },
      order: { include: { customer: true } }
    }
  });

  if (!assignment) return;

  const translation = await getNotificationTranslation(
    assignment.employee.userId,
    'assignment',
    'updated',
    { orderNumber: assignment.order?.orderNumber || 'Unknown' }
  );

  await createNotification({
    templateKey: "ASSIGNMENT_UPDATED",
    title: translation.title,
    body: translation.body,
    data: {
      category: "assignment",
      assignmentId: assignment.id,
      orderId: assignment.orderId,
      orderNumber: assignment.order?.orderNumber || 'Unknown'
    },
    recipients: [{ userId: assignment.employee.userId }],
    createdBy
  });
};

export const notifyAssignmentCancelled = async (assignmentId: string, employeeId: string, orderNumber: string, createdBy?: string) => {
  const translation = await getNotificationTranslation(
    employeeId,
    'assignment',
    'cancelled',
    { orderNumber }
  );

  await createNotification({
    templateKey: "ASSIGNMENT_CANCELLED",
    title: translation.title,
    body: translation.body,
    data: {
      category: "assignment",
      assignmentId,
      orderNumber
    },
    recipients: [{ userId: employeeId }],
    createdBy
  });
};

/**
 * Order Status Notifications
 */
export const notifyOrderStatusChanged = async (orderId: string, newStatus: string, createdBy?: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      employeeAssignments: { include: { employee: { include: { user: true } } } },
      customer: true
    }
  });

  if (!order) return;

  const recipients = new Set<string>();
  
  // Add order creator
  if (order.createdBy) {
    recipients.add(order.createdBy);
  }
  
  // Add assigned employees
  order.employeeAssignments.forEach(assignment => {
    recipients.add(assignment.employee.userId);
  });

  if (recipients.size === 0) return;

  // Send to each recipient with their language preference
  await Promise.all(
    Array.from(recipients).map(async (userId) => {
      const statusMessage = await getStatusMessageTranslation(userId, newStatus);
      
      const translation = await getNotificationTranslation(
        userId,
        'order',
        'statusChanged',
        {
          orderNumber: order.orderNumber,
          statusMessage
        }
      );

      return createNotification({
        templateKey: "ORDER_STATUS_CHANGED",
        title: translation.title,
        body: translation.body,
        data: {
          category: "order",
          orderId: order.id,
          orderNumber: order.orderNumber,
          newStatus
        },
        recipients: [{ userId }],
        createdBy
      });
    })
  );
};

export const notifyOrderCompleted = async (orderId: string, createdBy?: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true }
  });

  if (!order || !order.createdBy) return;

  const customerName = order.customer?.companyName || 'Unknown Customer';
  
  const translation = await getNotificationTranslation(
    order.createdBy,
    'order',
    'completed',
    {
      orderNumber: order.orderNumber,
      customerName
    }
  );
  
  await createNotification({
    templateKey: "ORDER_COMPLETED",
    title: translation.title,
    body: translation.body,
    data: {
      category: "order",
      orderId: order.id,
      orderNumber: order.orderNumber
    },
    recipients: [{ userId: order.createdBy }],
    createdBy
  });
};

/**
 * Leave Request Notifications
 */
export const notifyLeaveRequested = async (
  absenceId: string, 
  employeeId: string, 
  leaveType: string, 
  startDate: Date, 
  endDate: Date, 
  reason?: string, 
  createdBy?: string
) => {
  // Get all admins
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true }
  });

  if (admins.length === 0) return;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { firstName: true, lastName: true }
  });

  if (!employee) return;

  const employeeName = `${employee.firstName} ${employee.lastName}`;
  const formattedStartDate = startDate.toLocaleDateString();
  const formattedEndDate = endDate.toLocaleDateString();

  // Send to each admin with their language preference
  await Promise.all(
    admins.map(async (admin) => {
      const translation = await getNotificationTranslation(
        admin.id,
        'leave',
        'requested',
        {
          employeeName,
          leaveType,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          reason: reason || ''
        }
      );

      return createNotification({
        templateKey: "LEAVE_REQUESTED",
        title: translation.title,
        body: translation.body,
        data: {
          category: "leave",
          absenceId,
          employeeId,
          employeeName,
          leaveType,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          reason
        },
        recipients: [{ userId: admin.id }],
        createdBy
      });
    })
  );
};

export const notifyLeaveApproved = async (absenceId: string, employeeUserId: string, createdBy?: string) => {
  const translation = await getNotificationTranslation(
    employeeUserId,
    'leave',
    'approved',
    {}
  );

  await createNotification({
    templateKey: "LEAVE_APPROVED",
    title: translation.title,
    body: translation.body,
    data: {
      category: "leave",
      absenceId
    },
    recipients: [{ userId: employeeUserId }],
    createdBy
  });
};

export const notifyLeaveRejected = async (absenceId: string, employeeUserId: string, reason?: string, createdBy?: string) => {
  const translation = await getNotificationTranslation(
    employeeUserId,
    'leave',
    'rejected',
    { reason: reason ? ` Reason: ${reason}` : '' }
  );

  await createNotification({
    templateKey: "LEAVE_REJECTED",
    title: translation.title,
    body: translation.body,
    data: {
      category: "leave",
      absenceId,
      reason
    },
    recipients: [{ userId: employeeUserId }],
    createdBy
  });
};

/**
 * Order Work Flow Notifications
 */
export const notifyOrderApproved = async (orderId: string, approvedBy: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      employeeAssignments: { include: { employee: { include: { user: true } } } }
    }
  });

  if (!order || order.employeeAssignments.length === 0) return;

  // Notify all assigned employees
  await Promise.all(
    order.employeeAssignments.map(async (assignment) => {
      const translation = await getNotificationTranslation(
        assignment.employee.userId,
        'order',
        'approved',
        { orderNumber: order.orderNumber }
      );

      return createNotification({
        templateKey: "ORDER_APPROVED",
        title: translation.title,
        body: translation.body,
        data: {
          category: "order",
          orderId: order.id,
          orderNumber: order.orderNumber
        },
        recipients: [{ userId: assignment.employee.userId }],
        createdBy: approvedBy
      });
    })
  );
};

export const notifyOrderRejected = async (orderId: string, rejectedBy: string, reason?: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      employeeAssignments: { include: { employee: { include: { user: true } } } }
    }
  });

  if (!order || order.employeeAssignments.length === 0) return;

  // Notify all assigned employees
  await Promise.all(
    order.employeeAssignments.map(async (assignment) => {
      const translation = await getNotificationTranslation(
        assignment.employee.userId,
        'order',
        'rejected',
        { 
          orderNumber: order.orderNumber,
          reason: reason ? ` Reason: ${reason}` : ''
        }
      );

      return createNotification({
        templateKey: "ORDER_REJECTED",
        title: translation.title,
        body: translation.body,
        data: {
          category: "order",
          orderId: order.id,
          orderNumber: order.orderNumber,
          reason
        },
        recipients: [{ userId: assignment.employee.userId }],
        createdBy: rejectedBy
      });
    })
  );
};
export const notifyWorkStarted = async (orderId: string, employeeId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true }
  });

  if (!order || !order.createdBy) return;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { firstName: true, lastName: true }
  });

  if (!employee) return;

  const translation = await getNotificationTranslation(
    order.createdBy,
    'order',
    'workStarted',
    {
      orderNumber: order.orderNumber,
      employeeName: `${employee.firstName} ${employee.lastName}`
    }
  );

  await createNotification({
    templateKey: "ORDER_WORK_STARTED",
    title: translation.title,
    body: translation.body,
    data: {
      category: "order",
      orderId: order.id,
      orderNumber: order.orderNumber,
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`
    },
    recipients: [{ userId: order.createdBy }]
  });
};

export const notifyOrderReview = async (orderId: string, employeeId: string) => {
  console.log("🔔 notifyOrderReview called:", { orderId, employeeId });
  
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true }
  });

  if (!order) {
    console.log("❌ Order not found for review notification:", orderId);
    return;
  }
  
  if (!order.createdBy) {
    console.log("❌ No order creator found for review notification:", orderId);
    return;
  }
  
  console.log("📋 Order review details:", {
    orderNumber: order.orderNumber,
    createdBy: order.createdBy,
    employeeId
  });

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { firstName: true, lastName: true }
  });

  if (!employee) return;

  const translation = await getNotificationTranslation(
    order.createdBy,
    'order',
    'reviewRequested',
    {
      orderNumber: order.orderNumber,
      employeeName: `${employee.firstName} ${employee.lastName}`
    }
  );

  await createNotification({
    templateKey: "ORDER_REVIEW_REQUESTED",
    title: translation.title,
    body: translation.body,
    data: {
      category: "order",
      orderId: order.id,
      orderNumber: order.orderNumber,
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`
    },
    recipients: [{ userId: order.createdBy }]
  });
};

export const notifyOrderNoteAdded = async (orderId: string, noteAuthor: string, noteContent: string) => {
  console.log("🔔 notifyOrderNoteAdded called:", { orderId, noteAuthor });
  
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      employeeAssignments: { include: { employee: { include: { user: true } } } }
    }
  });

  if (!order) {
    console.log("❌ Order not found:", orderId);
    return;
  }
  
  console.log("📋 Order details:", {
    orderNumber: order.orderNumber,
    createdBy: order.createdBy,
    noteAuthor,
    assignedEmployees: order.employeeAssignments.length
  });

  const recipients = new Set<string>();
  
  // Always add order creator (admin) if exists and not the note author
  if (order.createdBy && order.createdBy !== noteAuthor) {
    recipients.add(order.createdBy);
  }
  
  // Add assigned employees (exclude note author)
  order.employeeAssignments.forEach(assignment => {
    if (assignment.employee.userId !== noteAuthor) {
      recipients.add(assignment.employee.userId);
    }
  });

  if (recipients.size === 0) {
    console.log("⚠️ No recipients found for note notification");
    return;
  }
  
  console.log("📧 Sending notifications to:", Array.from(recipients));

  // Send to each recipient with their language preference
  await Promise.all(
    Array.from(recipients).map(async (userId) => {
      const translation = await getNotificationTranslation(
        userId,
        'order',
        'noteAdded',
        {
          orderNumber: order.orderNumber,
          notePreview: noteContent.substring(0, 50) + (noteContent.length > 50 ? '...' : '')
        }
      );

      return createNotification({
        templateKey: "ORDER_NOTE_ADDED",
        title: translation.title,
        body: translation.body,
        data: {
          category: "order",
          orderId: order.id,
          orderNumber: order.orderNumber,
          notePreview: noteContent.substring(0, 50) + (noteContent.length > 50 ? '...' : ''),
          action: "openNotes"
        },
        recipients: [{ userId }]
      });
    })
  );
};

/**
 * Employee Status Notifications
 */
export const notifyEmployeeBlocked = async (employeeId: string, reason?: string, createdBy?: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { userId: true, firstName: true, lastName: true }
  });

  if (!employee) return;

  await createNotification({
    templateKey: "EMPLOYEE_BLOCKED",
    title: "Account Blocked",
    body: `Your account has been blocked.${reason ? ` Reason: ${reason}` : ''}`,
    data: {
      category: "system",
      employeeId,
      reason
    },
    recipients: [{ userId: employee.userId }],
    createdBy
  });
};

export const notifyEmployeeUnblocked = async (employeeId: string, createdBy?: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { userId: true, firstName: true, lastName: true }
  });

  if (!employee) return;

  await createNotification({
    templateKey: "EMPLOYEE_UNBLOCKED",
    title: "Account Unblocked",
    body: "Your account has been unblocked. You can now access the system normally.",
    data: {
      category: "system",
      employeeId
    },
    recipients: [{ userId: employee.userId }],
    createdBy
  });
};

/**
 * Skill Notifications
 */
export const notifySkillAdded = async (employeeId: string, qualificationName: string) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: true,
      },
    });

    if (!employee) return;

    const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.user.username;

    // Notify all admins about new skill added by employee
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    for (const admin of admins) {
      await createNotification({
        templateKey: 'SKILL_ADDED',
        title: 'Neue Fähigkeit hinzugefügt',
        body: `${employeeName} hat die Fähigkeit "${qualificationName}" hinzugefügt und wartet auf Bestätigung.`,
        data: {
          category: 'skill',
          employeeId,
          employeeName,
          qualificationName,
        },
        recipients: [{ userId: admin.id }],
      });
    }
  } catch (error) {
    console.error('Error sending skill added notification:', error);
  }
};

export const notifySkillApproved = async (employeeId: string, qualificationName: string) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: true,
      },
    });

    if (!employee) return;

    // Notify employee about skill approval
    await createNotification({
      templateKey: 'SKILL_APPROVED',
      title: 'Fähigkeit bestätigt',
      body: `Ihre Fähigkeit "${qualificationName}" wurde von einem Administrator bestätigt.`,
      data: {
        category: 'skill',
        employeeId,
        qualificationName,
      },
      recipients: [{ userId: employee.user.id }],
    });
  } catch (error) {
    console.error('Error sending skill approved notification:', error);
  }
};

export const notifySkillRejected = async (employeeId: string, qualificationName: string, reason?: string) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: true,
      },
    });

    if (!employee) return;

    // Notify employee about skill rejection
    await createNotification({
      templateKey: 'SKILL_REJECTED',
      title: 'Fähigkeit abgelehnt',
      body: `Ihre Fähigkeit "${qualificationName}" wurde abgelehnt.${reason ? ` Grund: ${reason}` : ''}`,
      data: {
        category: 'skill',
        employeeId,
        qualificationName,
        reason,
      },
      recipients: [{ userId: employee.user.id }],
    });
  } catch (error) {
    console.error('Error sending skill rejected notification:', error);
  }
};

/**
 * Customer Notifications
 */
export const notifyCustomerOrderStatusChanged = async (orderId: string, newStatus: string, createdBy?: string) => {
  console.log("🔔 notifyCustomerOrderStatusChanged called:", { orderId, newStatus });
  
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        include: { user: true }
      }
    }
  });

  console.log("📋 Order details:", {
    orderFound: !!order,
    customerFound: !!order?.customer,
    userFound: !!order?.customer?.user,
    customerId: order?.customer?.id,
    userId: order?.customer?.user?.id,
    orderNumber: order?.orderNumber
  });

  if (!order?.customer?.user) {
    console.log("❌ No customer user found for order:", orderId);
    return;
  }

  const statusMessage = await getStatusMessageTranslation(order.customer.user.id, newStatus);
  
  const translation = await getNotificationTranslation(
    order.customer.user.id,
    'customer',
    'orderStatusChanged',
    {
      orderNumber: order.orderNumber,
      status: statusMessage
    }
  );

  console.log("📧 Creating customer notification:", {
    userId: order.customer.user.id,
    title: translation.title,
    body: translation.body
  });

  const result = await createNotification({
    templateKey: "CUSTOMER_ORDER_STATUS_CHANGED",
    title: translation.title,
    body: translation.body,
    data: {
      category: "order",
      orderId: order.id,
      orderNumber: order.orderNumber,
      newStatus,
      status: statusMessage
    },
    recipients: [{ userId: order.customer.user.id }],
    createdBy
  });
  
  console.log("✅ Customer notification result:", result);
};

export const notifyCustomerOrderCompleted = async (orderId: string, createdBy?: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        include: { user: true }
      }
    }
  });

  if (!order?.customer?.user) return;
  
  const translation = await getNotificationTranslation(
    order.customer.user.id,
    'customer',
    'orderCompleted',
    {
      orderNumber: order.orderNumber
    }
  );

  await createNotification({
    templateKey: "CUSTOMER_ORDER_COMPLETED",
    title: translation.title,
    body: translation.body,
    data: {
      category: "order",
      orderId: order.id,
      orderNumber: order.orderNumber
    },
    recipients: [{ userId: order.customer.user.id }],
    createdBy
  });
};

export const notifyCustomerOrderCancelled = async (orderId: string, reason?: string, createdBy?: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        include: { user: true }
      }
    }
  });

  if (!order?.customer?.user) return;
  
  const translation = await getNotificationTranslation(
    order.customer.user.id,
    'customer',
    'orderCancelled',
    {
      orderNumber: order.orderNumber,
      reason: reason ? ` Reason: ${reason}` : ''
    }
  );

  await createNotification({
    templateKey: "CUSTOMER_ORDER_CANCELLED",
    title: translation.title,
    body: translation.body,
    data: {
      category: "order",
      orderId: order.id,
      orderNumber: order.orderNumber,
      reason
    },
    recipients: [{ userId: order.customer.user.id }],
    createdBy
  });
};

export const notifyCustomerOrderCreated = async (orderId: string, createdBy?: string) => {
  console.log("🔔 notifyCustomerOrderCreated called:", { orderId });
  
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        include: { user: true }
      }
    }
  });

  console.log("📋 Order creation details:", {
    orderFound: !!order,
    customerFound: !!order?.customer,
    userFound: !!order?.customer?.user,
    customerId: order?.customer?.id,
    userId: order?.customer?.user?.id,
    orderNumber: order?.orderNumber
  });

  if (!order?.customer?.user) {
    console.log("❌ No customer user found for order:", orderId);
    return;
  }
  
  const translation = await getNotificationTranslation(
    order.customer.user.id,
    'customer',
    'orderCreated',
    {
      orderNumber: order.orderNumber,
      scheduledDate: new Date(order.scheduledDate).toLocaleDateString()
    }
  );

  console.log("📧 Creating customer order creation notification:", {
    userId: order.customer.user.id,
    title: translation.title,
    body: translation.body
  });

  const result = await createNotification({
    templateKey: "CUSTOMER_ORDER_CREATED",
    title: translation.title,
    body: translation.body,
    data: {
      category: "order",
      orderId: order.id,
      orderNumber: order.orderNumber,
      scheduledDate: new Date(order.scheduledDate).toLocaleDateString()
    },
    recipients: [{ userId: order.customer.user.id }],
    createdBy
  });
  
  console.log("✅ Customer order creation notification result:", result);
};

export const notifyCustomerOrderScheduleChanged = async (orderId: string, newDate: Date, createdBy?: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        include: { user: true }
      }
    }
  });

  if (!order?.customer?.user) return;
  
  const translation = await getNotificationTranslation(
    order.customer.user.id,
    'customer',
    'orderScheduleChanged',
    {
      orderNumber: order.orderNumber,
      newDate: newDate.toLocaleDateString()
    }
  );

  await createNotification({
    templateKey: "CUSTOMER_ORDER_SCHEDULE_CHANGED",
    title: translation.title,
    body: translation.body,
    data: {
      category: "order",
      orderId: order.id,
      orderNumber: order.orderNumber,
      newDate: newDate.toISOString()
    },
    recipients: [{ userId: order.customer.user.id }],
    createdBy
  });
};

/**
 * System Notifications
 */
export const notifyWelcomeNewEmployee = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { userId: true }
  });

  if (!employee) return;

  await createNotification({
    templateKey: "WELCOME_NEW_EMPLOYEE",
    title: "Welcome to the Team!",
    body: "Welcome to our ERP system. Your account has been successfully created.",
    data: {
      category: "system",
      employeeId
    },
    recipients: [{ userId: employee.userId }]
  });
};

export const notifyProfileUpdated = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { userId: true }
  });

  if (!employee) return;

  await createNotification({
    templateKey: "PROFILE_UPDATED",
    title: "Profile Updated",
    body: "Your profile has been successfully updated.",
    data: {
      category: "system",
      employeeId
    },
    recipients: [{ userId: employee.userId }]
  });
};


import { prisma } from "@repo/db";
import { OrderStatus, NoteCategory } from "@repo/db/src/generated/prisma";
import { notifyOrderNoteAdded, notifyWorkStarted, notifyOrderReview, notifyOrderApproved, notifyOrderRejected } from "./notificationHelpers";

// Type definitions
type CreateOrderNoteInput = {
  orderId: string;
  authorId: string;
  content: string;
  triggersStatus?: OrderStatus;
  category?: NoteCategory;
  isInternal?: boolean;
};

type UpdateOrderNoteInput = {
  content?: string;
  category?: NoteCategory;
  isInternal?: boolean;
};

// -------------------- Order Notes CRUD --------------------

export const getOrderNotesService = async (orderId: string, userRole: string) => {
  const whereClause = userRole === "ADMIN" || userRole === "TEAM_LEADER" 
    ? { orderId } // Admins see all notes
    : { orderId, isInternal: false }; // Employees don't see internal notes

  return prisma.orderNote.findMany({
    where: whereClause,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          employee: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createOrderNoteService = async (data: CreateOrderNoteInput) => {
  const { orderId, authorId, content, triggersStatus, category = "GENERAL_UPDATE", isInternal = false } = data;

  // Verify order exists and user has access
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      employeeAssignments: {
        include: { employee: { include: { user: true } } },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Check if user has permission to add notes to this order
  const user = await prisma.user.findUnique({
    where: { id: authorId },
    include: { employee: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isAdmin = user.role === "ADMIN" || user.role === "TEAM_LEADER";
  const isAssignedEmployee = order.employeeAssignments.some(
    (assignment) => assignment.employee.userId === authorId
  );

  if (!isAdmin && !isAssignedEmployee) {
    throw new Error("User not authorized to add notes to this order");
  }

  // Create note in transaction with potential status update
  const result = await prisma.$transaction(async (tx) => {
    // Create the note
    const note = await tx.orderNote.create({
      data: {
        orderId,
        authorId,
        content,
        triggersStatus,
        category,
        isInternal,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Update order status if triggered
    if (triggersStatus) {
      const updateData: any = { status: triggersStatus };
      
      // Record start time when work begins
      if (triggersStatus === 'IN_PROGRESS') {
        updateData.startTime = new Date();
      }
      
      await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });
      
      // Create additional note for manual start tracking
      // Only for employee starting work for the first time (ACTIVE -> IN_PROGRESS)
      if (triggersStatus === 'IN_PROGRESS' && !isAdmin && order.status === 'ACTIVE') {
        await tx.orderNote.create({
          data: {
            orderId,
            authorId,
            content: `Work started manually by employee at ${new Date().toLocaleString()}`,
            category: 'GENERAL_UPDATE',
            isInternal: true // Internal tracking note
          }
        });
      }
    }

    return { note, shouldNotify: !isInternal, statusChanged: !!triggersStatus };
  }, {
    timeout: 10000, // 10 seconds timeout
  });

  // Send notifications outside transaction to avoid timeout
  if (result.shouldNotify) {
    try {
      await notifyOrderNoteAdded(orderId, authorId, content);
    } catch (error) {
      console.error('Failed to send note notification:', error);
    }
  }

  if (result.statusChanged && triggersStatus) {
    try {
      // Handle different status transitions and notifications
      if (triggersStatus === 'IN_PROGRESS' && !isAdmin && order.status === 'ACTIVE' && user.employee?.id) {
        await notifyWorkStarted(orderId, user.employee.id);
      } else if (triggersStatus === 'IN_REVIEW' && !isAdmin && user.employee?.id) {
        console.log("🔔 Employee requesting order completion review:", { orderId, employeeId: user.employee.id });
        await notifyOrderReview(orderId, user.employee.id);
      } else if (triggersStatus === 'COMPLETED' && isAdmin) {
        console.log("🔔 Admin approving order completion:", { orderId });
        await notifyOrderApproved(orderId, authorId);
      } else if (triggersStatus === 'IN_PROGRESS' && isAdmin) {
        console.log("🔔 Admin rejecting order:", { orderId });
        await notifyOrderRejected(orderId, authorId, content);
      }
    } catch (error) {
      console.error('Failed to send status notification:', error);
    }
  }

  return result.note;
};

export const updateOrderNoteService = async (
  noteId: string,
  authorId: string,
  data: UpdateOrderNoteInput
) => {
  // Verify note exists and user is the author
  const existingNote = await prisma.orderNote.findUnique({
    where: { id: noteId },
  });

  if (!existingNote) {
    throw new Error("Note not found");
  }

  if (existingNote.authorId !== authorId) {
    throw new Error("Only the author can edit this note");
  }

  return prisma.orderNote.update({
    where: { id: noteId },
    data,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          employee: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
};

export const deleteOrderNoteService = async (noteId: string, authorId: string, userRole: string) => {
  // Verify note exists
  const existingNote = await prisma.orderNote.findUnique({
    where: { id: noteId },
  });

  if (!existingNote) {
    throw new Error("Note not found");
  }

  // Check permissions: author can delete their own notes, admins can delete any
  const isAdmin = userRole === "ADMIN" || userRole === "TEAM_LEADER";
  const isAuthor = existingNote.authorId === authorId;

  if (!isAdmin && !isAuthor) {
    throw new Error("Not authorized to delete this note");
  }

  return prisma.orderNote.delete({
    where: { id: noteId },
  });
};

// -------------------- Helper Functions --------------------

export const getOrderNoteByIdService = async (noteId: string, userId: string, userRole: string) => {
  const note = await prisma.orderNote.findUnique({
    where: { id: noteId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          employee: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      order: {
        include: {
          employeeAssignments: {
            include: { employee: { include: { user: true } } },
          },
        },
      },
    },
  });

  if (!note) {
    throw new Error("Note not found");
  }

  // Check access permissions
  const isAdmin = userRole === "ADMIN" || userRole === "TEAM_LEADER";
  const isAssignedEmployee = note.order.employeeAssignments.some(
    (assignment) => assignment.employee.userId === userId
  );

  if (!isAdmin && !isAssignedEmployee) {
    throw new Error("Not authorized to view this note");
  }

  // Filter internal notes for non-admins
  if (!isAdmin && note.isInternal) {
    throw new Error("Not authorized to view internal notes");
  }

  return note;
};

export const getOrderNotesCountService = async (orderId: string) => {
  return prisma.orderNote.count({
    where: { orderId },
  });
};
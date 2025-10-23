import { prisma } from "../lib/prisma";
import { DocumentType } from "../generated/prisma";
import fs from "fs";
import path from "path";

interface FileUploadData {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  documentType?: DocumentType;
  description?: string;
  expiryDate?: Date;
  employeeId?: string;
  orderId?: string;
  assignmentId?: string;
  uploadedBy?: string;
  isPublic?: boolean;
}

// Create file record in database
export const createFileService = async (data: FileUploadData) => {
  return prisma.file.create({
    data: {
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      path: data.path,
      documentType: data.documentType || "OTHER",
      description: data.description,
      expiryDate: data.expiryDate,
      employeeId: data.employeeId,
      orderId: data.orderId,
      assignmentId: data.assignmentId,
      uploadedBy: data.uploadedBy,
      isPublic: data.isPublic || false
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          employeeCode: true
        }
      }
    }
  });
};

// Get file by ID
export const getFileByIdService = async (id: string) => {
  return prisma.file.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          employeeCode: true
        }
      },
      order: {
        select: {
          orderNumber: true,
          title: true
        }
      },
      assignment: {
        select: {
          id: true,
          status: true
        }
      }
    }
  });
};

// Get files by employee
export const getFilesByEmployeeService = async (employeeId: string) => {
  return prisma.file.findMany({
    where: { employeeId },
    orderBy: { createdAt: 'desc' },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          employeeCode: true
        }
      }
    }
  });
};

// Get files by order
export const getFilesByOrderService = async (orderId: string) => {
  return prisma.file.findMany({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          employeeCode: true
        }
      }
    }
  });
};

// Get files by assignment
export const getFilesByAssignmentService = async (assignmentId: string) => {
  return prisma.file.findMany({
    where: { assignmentId },
    orderBy: { createdAt: 'desc' },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          employeeCode: true
        }
      }
    }
  });
};

// Delete file
export const deleteFileService = async (id: string) => {
  const file = await prisma.file.findUnique({
    where: { id }
  });

  if (!file) {
    throw new Error("File not found");
  }

  // Delete physical file
  try {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (error) {
    console.error("Error deleting physical file:", error);
  }

  // Delete database record
  return prisma.file.delete({
    where: { id }
  });
};

// Update file metadata
export const updateFileService = async (id: string, data: Partial<FileUploadData>) => {
  return prisma.file.update({
    where: { id },
    data: {
      ...(data.description && { description: data.description }),
      ...(data.documentType && { documentType: data.documentType }),
      ...(data.expiryDate && { expiryDate: data.expiryDate }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic })
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          employeeCode: true
        }
      }
    }
  });
};

// Get expiring files (for notifications)
export const getExpiringFilesService = async (daysAhead: number = 30) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return prisma.file.findMany({
    where: {
      expiryDate: {
        lte: futureDate,
        gte: new Date()
      }
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          employeeCode: true,
          user: {
            select: {
              email: true
            }
          }
        }
      }
    },
    orderBy: { expiryDate: 'asc' }
  });
};

// Verify file
export const verifyFileService = async (id: string, verifiedBy: string) => {
  return prisma.file.update({
    where: { id },
    data: {
      isVerified: true,
      updatedAt: new Date()
    }
  });
};
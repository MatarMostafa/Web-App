import { prisma } from "@repo/db";
import fs from "fs";
import path from "path";

export const createFileService = async (fileData: any) => {
  return await prisma.file.create({
    data: fileData,
  });
};

export const getFileByIdService = async (id: string) => {
  return await prisma.file.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
        },
      },
      assignment: {
        select: {
          id: true,
          order: {
            select: {
              orderNumber: true,
            },
          },
        },
      },
    },
  });
};

export const getFilesByEmployeeService = async (employeeId: string) => {
  return await prisma.file.findMany({
    where: { employeeId },
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      },
    },
  });
};

export const deleteFileService = async (id: string) => {
  const file = await prisma.file.findUnique({
    where: { id },
  });

  if (!file) {
    throw new Error("File not found");
  }

  // Delete file from disk
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  // Delete from database
  return await prisma.file.delete({
    where: { id },
  });
};
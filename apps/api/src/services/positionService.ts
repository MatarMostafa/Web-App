import { prisma } from "@repo/db";
import { Prisma } from "@repo/db/src/generated/prisma";

interface PositionCreateData {
  title: string;
  description?: string;
  departmentId: string;
  isActive?: boolean;
}

interface PositionUpdateData {
  title?: string;
  description?: string;
  departmentId?: string;
  isActive?: boolean;
}

export const getAllPositionsService = async () => {
  return prisma.position.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      departmentId: true,
      department: { select: { name: true } },
      createdAt: true,
      updatedAt: true,
      isActive: true,
    },
    orderBy: { title: "asc" },
  });
};

export const getPositionByIdService = async (id: string) => {
  return prisma.position.findUnique({
    where: { id },
    include: { department: true },
  });
};

export const createPositionService = async (data: PositionCreateData, createdBy?: string) => {
  const position = await prisma.position.create({
    data: { ...data, isActive: data.isActive ?? true },
    include: { department: { select: { name: true } } },
  });
  
  return position;
};

export const updatePositionService = async (
  id: string,
  data: PositionUpdateData
) => {
  return prisma.position.update({
    where: { id },
    data,
    include: { department: { select: { name: true } } },
  });
};

export const deletePositionService = async (id: string) => {
  return prisma.position.delete({
    where: { id },
  });
};

export const updatePositionStatusService = async (
  id: string,
  isActive: boolean
) => {
  return prisma.position.update({
    where: { id },
    data: { isActive },
    include: { department: { select: { name: true } } },
  });
};

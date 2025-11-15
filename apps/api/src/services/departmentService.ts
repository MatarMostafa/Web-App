import { prisma } from "@repo/db";
import { Prisma } from "@repo/db/src/generated/prisma";

type DepartmentCreateInput = Prisma.DepartmentCreateInput;
type DepartmentUpdateInput = Prisma.DepartmentUpdateInput;

export const getAllDepartmentsService = async () => {
  return prisma.department.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: "asc" },
  });
};

export const getDepartmentByIdService = async (id: string) => {
  return prisma.department.findUnique({
    where: { id },
  });
};

export const createDepartmentService = async (data: DepartmentCreateInput, createdBy?: string) => {
  const department = await prisma.department.create({
    data: { ...data, isActive: data.isActive ?? true },
  });
  
  return department;
};

export const updateDepartmentService = async (
  id: string,
  data: DepartmentUpdateInput
) => {
  return prisma.department.update({
    where: { id },
    data,
  });
};

export const deleteDepartmentService = async (id: string) => {
  return prisma.department.delete({
    where: { id },
  });
};

export const updateDepartmentStatusService = async (id: string, isActive: boolean) => {
  return prisma.department.update({
    where: { id },
    data: { isActive },
  });
};

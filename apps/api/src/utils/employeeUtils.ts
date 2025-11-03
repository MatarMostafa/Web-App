import { prisma } from "@repo/db";
import { Prisma } from "@repo/db/src/generated/prisma";

export const ensureEmployeeExists = async (userId: string) => {
  // Check if employee exists
  let employee = await prisma.employee.findUnique({
    where: { userId },
  });

  if (!employee) {
    try {
      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Get default department and position
      const defaultDepartment = await prisma.department.findFirst({
        where: { code: "IT" },
      });

      const defaultPosition = await prisma.position.findFirst({
        where: { 
          title: "Software Developer",
          departmentId: defaultDepartment?.id,
        },
      });

      // Create employee record
      employee = await prisma.employee.create({
        data: {
          userId: userId,
          employeeCode: `EMP${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique code
          firstName: user.username,
          lastName: "Employee",
          hireDate: new Date(),
          departmentId: defaultDepartment?.id,
          positionId: defaultPosition?.id,
          scheduleType: "FULL_TIME",
          priority: 1,
          isAvailable: true,
        },
      });
    } catch (error: any) {
      // Handle race condition - if employee was created by another request
      if (error.code === 'P2002' && error.meta?.target?.includes('userId')) {
        // Try to fetch the employee again
        employee = await prisma.employee.findUnique({
          where: { userId },
        });
        if (!employee) {
          throw new Error("Failed to create or find employee record");
        }
      } else {
        throw error;
      }
    }
  }

  return employee;
};
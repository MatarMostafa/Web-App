import { prisma } from "@repo/db";
import { Employee } from "../types/employee";
import { WorkScheduleType } from "../types/enums";
import bcrypt from "bcryptjs";

const transformUserToEmployee = (user: any): Employee => {
  const employee = user.employee;
  return {
    id: employee?.id || user.id,
    employeeCode: employee?.employeeCode || `EMP${user.id.slice(-4)}`,
    firstName: employee?.firstName || undefined,
    lastName: employee?.lastName || undefined,
    phoneNumber: employee?.phoneNumber || undefined,
    dateOfBirth: employee?.dateOfBirth?.toISOString(),
    address: employee?.address || undefined,
    emergencyContact: employee?.emergencyContact as
      | Record<string, any>
      | undefined,
    hireDate: employee?.hireDate?.toISOString() || user.createdAt.toISOString(),
    terminationDate: employee?.terminationDate?.toISOString(),
    departmentId: employee?.departmentId || "",
    departmentName: employee?.department?.name || undefined,
    positionId: employee?.positionId || "",
    positionTitle: employee?.position?.title || undefined,
    managerId: employee?.managerId || undefined,
    scheduleType:
      (employee?.scheduleType as WorkScheduleType) ||
      WorkScheduleType.FULL_TIME,
    hourlyRate: employee?.hourlyRate?.toNumber(),
    salary: employee?.salary?.toNumber(),
    isAvailable: employee?.isAvailable ?? true,
    priority: employee?.priority || 1,
    userId: user.id,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    createdBy: user.createdBy || undefined,
    updatedBy: user.updatedBy || undefined,
  };
};

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          role: "ADMIN",
        },
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    return users.map(transformUserToEmployee);
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to fetch employees");
  }
};

export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  try {
    // First try to find by employee ID
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
        position: true,
        manager: {
          include: {
            employee: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        qualifications: {
          include: {
            qualification: true,
          },
        },
        assignments: {
          include: {
            order: true,
          },
        },
        absences: {
          orderBy: { startDate: "desc" },
          take: 10,
        },
        ratings: {
          orderBy: { ratingDate: "desc" },
          take: 10,
        },
        workStatistics: {
          orderBy: { date: "desc" },
          take: 30,
        },
        performanceRecords: {
          orderBy: { periodStart: "desc" },
          take: 10,
        },
      },
    });

    if (!employee || employee.user.role !== "EMPLOYEE") return null;

    // Transform to match the expected format
    const userWithEmployee = {
      ...employee.user,
      employee: employee,
    };

    return transformUserToEmployee(userWithEmployee);
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to fetch employee");
  }
};

export const createEmployee = async (data: any): Promise<Employee> => {
  try {
    const { email, username, password, ...employeeData } = data;
    
    // Username is required, email is optional
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    // Check for existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new Error(`Username '${username}' is already taken`);
    }
    
    // Check for existing email if provided
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new Error(`Email '${email}' is already registered`);
      }
    }

    // Validate department exists if provided
    if (employeeData.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: employeeData.departmentId },
      });
      if (!department) {
        throw new Error(
          `Department with ID ${employeeData.departmentId} not found`
        );
      }
    }

    // Validate position exists if provided
    if (employeeData.positionId) {
      const position = await prisma.position.findUnique({
        where: { id: employeeData.positionId },
      });
      if (!position) {
        throw new Error(
          `Position with ID ${employeeData.positionId} not found`
        );
      }
    }

    // Validate manager exists if provided
    if (employeeData.managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: employeeData.managerId },
      });
      if (!manager) {
        throw new Error(`Manager with ID ${employeeData.managerId} not found`);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email || null,
        username,
        password: hashedPassword,
        role: "EMPLOYEE",
        isActive: true, // Admin-created employees are active by default
        employee: {
          create: {
            ...employeeData,
            employeeCode: `EMP${Date.now().toString().slice(-6)}`,
            hireDate: employeeData.hireDate
              ? new Date(employeeData.hireDate)
              : new Date(),
            dateOfBirth: employeeData.dateOfBirth
              ? new Date(employeeData.dateOfBirth)
              : null,
            terminationDate: employeeData.terminationDate
              ? new Date(employeeData.terminationDate)
              : null,
          },
        },
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    return transformUserToEmployee(user);
  } catch (error: any) {
    console.error("Error creating employee:", error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'username') {
        throw new Error(`Username '${data.username}' is already taken`);
      } else if (field === 'email') {
        throw new Error(`Email '${data.email}' is already registered`);
      }
      throw new Error('A user with this information already exists');
    }
    
    throw error;
  }
};

export const updateEmployee = async (
  id: string,
  data: any
): Promise<Employee | null> => {
  const { email, username, ...employeeData } = data;

  try {
    // First find the employee to get the userId
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!employee) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    
    // Check for existing email if provided and different from current
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail && existingEmail.id !== employee.userId) {
        throw new Error(`Email '${email}' is already registered`);
      }
    }

    const user = await prisma.user.update({
      where: { id: employee.userId },
      data: {
        ...(email !== undefined && { email }),
        ...(username !== undefined && { username }),
        employee: {
          update: {
            ...employeeData,
            ...(employeeData.hireDate && {
              hireDate: new Date(employeeData.hireDate),
            }),
            ...(employeeData.dateOfBirth && {
              dateOfBirth: new Date(employeeData.dateOfBirth),
            }),
            ...(employeeData.terminationDate && {
              terminationDate: new Date(employeeData.terminationDate),
            }),
          },
        },
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    return transformUserToEmployee(user);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    // First find the user by employee ID
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!employee) {
      return false;
    }

    // Delete the user (which will cascade delete the employee)
    await prisma.user.delete({
      where: { id: employee.userId },
    });
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
};

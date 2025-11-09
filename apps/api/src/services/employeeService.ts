import { prisma } from "@repo/db";
import { Employee } from "../types/employee";
import { WorkScheduleType } from "../types/enums";
import bcrypt from "bcryptjs";
import { notifyWelcomeNewEmployee, notifyProfileUpdated } from "./notificationHelpers";

const transformUserToEmployee = (user: any): Employee => {
  const employee = user.employee;
  return {
    id: employee?.id || user.id,
    employeeCode: employee?.employeeCode || `EMP${user.id.slice(-4)}`,
    email: user.email || undefined,
    username: user.username || undefined,
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
    createdBy: user.createdByUser ? `${user.createdByUser.username}` : (user.createdBy ? 'Unknown Admin' : 'Self-registered'),
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

    // Get unique creator IDs
    const creatorIds = [...new Set(users.map(u => u.createdBy).filter(Boolean))] as string[];
    
    // Fetch creator information
    const creators = await prisma.user.findMany({
      where: {
        id: { in: creatorIds },
      },
      select: {
        id: true,
        username: true,
      },
    });
    
    const creatorMap = new Map(creators.map(c => [c.id, c.username]));

    return users.map(user => {
      const userWithCreator = {
        ...user,
        createdByUser: user.createdBy ? { username: creatorMap.get(user.createdBy) } : null,
      };
      return transformUserToEmployee(userWithCreator);
    });
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Fehler beim Abrufen der Mitarbeiter");
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

    // Fetch creator information if createdBy exists
    let createdByUser = null;
    if (employee.user.createdBy) {
      const creator = await prisma.user.findUnique({
        where: { id: employee.user.createdBy },
        select: { username: true },
      });
      createdByUser = creator ? { username: creator.username } : null;
    }

    // Transform to match the expected format
    const userWithEmployee = {
      ...employee.user,
      createdByUser,
      employee: employee,
    };

    return transformUserToEmployee(userWithEmployee);
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Fehler beim Abrufen des Mitarbeiters");
  }
};

export const createEmployee = async (data: any, createdBy?: string): Promise<Employee> => {
  try {
    const { email, username, password, ...employeeData } = data;
    
    // Username is required, email is optional
    if (!username || !password) {
      throw new Error('Benutzername und Passwort sind erforderlich');
    }
    
    // Check for existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new Error(`Benutzername '${username}' ist bereits vergeben`);
    }
    
    // Check for existing email if provided
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new Error(`E-Mail '${email}' ist bereits registriert`);
      }
    }

    // Validate department exists if provided
    if (employeeData.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: employeeData.departmentId },
      });
      if (!department) {
        throw new Error(
          `Abteilung mit ID ${employeeData.departmentId} nicht gefunden`
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
          `Position mit ID ${employeeData.positionId} nicht gefunden`
        );
      }
    }

    // Validate manager exists if provided
    if (employeeData.managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: employeeData.managerId },
      });
      if (!manager) {
        throw new Error(`Vorgesetzter mit ID ${employeeData.managerId} nicht gefunden`);
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
        createdBy: createdBy || null,
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

    const employee = transformUserToEmployee(user);
    
    // Send welcome notification to new employee
    if (user.employee) {
      await notifyWelcomeNewEmployee(user.employee.id);
    }
    
    return employee;
  } catch (error: any) {
    console.error("Error creating employee:", error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'username') {
        throw new Error(`Benutzername '${data.username}' ist bereits vergeben`);
      } else if (field === 'email') {
        throw new Error(`E-Mail '${data.email}' ist bereits registriert`);
      }
      throw new Error('Ein Benutzer mit diesen Informationen existiert bereits');
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
      throw new Error(`Mitarbeiter mit ID ${id} nicht gefunden`);
    }
    
    // Check for existing email if provided and different from current
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail && existingEmail.id !== employee.userId) {
        throw new Error(`E-Mail '${email}' ist bereits registriert`);
      }
    }



    const user = await prisma.user.update({
      where: { id: employee.userId },
      data: {
        ...(email !== undefined && { email }),

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

    const updatedEmployee = transformUserToEmployee(user);
    
    // Send profile update notification
    await notifyProfileUpdated(id);
    
    return updatedEmployee;
  } catch (error: any) {
    console.error("Error updating employee:", error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'username') {
        throw new Error(`Benutzername '${username}' ist bereits vergeben`);
      } else if (field === 'email') {
        throw new Error(`E-Mail '${email}' ist bereits registriert`);
      }
      throw new Error('Ein Benutzer mit diesen Informationen existiert bereits');
    }
    
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

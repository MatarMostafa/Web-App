import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";

export interface CreateSubAccountData {
  name: string;
  email: string;
  customerId: string;
  canCreateOrders?: boolean;
  canEditOrders?: boolean;
  canViewReports?: boolean;
  createdBy?: string;
}

export interface UpdateSubAccountData {
  name?: string;
  email?: string;
  canCreateOrders?: boolean;
  canEditOrders?: boolean;
  canViewReports?: boolean;
  isActive?: boolean;
}

export const createSubAccount = async (data: CreateSubAccountData) => {
  // Check if customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId }
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Create user first
  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.email,
      password: hashedPassword,
      role: "CUSTOMER_SUB_USER",
      emailVerified: false,
      createdBy: data.createdBy,
    }
  });

  // Create sub-account
  const subAccount = await prisma.subAccount.create({
    data: {
      name: data.name,
      email: data.email,
      customerId: data.customerId,
      userId: user.id,
      canCreateOrders: data.canCreateOrders ?? true,
      canEditOrders: data.canEditOrders ?? true,
      canViewReports: data.canViewReports ?? false,
      createdBy: data.createdBy,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        }
      },
      customer: {
        select: {
          id: true,
          companyName: true,
        }
      }
    }
  });

  return { subAccount, tempPassword };
};

export const getSubAccountsByCustomer = async (customerId: string) => {
  return prisma.subAccount.findMany({
    where: { customerId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

export const updateSubAccount = async (id: string, data: UpdateSubAccountData) => {
  const subAccount = await prisma.subAccount.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!subAccount) {
    throw new Error("Sub-account not found");
  }

  // Update user email if changed
  if (data.email && data.email !== subAccount.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser && existingUser.id !== subAccount.userId) {
      throw new Error("Email already exists");
    }

    await prisma.user.update({
      where: { id: subAccount.userId },
      data: { 
        email: data.email,
        username: data.email,
        isActive: data.isActive ?? subAccount.user.isActive,
      }
    });
  }

  // Update sub-account
  return prisma.subAccount.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      canCreateOrders: data.canCreateOrders,
      canEditOrders: data.canEditOrders,
      canViewReports: data.canViewReports,
      isActive: data.isActive,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        }
      }
    }
  });
};

export const deleteSubAccount = async (id: string) => {
  const subAccount = await prisma.subAccount.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!subAccount) {
    throw new Error("Sub-account not found");
  }

  // Delete user (will cascade delete sub-account)
  await prisma.user.delete({
    where: { id: subAccount.userId }
  });

  return { success: true };
};

export const getSubAccountById = async (id: string) => {
  return prisma.subAccount.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
        }
      },
      customer: {
        select: {
          id: true,
          companyName: true,
        }
      }
    }
  });
};
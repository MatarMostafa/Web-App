import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";

export interface CreateSubAccountData {
  name: string;
  username: string;
  password: string;
  email?: string;
  customerId: string;
  createdBy?: string;
}

export interface UpdateSubAccountData {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export const createSubAccount = async (data: CreateSubAccountData) => {
  // Check if customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId }
  });

  if (!customer) {
    throw new Error("CUSTOMER_NOT_FOUND");
  }

  // Check if username already exists
  const existingUser = await prisma.user.findUnique({
    where: { username: data.username }
  });

  if (existingUser) {
    throw new Error("USERNAME_EXISTS");
  }

  // Check if email already exists (if provided)
  if (data.email) {
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingEmailUser) {
      throw new Error("EMAIL_EXISTS");
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create user first
  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: "CUSTOMER_SUB_USER",
      emailVerified: data.email ? false : true,
      createdBy: data.createdBy,
    }
  });

  // Create sub-account
  const subAccount = await prisma.subAccount.create({
    data: {
      name: data.name,
      customerId: data.customerId,
      userId: user.id,
      createdBy: data.createdBy,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
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

  return subAccount;
};

export const getSubAccountsByCustomer = async (customerId: string) => {
  return prisma.subAccount.findMany({
    where: { customerId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
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
    throw new Error("SUB_ACCOUNT_NOT_FOUND");
  }

  // Update user email if changed
  if (data.email && data.email !== subAccount.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser && existingUser.id !== subAccount.userId) {
      throw new Error("EMAIL_EXISTS");
    }

    await prisma.user.update({
      where: { id: subAccount.userId },
      data: { 
        email: data.email,
        isActive: data.isActive ?? subAccount.user.isActive,
      }
    });
  }

  // Update sub-account
  return prisma.subAccount.update({
    where: { id },
    data: {
      name: data.name,
      isActive: data.isActive,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
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
    throw new Error("SUB_ACCOUNT_NOT_FOUND");
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
          username: true,
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

export const resetSubAccountPassword = async (id: string, newPassword: string): Promise<void> => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const subAccount = await prisma.subAccount.findUnique({
    where: { id },
    include: { user: true },
  });
  
  if (!subAccount?.user) {
    throw new Error("Sub-account or user not found");
  }
  
  await prisma.user.update({
    where: { id: subAccount.user.id },
    data: { password: hashedPassword },
  });
};
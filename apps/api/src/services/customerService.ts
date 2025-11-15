// src/services/customerService.ts
import { prisma } from "@repo/db";

export const getAllCustomers = () => {
  return prisma.customer.findMany({
    include: {
      subAccounts: true,
      orders: true,
      ratings: true,
    },
  });
};

export const getCustomerById = (id: string) => {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      subAccounts: true,
      orders: true,
      ratings: true,
    },
  });
};

export const createCustomer = async (data: any, createdBy?: string) => {
  const customer = await prisma.customer.create({ data });
  return customer;
};

export const updateCustomer = (id: string, data: any) => {
  return prisma.customer.update({
    where: { id },
    data,
  });
};

export const deleteCustomer = (id: string) => {
  return prisma.customer.delete({
    where: { id },
  });
};

/*Subaccounts */
// Create
export const createSubAccount = (customerId: string, data: any) => {
  return prisma.subAccount.create({
    data: {
      ...data,
      customerId,
    },
  });
};

// Get all for customer
export const getSubAccounts = (customerId: string) => {
  return prisma.subAccount.findMany({
    where: { customerId },
  });
};

// Update
export const updateSubAccount = (id: string, data: any) => {
  return prisma.subAccount.update({
    where: { id },
    data,
  });
};

// Delete
export const deleteSubAccount = (id: string) => {
  return prisma.subAccount.delete({
    where: { id },
  });
};

import { prisma } from "@repo/db";
import { OrderStatus } from "@repo/db/src/generated/prisma";

// Customer-specific order filtering
export const filterOrderForCustomer = (order: any) => {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    title: order.title,
    description: order.description,
    scheduledDate: order.scheduledDate,
    location: order.location,
    status: mapOrderStatusForCustomer(order.status),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    // Exclude: estimatedHours, actualHours, employeeAssignments, ratings, specialInstructions
  };
};

// Map internal order status to customer-friendly status
export const mapOrderStatusForCustomer = (status: OrderStatus): string => {
  switch (status) {
    case 'DRAFT':
    case 'OPEN':
      return 'planned';
    case 'ACTIVE':
    case 'IN_PROGRESS':
    case 'IN_REVIEW':
      return 'inprogress';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
    case 'EXPIRED':
      return 'cancelled';
    default:
      return 'unknown';
  }
};

// Validate customer order access
export const validateCustomerOrderAccess = async (customerId: string, orderId: string): Promise<boolean> => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId: customerId,
    },
  });
  return !!order;
};

// Get customer's orders
export const getCustomerOrdersService = async (customerId: string) => {
  const orders = await prisma.order.findMany({
    where: { customerId },
    orderBy: { scheduledDate: 'desc' },
    include: {
      customer: {
        select: {
          companyName: true,
        },
      },
    },
  });

  return orders.map(filterOrderForCustomer);
};

// Get single customer order
export const getCustomerOrderByIdService = async (customerId: string, orderId: string) => {
  const hasAccess = await validateCustomerOrderAccess(customerId, orderId);
  if (!hasAccess) {
    throw new Error('Order not found or access denied');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        select: {
          companyName: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return filterOrderForCustomer(order);
};

// Get customer profile
export const getCustomerProfileService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customer: true,
    },
  });

  if (!user?.customer) {
    throw new Error('Customer profile not found');
  }

  return {
    id: user.customer.id,
    companyName: user.customer.companyName,
    contactEmail: user.email || user.customer.contactEmail, // Prioritize user's email
    contactPhone: user.customer.contactPhone,
    address: user.customer.address,
    industry: user.customer.industry,
    user: {
      email: user.email,
      username: user.username,
    },
  };
};

// Update customer profile
export const updateCustomerProfileService = async (userId: string, data: any) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customer: true },
  });

  if (!user?.customer) {
    throw new Error('Customer profile not found');
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id: user.customer.id },
    data: {
      companyName: data.companyName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      address: data.address,
      industry: data.industry,
    },
  });

  return updatedCustomer;
};
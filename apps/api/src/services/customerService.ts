import { prisma } from "@repo/db";
import { OrderStatus } from "@repo/db/src/generated/prisma";
import { createOrderService } from "./orderService";
import { getPriceForCustomer } from "./priceService";
import { updateOrderService } from "./orderService";
import { notifyAdminCustomerOrderCreated, notifyAdminCustomerOrderUpdated } from "./notificationHelpers";

// Customer-specific order filtering
export const filterOrderForCustomer = (order: any) => {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    title: order.title,
    description: order.description,
    scheduledDate: order.scheduledDate,
    startTime: order.startTime,
    endTime: order.endTime,
    location: order.location,
    specialInstructions: order.specialInstructions,
    status: mapOrderStatusForCustomer(order.status),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    // Exclude: estimatedHours, actualHours, employeeAssignments, ratings
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
      customerActivities: {
        include: {
          activity: {
            select: {
              id: true,
              name: true,
              code: true,
              description: true,
              unit: true
            }
          }
        }
      },
      descriptionData: true
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return {
    ...filterOrderForCustomer(order),
    customerActivities: order.customerActivities,
    descriptionData: order.descriptionData
  };
};

// Get customer profile (works for both CUSTOMER and CUSTOMER_SUB_USER)
export const getCustomerProfileService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customer: {
        include: {
          descriptionTemplate: true,
          subAccounts: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      },
      subAccount: {
        include: {
          customer: {
            include: {
              descriptionTemplate: true,
              subAccounts: {
                where: { isActive: true },
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // For CUSTOMER role, use direct customer relationship
  if (user.customer) {
    return {
      id: user.customer.id,
      companyName: user.customer.companyName,
      contactEmail: user.email || user.customer.contactEmail,
      contactPhone: user.customer.contactPhone,
      address: user.customer.address,
      industry: user.customer.industry,
      taxNumber: user.customer.taxNumber,
      descriptionTemplate: user.customer.descriptionTemplate,
      subAccounts: user.customer.subAccounts,
      user: {
        email: user.email,
        username: user.username,
      },
    };
  }

  // For CUSTOMER_SUB_USER role, use parent customer through subAccount
  if (user.subAccount?.customer) {
    return {
      id: user.subAccount.customer.id,
      companyName: user.subAccount.customer.companyName,
      contactEmail: user.subAccount.customer.contactEmail,
      contactPhone: user.subAccount.customer.contactPhone,
      address: user.subAccount.customer.address,
      industry: user.subAccount.customer.industry,
      taxNumber: user.subAccount.customer.taxNumber,
      descriptionTemplate: user.subAccount.customer.descriptionTemplate,
      subAccounts: user.subAccount.customer.subAccounts,
      user: {
        email: user.email,
        username: user.username,
      },
    };
  }

  throw new Error('Customer profile not found');
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

// Create customer order
export const createCustomerOrderService = async (userId: string, orderData: any) => {
  // Get customer ID from user (works for both CUSTOMER and CUSTOMER_SUB_USER)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      customer: true,
      subAccount: {
        include: { customer: true }
      }
    },
  });

  let customerId: string;
  let createdBySubAccountId: string | undefined;
  
  if (user?.customer) {
    // Direct customer
    customerId = user.customer.id;
  } else if (user?.subAccount?.customer) {
    // Sub-user accessing parent customer's data
    customerId = user.subAccount.customer.id;
    createdBySubAccountId = user.subAccount.id; // Auto-detect subaccount
  } else {
    throw new Error('Customer profile not found');
  }

  // Validate and sanitize order data for customer creation
  const sanitizedOrderData = {
    orderNumber: "", // Will be auto-generated by createOrderService
    description: orderData.description || "",
    scheduledDate: orderData.scheduledDate,
    startTime: orderData.startTime,
    endTime: orderData.endTime,
    location: orderData.location || "",
    specialInstructions: orderData.specialInstructions || "",
    status: OrderStatus.DRAFT, // Always start as DRAFT for customer orders
    customer: {
      connect: { id: customerId }
    },
    customerId: customerId,
    createdBySubAccountId: createdBySubAccountId, // Auto-detected from user
    activities: orderData.activities || [],
    templateData: orderData.templateData
  };

  // Create the order using the existing order service
  const order = await createOrderService(sanitizedOrderData, userId);
  
  // Send notification to admins about customer order creation
  await notifyAdminCustomerOrderCreated(order.id, userId);
  
  // Return filtered order data for customer
  return filterOrderForCustomer(order);
};

// Update customer order (only DRAFT orders)
export const updateCustomerOrderService = async (orderId: string, orderData: any) => {
  // Validate and sanitize order data for customer update
  const sanitizedOrderData = {
    scheduledDate: orderData.scheduledDate,
    startTime: orderData.startTime,
    endTime: orderData.endTime,
    location: orderData.location || "",
    specialInstructions: orderData.specialInstructions || "",
    activities: orderData.activities || [],
    templateData: orderData.templateData
  };

  
  const order = await updateOrderService(orderId, sanitizedOrderData);
  
  // Send notification to admins about customer order update
  await notifyAdminCustomerOrderUpdated(orderId);
  
  // Return filtered order data for customer
  return filterOrderForCustomer(order);
};

// Get all customers (Admin)
export const getAllCustomersService = async () => {
  const customers = await prisma.customer.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          isActive: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { companyName: 'asc' },
  });

  return customers.map(customer => ({
    ...customer,
    contactEmail: customer.user?.email || customer.contactEmail,
  }));
};

// Get customer by ID (Admin)
export const getCustomerByIdService = async (customerId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          isActive: true,
        },
      },
      subAccounts: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          orders: true,
          subAccounts: true,
        },
      },
    },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  return {
    ...customer,
    contactEmail: customer.user?.email || customer.contactEmail,
  };
};
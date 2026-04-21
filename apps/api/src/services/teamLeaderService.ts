import { prisma } from "@repo/db";
import { Decimal } from "decimal.js";

interface ContainerInput {
  serialNumber: string;
  cartonQuantity: number;
  pieceQuantity: number;
  cartonPrice?: number;
  piecePrice?: number;
  [key: string]: any;
}

interface ActivityInput {
  activityId: string;
  articleBasePrice?: number;
  basePrice?: number;
  [key: string]: any;
}

/**
 * Calculates cartonPrice and piecePrice for each container using the same
 * pricing logic as the admin dashboard — customer pricing tiers for carton price,
 * and activity articleBasePrice for article price.
 */
export const calculateContainerPrices = async (
  containers: ContainerInput[],
  activities: ActivityInput[],
  customerId: string,
  scheduledDate: Date
): Promise<ContainerInput[]> => {
  if (!containers.length || !activities.length) {
    return containers.map(c => ({ ...c, cartonPrice: 0, piecePrice: 0 }));
  }

  const activityIds = activities.map(a => a.activityId).filter(Boolean);

  // Fetch all applicable pricing tiers for this customer and date
  const pricingTiers = await prisma.customerPrice.findMany({
    where: {
      customerId,
      customerActivityId: { in: activityIds },
      isActive: true,
      effectiveFrom: { lte: scheduledDate },
      OR: [
        { effectiveTo: null },
        { effectiveTo: { gte: scheduledDate } },
      ],
    },
  });

  return containers.map(container => {
    // cartonPrice: sum of the matching tier price for each activity
    const cartonPrice = activities.reduce((total, activity) => {
      const tiers = pricingTiers.filter(t => t.customerActivityId === activity.activityId);
      const applicableTier = tiers.find(
        t => container.cartonQuantity >= t.minQuantity && container.cartonQuantity <= t.maxQuantity
      );
      return total + (applicableTier ? new Decimal(applicableTier.price.toString()).toNumber() : 0);
    }, 0);

    // piecePrice: sum of articleBasePrice from all selected activities (sent from frontend)
    const piecePrice = activities.reduce((total, activity) => {
      return total + (Number(activity.articleBasePrice) || 0);
    }, 0);

    return { ...container, cartonPrice, piecePrice };
  });
};

export const getTeamLeaderDashboard = async (employeeId: string) => {
  // Get the single team led by this employee
  const team = await prisma.team.findUnique({
    where: { teamLeaderId: employeeId },
    include: {
      members: {
        where: { isActive: true },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          title: true,
          status: true,
          scheduledDate: true,
          priority: true,
        },
      },
    },
  });

  // Always get orders created by the team leader
  const whereConditions: any[] = [
    { createdBy: employeeId }, // Orders created by the team leader
  ];

  let teamMemberIds: string[] = [employeeId];
  let teamOrders: any[] = [];

  if (team) {
    teamMemberIds = team.members.map(member => member.employeeId);
    teamMemberIds.push(employeeId); // Add team leader
    teamOrders = team.orders;

    // Add team-related conditions
    whereConditions.push(
      {
        employeeAssignments: {
          some: {
            employeeId: { in: teamMemberIds },
          },
        },
      }
    );
  }

  // Get orders assigned to team members (individual assignments) or created by team leader
  const memberOrders = await prisma.order.findMany({
    where: { OR: whereConditions },
    select: {
      id: true,
      orderNumber: true,
      title: true,
      status: true,
      scheduledDate: true,
      priority: true,
      employeeAssignments: {
        where: {
          employeeId: { in: teamMemberIds },
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      },
    },
  });

  // Combine team orders and member orders
  const allOrders = [...teamOrders, ...memberOrders];

  // Remove duplicates based on order ID
  const uniqueOrders = allOrders.filter((order, index, self) => 
    index === self.findIndex(o => o.id === order.id)
  );

  // Calculate statistics
  const totalOrders = uniqueOrders.length;
  const activeOrders = uniqueOrders.filter(order => 
    ['ACTIVE', 'IN_PROGRESS'].includes(order.status)
  ).length;
  const completedOrders = uniqueOrders.filter(order => 
    order.status === 'COMPLETED'
  ).length;

  return {
    team: team ? {
      ...team,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      members: team.members.map(member => ({
        ...member,
        joinedAt: member.joinedAt.toISOString(),
        leftAt: member.leftAt?.toISOString(),
      })),
    } : null,
    orders: uniqueOrders,
    statistics: {
      totalOrders,
      activeOrders,
      completedOrders,
      totalTeamMembers: team ? teamMemberIds.length - 1 : 0, // Subtract 1 to exclude team leader from member count
    },
  };
};

export const getTeamMembersByLeader = async (employeeId: string) => {
  const teamMembers = await prisma.teamMember.findMany({
    where: {
      team: { teamLeaderId: employeeId },
      isActive: true,
    },
    select: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        }
      }
    }
  });

  // Also include the leader themselves
  const leader = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      employeeCode: true,
    }
  });
  
  const results = teamMembers.map(member => member.employee);
  if (leader && !results.some(r => r.id === leader.id)) {
    results.unshift(leader);
  }
  
  return results;
};

export const getTeamLeaderOrders = async (employeeId: string, filters?: any) => {
  // Get the single team led by this employee
  const team = await prisma.team.findUnique({
    where: { teamLeaderId: employeeId },
    select: { id: true },
  });

  // Build where clause - always include orders created by team leader
  const whereConditions: any[] = [
    { createdBy: employeeId }, // Orders created by the team leader
  ];

  // If team leader has a team, also include team-related orders
  if (team) {
    // Get team member IDs
    const teamMembers = await prisma.teamMember.findMany({
      where: { 
        teamId: team.id,
        isActive: true,
      },
      select: { employeeId: true },
    });

    const teamMemberIds = teamMembers.map(member => member.employeeId);
    teamMemberIds.push(employeeId); // Add team leader to the list

    whereConditions.push(
      { teamId: team.id }, // Orders directly assigned to the team
      {
        employeeAssignments: {
          some: {
            employeeId: { in: teamMemberIds },
          },
        },
      }
    );
  }

  const where: any = { OR: whereConditions };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.startDate && filters?.endDate) {
    where.scheduledDate = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          companyName: true,
          contactEmail: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      employeeAssignments: {
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      },
      descriptionData: true,
    },
    orderBy: { scheduledDate: 'desc' },
  });

  return orders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    scheduledDate: order.scheduledDate.toISOString(),
    startTime: order.startTime?.toISOString(),
    endTime: order.endTime?.toISOString(),
  }));
};
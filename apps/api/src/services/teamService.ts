import { prisma } from "@repo/db";
import { Team, TeamMember, CreateTeamRequest, UpdateTeamRequest } from "../types/team";

export const getAllTeams = async (): Promise<Team[]> => {
  const teams = await prisma.team.findMany({
    include: {
      teamLeader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      },
      members: {
        where: { isActive: true },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: { select: { name: true } },
              position: { select: { title: true } },
            },
          },
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return teams.map(team => ({
    ...team,
    description: team.description ?? undefined,
    teamLeaderId: team.teamLeaderId ?? undefined,
    teamLeader: team.teamLeader ? {
      ...team.teamLeader,
      firstName: team.teamLeader.firstName ?? undefined,
      lastName: team.teamLeader.lastName ?? undefined,
    } : undefined,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    members: team.members.map(member => ({
      ...member,
      employee: {
        ...member.employee,
        firstName: member.employee.firstName ?? undefined,
        lastName: member.employee.lastName ?? undefined,
        department: member.employee.department ?? undefined,
        position: member.employee.position ?? undefined,
      },
      joinedAt: member.joinedAt.toISOString(),
      leftAt: member.leftAt?.toISOString(),
    })),
  }));
};

export const getTeamById = async (id: string): Promise<Team | null> => {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      teamLeader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      },
      members: {
        where: { isActive: true },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: { select: { name: true } },
              position: { select: { title: true } },
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
        },
      },
    },
  });

  if (!team) return null;

  return {
    ...team,
    description: team.description ?? undefined,
    teamLeaderId: team.teamLeaderId ?? undefined,
    teamLeader: team.teamLeader ? {
      ...team.teamLeader,
      firstName: team.teamLeader.firstName ?? undefined,
      lastName: team.teamLeader.lastName ?? undefined,
    } : undefined,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    members: team.members.map(member => ({
      ...member,
      employee: {
        ...member.employee,
        firstName: member.employee.firstName ?? undefined,
        lastName: member.employee.lastName ?? undefined,
        department: member.employee.department ?? undefined,
        position: member.employee.position ?? undefined,
      },
      joinedAt: member.joinedAt.toISOString(),
      leftAt: member.leftAt?.toISOString(),
    })),
  };
};

export const createTeam = async (data: CreateTeamRequest): Promise<Team> => {
  // Validate team leader exists if provided
  if (data.teamLeaderId) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.teamLeaderId },
    });
    if (!employee) {
      throw new Error(`Team leader with ID ${data.teamLeaderId} not found`);
    }
    
    // Check if employee already leads a team
    const existingTeam = await prisma.team.findUnique({
      where: { teamLeaderId: data.teamLeaderId },
    });
    if (existingTeam) {
      throw new Error(`Employee already leads team: ${existingTeam.name}`);
    }
  }

  const team = await prisma.team.create({
    data,
    include: {
      teamLeader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      },
      members: {
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: { select: { name: true } },
              position: { select: { title: true } },
            },
          },
        },
      },
    },
  });

  return {
    ...team,
    description: team.description ?? undefined,
    teamLeaderId: team.teamLeaderId ?? undefined,
    teamLeader: team.teamLeader ? {
      ...team.teamLeader,
      firstName: team.teamLeader.firstName ?? undefined,
      lastName: team.teamLeader.lastName ?? undefined,
    } : undefined,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    members: team.members.map(member => ({
      ...member,
      employee: {
        ...member.employee,
        firstName: member.employee.firstName ?? undefined,
        lastName: member.employee.lastName ?? undefined,
        department: member.employee.department ?? undefined,
        position: member.employee.position ?? undefined,
      },
      joinedAt: member.joinedAt.toISOString(),
      leftAt: member.leftAt?.toISOString(),
    })),
  };
};

export const updateTeam = async (id: string, data: UpdateTeamRequest): Promise<Team | null> => {
  // Validate team leader exists if provided
  if (data.teamLeaderId) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.teamLeaderId },
    });
    if (!employee) {
      throw new Error(`Team leader with ID ${data.teamLeaderId} not found`);
    }
    
    // Check if employee already leads another team
    const existingTeam = await prisma.team.findUnique({
      where: { teamLeaderId: data.teamLeaderId },
    });
    if (existingTeam && existingTeam.id !== id) {
      throw new Error(`Employee already leads team: ${existingTeam.name}`);
    }
  }

  const team = await prisma.team.update({
    where: { id },
    data,
    include: {
      teamLeader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      },
      members: {
        where: { isActive: true },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: { select: { name: true } },
              position: { select: { title: true } },
            },
          },
        },
      },
    },
  });

  return {
    ...team,
    description: team.description ?? undefined,
    teamLeaderId: team.teamLeaderId ?? undefined,
    teamLeader: team.teamLeader ? {
      ...team.teamLeader,
      firstName: team.teamLeader.firstName ?? undefined,
      lastName: team.teamLeader.lastName ?? undefined,
    } : undefined,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    members: team.members.map(member => ({
      ...member,
      employee: {
        ...member.employee,
        firstName: member.employee.firstName ?? undefined,
        lastName: member.employee.lastName ?? undefined,
        department: member.employee.department ?? undefined,
        position: member.employee.position ?? undefined,
      },
      joinedAt: member.joinedAt.toISOString(),
      leftAt: member.leftAt?.toISOString(),
    })),
  };
};

export const deleteTeam = async (id: string): Promise<boolean> => {
  try {
    await prisma.team.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};

export const addTeamMember = async (teamId: string, employeeId: string): Promise<TeamMember> => {
  // Check if employee exists
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee) {
    throw new Error(`Employee with ID ${employeeId} not found`);
  }

  // Check if already a member
  const existingMember = await prisma.teamMember.findUnique({
    where: { teamId_employeeId: { teamId, employeeId } },
  });
  if (existingMember && existingMember.isActive) {
    throw new Error("Employee is already a member of this team");
  }

  // If previously was a member but left, reactivate
  if (existingMember && !existingMember.isActive) {
    const member = await prisma.teamMember.update({
      where: { id: existingMember.id },
      data: { isActive: true, leftAt: null, joinedAt: new Date() },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: { select: { name: true } },
            position: { select: { title: true } },
          },
        },
      },
    });
    return {
      ...member,
      employee: {
        ...member.employee,
        firstName: member.employee.firstName ?? undefined,
        lastName: member.employee.lastName ?? undefined,
        department: member.employee.department ?? undefined,
        position: member.employee.position ?? undefined,
      },
      joinedAt: member.joinedAt.toISOString(),
      leftAt: member.leftAt?.toISOString(),
    };
  }

  const member = await prisma.teamMember.create({
    data: { teamId, employeeId },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
          department: { select: { name: true } },
          position: { select: { title: true } },
        },
      },
    },
  });

  return {
    ...member,
    employee: {
      ...member.employee,
      firstName: member.employee.firstName ?? undefined,
      lastName: member.employee.lastName ?? undefined,
      department: member.employee.department ?? undefined,
      position: member.employee.position ?? undefined,
    },
    joinedAt: member.joinedAt.toISOString(),
    leftAt: member.leftAt?.toISOString(),
  };
};

export const removeTeamMember = async (teamId: string, employeeId: string): Promise<boolean> => {
  try {
    await prisma.teamMember.updateMany({
      where: { teamId, employeeId, isActive: true },
      data: { isActive: false, leftAt: new Date() },
    });
    return true;
  } catch {
    return false;
  }
};

export const getTeamByLeader = async (leaderId: string): Promise<Team | null> => {
  const team = await prisma.team.findUnique({
    where: { teamLeaderId: leaderId },
    include: {
      teamLeader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      },
      members: {
        where: { isActive: true },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: { select: { name: true } },
              position: { select: { title: true } },
            },
          },
        },
      },
    },
  });

  if (!team) return null;

  return {
    ...team,
    description: team.description ?? undefined,
    teamLeaderId: team.teamLeaderId ?? undefined,
    teamLeader: team.teamLeader ? {
      ...team.teamLeader,
      firstName: team.teamLeader.firstName ?? undefined,
      lastName: team.teamLeader.lastName ?? undefined,
    } : undefined,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    members: team.members.map(member => ({
      ...member,
      employee: {
        ...member.employee,
        firstName: member.employee.firstName ?? undefined,
        lastName: member.employee.lastName ?? undefined,
        department: member.employee.department ?? undefined,
        position: member.employee.position ?? undefined,
      },
      joinedAt: member.joinedAt.toISOString(),
      leftAt: member.leftAt?.toISOString(),
    })),
  };
};

export const getEmployeeByUserId = async (userId: string) => {
  return await prisma.employee.findUnique({
    where: { userId },
    select: { id: true, firstName: true, lastName: true, employeeCode: true },
  });
};

export const getAvailableEmployeesForTeam = async (teamId: string, teamLeaderId?: string) => {
  // Get employees who are already members of this team
  const existingMembers = await prisma.teamMember.findMany({
    where: {
      teamId,
      isActive: true,
    },
    select: { employeeId: true },
  });

  const existingMemberIds = existingMembers.map(member => member.employeeId);

  // Get team leader ID for this team
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { teamLeaderId: true },
  });

  const excludeIds = [...existingMemberIds];
  if (team?.teamLeaderId) {
    excludeIds.push(team.teamLeaderId);
  }

  // Return only employees who are not blocked and not already in the team
  const employees = await prisma.employee.findMany({
    where: {
      blockedAt: null,
      id: { notIn: excludeIds },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      employeeCode: true,
      department: { select: { name: true } },
      position: { select: { title: true } },
    },
    orderBy: {
      employeeCode: 'asc',
    },
  });

  return employees;
};
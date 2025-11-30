export interface Team {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  teamLeaderId?: string;
  teamLeader?: {
    id: string;
    firstName?: string;
    lastName?: string;
    employeeCode: string;
  };
  members?: TeamMember[];
  orders?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  employeeId: string;
  employee: {
    id: string;
    firstName?: string;
    lastName?: string;
    employeeCode: string;
    department?: {
      name: string;
    };
    position?: {
      title: string;
    };
  };
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  teamLeaderId?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  teamLeaderId?: string;
  isActive?: boolean;
}

export interface AddTeamMemberRequest {
  employeeId: string;
}
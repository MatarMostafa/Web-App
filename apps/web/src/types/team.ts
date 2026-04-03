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
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  employeeId: string;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  employee: {
    id: string;
    firstName?: string;
    lastName?: string;
    employeeCode: string;
    department?: { name: string };
    position?: { title: string };
  };
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  teamLeaderId?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  teamLeaderId?: string | null;
}

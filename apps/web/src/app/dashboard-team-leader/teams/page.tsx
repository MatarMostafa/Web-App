"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Badge } from "@/components/ui";
import { Avatar, AvatarFallback } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";

interface TeamMember {
  employee: {
    id: string;
    firstName?: string;
    lastName?: string;
    employeeCode: string;
    department?: { name: string };
    position?: { title: string };
  };
  joinedAt: string;
  isActive: boolean;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
}

const TeamLeaderTeams = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-leader/dashboard`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setTeam(data.team);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchTeams();
    }
  }, [session]);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('teamLeader.teams.title')}</h1>
        <p className="text-gray-600 mt-2">{t('teamLeader.teams.subtitle')}</p>
      </div>

      {!team ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">{t('teamLeader.teams.noTeamsAssigned')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{team.name}</h2>
                {team.description && (
                  <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                )}
              </div>
              <Badge variant="outline">
                {team.members?.length || 0} {t('teamLeader.teams.members')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('teamLeader.teams.employee')}</TableHead>
                    <TableHead>{t('teamLeader.teams.employeeCode')}</TableHead>
                    <TableHead>{t('teamLeader.teams.department')}</TableHead>
                    <TableHead>{t('teamLeader.teams.position')}</TableHead>
                    <TableHead>{t('teamLeader.teams.joinedDate')}</TableHead>
                    <TableHead>{t('teamLeader.teams.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!team.members || team.members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {t('teamLeader.teams.noTeamMembers')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    team.members.map((member) => (
                      <TableRow key={member.employee.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(member.employee.firstName, member.employee.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {member.employee.firstName || ""} {member.employee.lastName || ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">
                            {member.employee.employeeCode}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {member.employee.department?.name || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {member.employee.position?.title || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={member.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {member.isActive ? t('teamLeader.teams.active') : t('teamLeader.teams.inactive')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamLeaderTeams;
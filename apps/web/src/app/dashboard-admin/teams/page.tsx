"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Plus, Users, Edit, Trash2, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import AddMemberDialog from "@/components/admin/AddMemberDialog";
import EditTeamDialog from "@/components/admin/EditTeamDialog";
import CreateTeamDialog from "@/components/admin/CreateTeamDialog";
import { useTranslation } from '@/hooks/useTranslation';

interface Team {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  teamLeaderId?: string;
  teamLeader?: {
    firstName?: string;
    lastName?: string;
    employeeCode: string;
  };
  members?: Array<{
    employee: {
      firstName?: string;
      lastName?: string;
      employeeCode: string;
      department?: { name: string };
      position?: { title: string };
    };
  }>;
}

const AdminTeams = () => {
  const { t } = useTranslation();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [addMemberTeam, setAddMemberTeam] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    fetchTeams();
  }, [session]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm(t('teams.confirmDelete'))) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/${teamId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        setTeams(teams.filter(team => team.id !== teamId));
      }
    } catch (error) {
      console.error("Error deleting team:", error);
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('teams.title')}</h1>
          <p className="text-gray-600 mt-2">{t('teams.subtitle')}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('teams.createTeam')}
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('teams.noTeamsFound')}</p>
            <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
              {t('teams.createFirstTeam')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {team.name}
                      {!team.isActive && (
                        <Badge variant="secondary">{t('teams.inactive')}</Badge>
                      )}
                    </CardTitle>
                    {team.description && (
                      <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAddMemberTeam(team)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t('teams.addMember')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingTeam(team)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('common.edit')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">{t('teams.teamLeader')}</p>
                    {team.teamLeader ? (
                      <p className="text-sm">
                        {team.teamLeader.firstName && team.teamLeader.lastName
                          ? `${team.teamLeader.firstName} ${team.teamLeader.lastName}`
                          : team.teamLeader.employeeCode}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">{t('teams.noTeamLeaderAssigned')}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">{t('teams.members')}</p>
                    <p className="text-sm">{team.members?.length || 0} {t('teams.members').toLowerCase()}</p>
                  </div>
                </div>
                
                {team.members && team.members.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">{t('teams.teamMembers')}</p>
                    <div className="flex flex-wrap gap-2">
                      {team.members.slice(0, 5).map((member, index) => (
                        <Badge key={index} variant="outline">
                          {member.employee.firstName && member.employee.lastName
                            ? `${member.employee.firstName} ${member.employee.lastName}`
                            : member.employee.employeeCode}
                        </Badge>
                      ))}
                      {team.members.length > 5 && (
                        <Badge variant="outline">
                          +{team.members.length - 5} {t('teams.more')}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {addMemberTeam && (
        <AddMemberDialog
          teamId={addMemberTeam.id}
          teamName={addMemberTeam.name}
          open={!!addMemberTeam}
          onOpenChange={(open) => !open && setAddMemberTeam(null)}
          onMemberAdded={() => {
            fetchTeams();
            setAddMemberTeam(null);
          }}
        />
      )}
      
      {editingTeam && (
        <EditTeamDialog
          team={editingTeam}
          open={!!editingTeam}
          onOpenChange={(open) => !open && setEditingTeam(null)}
          onTeamUpdated={() => {
            fetchTeams();
            setEditingTeam(null);
          }}
        />
      )}
      
      <CreateTeamDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTeamCreated={() => {
          fetchTeams();
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
};

export default AdminTeams;
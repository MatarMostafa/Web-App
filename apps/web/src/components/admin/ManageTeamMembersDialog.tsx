"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { UserMinus, Loader2, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import AddMemberDialog from "@/components/admin/AddMemberDialog";
import { useTranslation } from '@/hooks/useTranslation';

interface TeamMember {
  employeeId: string;
  employee: {
    id: string;
    firstName?: string;
    lastName?: string;
    employeeCode: string;
    department?: { name: string };
    position?: { title: string };
  };
}

interface ManageTeamMembersDialogProps {
  teamId: string;
  teamName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberRemoved: () => void;
  onMemberAdded: () => void;
}

const ManageTeamMembersDialog: React.FC<ManageTeamMembersDialogProps> = ({
  teamId,
  teamName,
  open,
  onOpenChange,
  onMemberRemoved,
  onMemberAdded,
}) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
    }
  }, [open, teamId]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error(t('teams.loadMembersError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (employeeId: string) => {
    if (!confirm(t('teams.confirmRemoveMember'))) {
      return;
    }

    setRemovingId(employeeId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${teamId}/members/${employeeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success(t('teams.memberRemovedSuccess'));
        setMembers(members.filter((m) => m.employeeId !== employeeId));
        onMemberRemoved();
      } else {
        toast.error(t('teams.memberRemoveError'));
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error(t('teams.memberRemoveError'));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl pr-10">{t('teams.manageTeamMembers')} - {teamName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-end mb-4">
          <Button
            size="sm"
            onClick={() => setShowAddMember(true)}
          >
            <UserPlus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t('teams.addMember')}</span>
            <span className="sm:hidden">{t('teams.add')}</span>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('teams.noMembersFound')}
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.employeeId}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-3 sm:gap-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base truncate">
                    {member.employee.firstName && member.employee.lastName
                      ? `${member.employee.firstName} ${member.employee.lastName}`
                      : member.employee.employeeCode}
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                    {member.employee.department && (
                      <Badge variant="outline" className="text-xs">
                        {member.employee.department.name}
                      </Badge>
                    )}
                    {member.employee.position && (
                      <Badge variant="outline" className="text-xs">
                        {member.employee.position.title}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveMember(member.employeeId)}
                  disabled={removingId === member.employeeId}
                  className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                >
                  {removingId === member.employeeId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserMinus className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">{t('teams.remove')}</span>
                      <span className="sm:hidden">{t('teams.remove')}</span>
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
      
      <AddMemberDialog
        teamId={teamId}
        teamName={teamName}
        open={showAddMember}
        onOpenChange={setShowAddMember}
        onMemberAdded={() => {
          fetchTeamMembers();
          onMemberAdded();
          setShowAddMember(false);
        }}
      />
    </Dialog>
  );
};

export default ManageTeamMembersDialog;

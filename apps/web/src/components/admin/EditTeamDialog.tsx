"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Textarea } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Checkbox } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useTranslation } from '@/hooks/useTranslation';

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  employeeCode: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  teamLeaderId?: string;
}

interface EditTeamDialogProps {
  team: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamUpdated: () => void;
}

const EditTeamDialog: React.FC<EditTeamDialogProps> = ({
  team,
  open,
  onOpenChange,
  onTeamUpdated,
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    teamLeaderId: "",
  });

  useEffect(() => {
    if (open && team) {
      setFormData({
        name: team.name,
        description: team.description || "",
        isActive: team.isActive,
        teamLeaderId: team.teamLeaderId || "none",
      });
      fetchEmployees();
    }
  }, [open, team]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t('teams.form.teamNameRequired'));
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/${team.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          isActive: formData.isActive,
          teamLeaderId: formData.teamLeaderId === "none" ? null : formData.teamLeaderId || null,
        }),
      });

      if (response.ok) {
        toast.success(t('teams.messages.teamUpdatedSuccess'));
        onTeamUpdated();
        onOpenChange(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || t('teams.messages.updateTeamError'));
      }
    } catch (error) {
      toast.error(t('teams.messages.updateTeamError'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('teams.editTeam')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('teams.form.teamName')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={t('teams.form.enterTeamName')}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">{t('teams.form.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t('teams.form.enterDescription')}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="teamLeader">{t('teams.form.teamLeader')}</Label>
            <Select 
              value={formData.teamLeaderId} 
              onValueChange={(value) => handleInputChange("teamLeaderId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('teams.form.selectTeamLeader')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('teams.form.noTeamLeader')}</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName && employee.lastName
                      ? `${employee.firstName} ${employee.lastName}`
                      : employee.employeeCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", !!checked)}
            />
            <Label htmlFor="isActive">{t('teams.form.activeTeam')}</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('teams.form.updating') : t('teams.form.update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamDialog;
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Label } from "@/components/ui";
import { Checkbox } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  employeeCode: string;
  department?: { name: string };
  position?: { title: string };
}

interface AddMemberDialogProps {
  teamId: string;
  teamName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberAdded: () => void;
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  teamId,
  teamName,
  open,
  onOpenChange,
  onMemberAdded,
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchAvailableEmployees();
    }
  }, [open, teamId]);

  const fetchAvailableEmployees = async () => {
    setFetchingEmployees(true);
    try {
      console.log('Fetching available employees for team:', teamId);
      // First try the specific endpoint
      let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/${teamId}/available-employees`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      
      console.log('Response status:', response.status);
      
      // If endpoint doesn't exist, fallback to all employees
      if (response.status === 404) {
        console.log('Endpoint not found, falling back to all employees');
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Available employees:', data);
        setEmployees(data);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
      }
    } catch (error) {
      console.error("Error fetching available employees:", error);
    } finally {
      setFetchingEmployees(false);
    }
  };

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployeeIds(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployeeIds(prev => prev.filter(id => id !== employeeId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEmployeeIds.length === 0) {
      toast.error(t('teams.addMemberDialog.selectAtLeastOne'));
      return;
    }
    
    setLoading(true);

    try {
      const promises = selectedEmployeeIds.map(employeeId => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/${teamId}/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ employeeId }),
        })
      );

      const responses = await Promise.all(promises);
      const failedCount = responses.filter(r => !r.ok).length;
      
      if (failedCount === 0) {
        toast.success(t('teams.addMemberDialog.membersAddedSuccess', { count: selectedEmployeeIds.length }));
      } else {
        toast.error(t('teams.addMemberDialog.membersAddedError', { count: failedCount }));
      }
      
      onMemberAdded();
      onOpenChange(false);
      setSelectedEmployeeIds([]);
    } catch (error) {
      toast.error(t('teams.addMemberDialog.errorAddingMembers'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{t('teams.addMemberDialog.title').replace('{teamName}', teamName)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
          <div className="flex-1 min-h-0">
            <Label>{t('teams.addMemberDialog.selectEmployees')}</Label>
            <div className="text-sm text-muted-foreground mb-3">
              {t('teams.addMemberDialog.employeesSelected').replace('{count}', selectedEmployeeIds.length.toString())}
            </div>
            <div className="h-[50vh] min-h-[300px] overflow-y-auto border rounded-md">
              <div className="p-3 space-y-3">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded-md">
                    <Checkbox
                      id={`employee-${employee.id}`}
                      checked={selectedEmployeeIds.includes(employee.id)}
                      onCheckedChange={(checked) =>
                        handleEmployeeToggle(employee.id, !!checked)
                      }
                      className="mt-1"
                    />
                    <Label
                      htmlFor={`employee-${employee.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {employee.firstName && employee.lastName
                            ? `${employee.firstName} ${employee.lastName}`
                            : employee.employeeCode}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {employee.department?.name} • {employee.position?.title}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
                {fetchingEmployees && (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
                {!fetchingEmployees && employees.length === 0 && (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-sm text-muted-foreground">
                      {t('teams.addMemberDialog.noAvailableEmployees')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={loading || selectedEmployeeIds.length === 0}
              className="w-full sm:w-auto"
            >
              {loading ? t('teams.addMemberDialog.adding') : 
                selectedEmployeeIds.length === 1 ? 
                  t('teams.addMemberDialog.addMembers') : 
                  t('teams.addMemberDialog.addMembersPlural', { count: selectedEmployeeIds.length || 0 })}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
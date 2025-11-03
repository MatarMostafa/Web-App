"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Search, Plus, Users } from "lucide-react";
import EmployeeTableView from "@/components/admin/EmployeeTableView";
import AddEmployeeDialog from "@/components/admin/AddEmployeeDialog";
import EditEmployeeDialog from "@/components/admin/EditEmployeeDialog";
import { useEmployeeStore } from "@/store/employeeStore";
import { useEmployeeBlockStore } from "@/store/employeeBlockStore";
import { Employee } from "@/types/employee";
import BlockEmployeeModal from "@/components/modals/BlockEmployeeModal";
import { useTranslation } from '@/hooks/useTranslation';

const EmployeesPage = () => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const { employees, loading, fetchEmployees, deleteEmployee } =
    useEmployeeStore();
  const { blockEmployee, unblockEmployee, loading: blockLoading } = useEmployeeBlockStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [blockModalState, setBlockModalState] = useState<{
    isOpen: boolean;
    action: "block" | "unblock";
    employee: Employee | null;
  }>({ isOpen: false, action: "block", employee: null });

  useEffect(() => {
    setMounted(true);
    fetchEmployees();
  }, [fetchEmployees]);

  if (!mounted) {
    return null;
  }

  const filteredEmployees = employees.filter(
    (employee) =>
      `${employee.firstName} ${employee.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      employee.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.phoneNumber && employee.phoneNumber.includes(searchQuery))
  );

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('admin.employees.confirmDelete'))) {
      await deleteEmployee(id);
    }
  };

  const handleBlock = (employee: Employee) => {
    setBlockModalState({
      isOpen: true,
      action: "block",
      employee,
    });
  };

  const handleUnblock = (employee: Employee) => {
    setBlockModalState({
      isOpen: true,
      action: "unblock",
      employee,
    });
  };

  const handleBlockConfirm = async (reason?: string) => {
    if (!blockModalState.employee) return;
    
    try {
      if (blockModalState.action === "block") {
        await blockEmployee(blockModalState.employee.userId!, reason!);
      } else {
        await unblockEmployee(blockModalState.employee.userId!);
      }
      await fetchEmployees(); // Refresh the list
      setBlockModalState({ isOpen: false, action: "block", employee: null });
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleBlockModalClose = () => {
    setBlockModalState({ isOpen: false, action: "block", employee: null });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">{t('admin.employees.title')}</h1>
          <p className="text-muted-foreground">
            {t('admin.employees.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <AddEmployeeDialog
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> {t('admin.employees.addEmployee')}
              </Button>
            }
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('admin.employees.searchPlaceholder')}
            className="pl-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <EmployeeTableView
        employees={filteredEmployees}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
      />

      {editingEmployee && (
        <EditEmployeeDialog
          employee={editingEmployee}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditingEmployee(null);
          }}
        />
      )}

      <BlockEmployeeModal
        isOpen={blockModalState.isOpen}
        onClose={handleBlockModalClose}
        onConfirm={handleBlockConfirm}
        action={blockModalState.action}
        employeeName={blockModalState.employee ? `${blockModalState.employee.firstName} ${blockModalState.employee.lastName}` : ""}
        loading={blockLoading}
      />

      {!loading && employees.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-12 border rounded-lg">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">{t('admin.employees.noEmployeesFound')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('admin.employees.getStartedMessage')}
          </p>
          <AddEmployeeDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" /> {t('admin.employees.addEmployee')}
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;

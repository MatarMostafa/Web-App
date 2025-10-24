"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Search, Plus, Building } from "lucide-react";
import DepartmentTableView from "@/components/admin/DepartmentTableView";
import AddDepartmentDialog from "@/components/admin/AddDepartmentDialog";
import EditDepartmentDialog from "@/components/admin/EditDepartmentDialog";
import { useDepartmentStore } from "@/store/departmentStore";
import { Department } from "@/types/department";

const DepartmentsPage = () => {
  const { departments, loading, fetchDepartments, deleteDepartment } = useDepartmentStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const filteredDepartments = departments.filter(
    (department) =>
      department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      department.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (department.description && department.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      await deleteDepartment(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Departments</h1>
          <p className="text-muted-foreground">
            Manage your organization's departments
          </p>
        </div>
        <div className="flex gap-2">
          <AddDepartmentDialog
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Add Department
              </Button>
            }
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search departments by name, code, or description..."
            className="pl-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DepartmentTableView
        departments={filteredDepartments}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {editingDepartment && (
        <EditDepartmentDialog
          department={editingDepartment}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditingDepartment(null);
          }}
        />
      )}

      {!loading && departments.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-12 border rounded-lg">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No departments found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first department
          </p>
          <AddDepartmentDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Department
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
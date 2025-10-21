"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import { Search, Plus, Users } from "lucide-react";
import EmployeeTableView from "@/components/admin/EmployeeTableView";
import AddEmployeeDialog from "@/components/admin/AddEmployeeDialog";
import { useEmployeeStore } from "@/store/employeeStore";
import { Employee } from "@/types/employee";


const EmployeesPage = () => {
  const { employees, loading, fetchEmployees, deleteEmployee } =
    useEmployeeStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter(
    (employee) =>
      `${employee.firstName} ${employee.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      employee.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.phoneNumber && employee.phoneNumber.includes(searchQuery))
  );

  const handleEdit = (employee: Employee) => {
    // TODO: Implement edit functionality
    console.log("Edit employee:", employee);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      await deleteEmployee(id);
    }
  };

  return (
    <div className="p-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Employees</h1>
          <p className="text-muted-foreground">
            Manage your organization's employees
          </p>
        </div>
        <AddEmployeeDialog
          trigger={
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Add Employee
            </Button>
          }
        />
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search employees by name, code, or phone..."
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
      />

      {!loading && employees.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-12 border rounded-lg">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No employees found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first employee
          </p>
          <AddEmployeeDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Employee
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;

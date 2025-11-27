"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, User, Mail, Phone } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  employeeCode: string;
  phoneNumber?: string;
  email?: string;
  departmentName?: string;
  positionTitle?: string;
  department?: {
    name: string;
  };
  position?: {
    title: string;
  };
  user?: {
    email: string;
  };
}

interface AssignEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currentAssignments: string[];
  onAssignmentComplete: () => void;
  maxEmployees?: number;
}

export const AssignEmployeeModal: React.FC<AssignEmployeeModalProps> = ({
  isOpen,
  onClose,
  orderId,
  currentAssignments,
  onAssignmentComplete,
  maxEmployees,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      setSelectedEmployees([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = employees.filter((employee) => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase();
      const code = employee.employeeCode.toLowerCase();
      const department = (employee.department?.name || employee.departmentName || "").toLowerCase();
      const position = (employee.position?.title || employee.positionTitle || "").toLowerCase();
      
      return (
        fullName.includes(searchLower) ||
        code.includes(searchLower) ||
        department.includes(searchLower) ||
        position.includes(searchLower)
      );
    });
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<Employee[]>("/api/employees");
      const availableEmployees = response.filter(
        (emp) => !currentAssignments.includes(emp.id)
      );
      setEmployees(availableEmployees);
      setFilteredEmployees(availableEmployees);
    } catch (error) {
      console.error("Failed to load employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      }
      
      return [...prev, employeeId];
    });
  };

  const handleAssign = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    setAssigning(true);
    try {
      const assignments = await Promise.all(
        selectedEmployees.map((employeeId) =>
          apiClient.post(`/api/orders/${orderId}/assignments`, {
            employeeId,
          })
        )
      );

      toast.success(`Successfully assigned ${selectedEmployees.length} employee(s)`);
      onAssignmentComplete();
      onClose();
    } catch (error) {
      console.error("Failed to assign employees:", error);
      toast.error("Failed to assign employees");
    } finally {
      setAssigning(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName || lastName) {
      const first = firstName?.charAt(0) || '';
      const last = lastName?.charAt(0) || '';
      return `${first}${last}`.toUpperCase();
    }
    return username?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Employees</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected count info */}
          <div className="text-sm text-muted-foreground">
            {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
          </div>

          {/* Employee list */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {searchTerm ? "No employees found matching your search" : "No available employees"}
                </p>
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    selectedEmployees.includes(employee.id)
                      ? "border-primary bg-primary/5"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                  onClick={() => handleEmployeeToggle(employee.id)}
                >
                  <Checkbox
                    checked={selectedEmployees.includes(employee.id)}
                    onCheckedChange={() => handleEmployeeToggle(employee.id)}
                  />
                  
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {getInitials(employee.firstName, employee.lastName, employee.user?.email?.split('@')[0])}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">
                        {employee.firstName || employee.lastName ? 
                          `${employee.firstName || ''} ${employee.lastName || ''}`.trim() : 
                          employee.user?.email?.split('@')[0] || 'No Name'
                        }
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {employee.employeeCode}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      {(employee.position?.title || employee.positionTitle) && (
                        <p>{employee.position?.title || employee.positionTitle}</p>
                      )}
                      
                      {(employee.department?.name || employee.departmentName) && (
                        <p>{employee.department?.name || employee.departmentName}</p>
                      )}
                      
                      <div className="flex items-center gap-4">
                        {(employee.user?.email || employee.email) && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{employee.user?.email || employee.email}</span>
                          </div>
                        )}
                        
                        {employee.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{employee.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={assigning}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={selectedEmployees.length === 0 || assigning}
            >
              {assigning ? "Assigning..." : `Assign ${selectedEmployees.length || ""} Employee${selectedEmployees.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
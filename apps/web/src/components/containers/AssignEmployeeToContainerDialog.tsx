import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

interface Container {
  id: string;
  serialNumber: string;
  employeeAssignments: Array<{
    id: string;
    role?: string;
    employee: Employee;
  }>;
}

interface AssignEmployeeToContainerDialogProps {
  container: Container;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignEmployeeToContainerDialog: React.FC<AssignEmployeeToContainerDialogProps> = ({
  container,
  onClose,
  onSuccess
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter out already assigned employees
        const assignedEmployeeIds = container.employeeAssignments.map(a => a.employee.id);
        const availableEmployees = data.filter((emp: Employee) => 
          !assignedEmployeeIds.includes(emp.id)
        );
        setEmployees(availableEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive'
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAssignEmployee = async () => {
    if (!selectedEmployeeId) {
      toast({
        title: 'Error',
        description: 'Please select an employee',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/containers/${container.id}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          role: role || undefined
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Employee assigned successfully'
        });
        setSelectedEmployeeId('');
        setRole('');
        fetchEmployees(); // Refresh available employees
        onSuccess();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign employee');
      }
    } catch (error) {
      console.error('Error assigning employee:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign employee',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/containers/${container.id}/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Employee removed successfully'
        });
        fetchEmployees(); // Refresh available employees
        onSuccess();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove employee');
      }
    } catch (error) {
      console.error('Error removing employee:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove employee',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Container Employees</DialogTitle>
          <p className="text-sm text-gray-600">Container: {container.serialNumber}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Assignments */}
          <div>
            <h4 className="font-medium mb-2">Currently Assigned</h4>
            {container.employeeAssignments.length === 0 ? (
              <p className="text-sm text-gray-500">No employees assigned</p>
            ) : (
              <div className="space-y-2">
                {container.employeeAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <Badge variant="secondary">
                        {assignment.employee.firstName} {assignment.employee.lastName}
                      </Badge>
                      {assignment.role && (
                        <span className="ml-2 text-sm text-gray-600">({assignment.role})</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveEmployee(assignment.employee.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Assignment */}
          <div className="space-y-4">
            <h4 className="font-medium">Assign New Employee</h4>
            
            <div>
              <Label htmlFor="employee">Employee</Label>
              {loadingEmployees ? (
                <p className="text-sm text-gray-500">Loading employees...</p>
              ) : (
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} ({employee.employeeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="role">Role (Optional)</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Lead, Assistant"
              />
            </div>

            <Button 
              onClick={handleAssignEmployee} 
              disabled={loading || !selectedEmployeeId}
              className="w-full"
            >
              {loading ? 'Assigning...' : 'Assign Employee'}
            </Button>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
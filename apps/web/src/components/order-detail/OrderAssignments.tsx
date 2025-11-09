"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  UserPlus,
  UserMinus,
  Clock
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";
import { AssignEmployeeModal } from "./AssignEmployeeModal";

interface Assignment {
  id: string;
  employeeId: string;
  assignedDate: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    employeeCode: string;
    department?: {
      name: string;
    };
    position?: {
      title: string;
    };
    user?: {
      email: string;
    };
  };
}

interface OrderAssignmentsProps {
  orderId: string;
  order: any;
  userRole: "ADMIN" | "EMPLOYEE";
}

export const OrderAssignments: React.FC<OrderAssignmentsProps> = ({
  orderId,
  order,
  userRole,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    const loadAssignments = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<any>(`/api/orders/${orderId}/assignments`);
        console.log('Assignments API response:', response);
        if (response && typeof response === 'object' && 'success' in response && response.success) {
          setAssignments(response.data || []);
        } else if (Array.isArray(response)) {
          // Handle case where response is directly an array
          setAssignments(response);
        } else {
          setAssignments([]);
        }
      } catch (error) {
        console.error("Failed to load assignments:", error);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [orderId]);

  const handleRemoveAssignment = async (assignmentId: string) => {
    setActionLoading(true);
    try {
      const response = await apiClient.delete<any>(`/api/orders/assignments/${assignmentId}`);
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        // Reload assignments
        const updatedResponse = await apiClient.get<any>(`/api/orders/${orderId}/assignments`);
        if (updatedResponse && typeof updatedResponse === 'object' && 'success' in updatedResponse && updatedResponse.success) {
          setAssignments(updatedResponse.data || []);
        }
        toast.success('Staff member removed successfully');
      }
    } catch (error) {
      console.error("Failed to remove assignment:", error);
      toast.error('Failed to remove staff member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignStaff = () => {
    const requiredStaff = order?.requiredEmployees || 0;
    const currentStaff = assignments.length;
    
    if (currentStaff >= requiredStaff) {
      toast.error(`Cannot assign more staff. This order requires ${requiredStaff} staff and already has ${currentStaff} assigned. Please remove a staff member first.`);
      return;
    }
    
    setShowAssignModal(true);
  };

  const handleAssignmentComplete = async () => {
    // Reload assignments after successful assignment
    try {
      const response = await apiClient.get<any>(`/api/orders/${orderId}/assignments`);
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        setAssignments(response.data || []);
      } else if (Array.isArray(response)) {
        setAssignments(response);
      }
    } catch (error) {
      console.error("Failed to reload assignments:", error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assigned Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assigned Staff</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {assignments.length} of {order?.requiredEmployees || 0} required staff assigned
              {assignments.length < (order?.requiredEmployees || 0) && (
                <span className="text-orange-600 ml-1">
                  ({(order?.requiredEmployees || 0) - assignments.length} more needed)
                </span>
              )}
            </p>
          </div>
          {userRole === "ADMIN" && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleAssignStaff}
              disabled={actionLoading}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No staff assigned yet</p>
            {userRole === "ADMIN" && (
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-4"
                onClick={handleAssignStaff}
                disabled={actionLoading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Staff
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {getInitials(assignment.employee.firstName, assignment.employee.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">
                      {assignment.employee.firstName} {assignment.employee.lastName}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {assignment.employee.employeeCode}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {assignment.employee.position && (
                      <p>{assignment.employee.position.title}</p>
                    )}
                    
                    {assignment.employee.department && (
                      <p>{assignment.employee.department.name}</p>
                    )}
                    
                    {assignment.employee.user?.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{assignment.employee.user.email}</span>
                      </div>
                    )}
                    
                    {assignment.employee.phoneNumber && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{assignment.employee.phoneNumber}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Assigned {new Date(assignment.assignedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {userRole === "ADMIN" && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveAssignment(assignment.id)}
                    disabled={actionLoading}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <AssignEmployeeModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        orderId={orderId}
        currentAssignments={assignments.map(a => a.employeeId)}
        onAssignmentComplete={handleAssignmentComplete}
        maxEmployees={order?.requiredEmployees || 0}
      />
    </Card>
  );
};
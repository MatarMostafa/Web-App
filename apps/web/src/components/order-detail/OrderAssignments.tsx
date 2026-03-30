"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
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
  Clock,
  Play,
  Pause,
  Square,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";
import { AssignEmployeeModal } from "./AssignEmployeeModal";
import { TeamStartModal } from "../modals/TeamStartModal";
import { useOrderStore } from "@/store/orderStore";
import { AssignmentStatus } from "@/types/order";

interface Assignment {
  id: string;
  employeeId: string;
  assignedDate: string;
  startDate?: string;
  endDate?: string;
  status: AssignmentStatus;
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
  userRole: "ADMIN" | "EMPLOYEE" | "TEAM_LEADER";
  onAssignmentCountChange?: (count: number) => void;
  onRefresh?: () => void;
}

const AssignmentRow: React.FC<{
  assignment: Assignment;
  userRole: string;
  t: any;
  actionLoading: boolean;
  storeLoading: boolean;
  handleIndividualStart: (id: string) => void;
  handlePauseWork: (id: string) => void;
  handleStopWork: (id: string) => void;
  handleRemoveAssignment: (id: string) => void;
  getStatusBadge: (status: AssignmentStatus) => React.ReactNode;
  getInitials: (f?: string, l?: string, u?: string) => string;
}> = ({
  assignment,
  userRole,
  t,
  actionLoading,
  storeLoading,
  handleIndividualStart,
  handlePauseWork,
  handleStopWork,
  handleRemoveAssignment,
  getStatusBadge,
  getInitials,
}) => (
  <div className="flex items-start justify-between gap-3 p-3 border rounded-lg hover:bg-accent/5 transition-colors">
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <Avatar className="w-10 h-10 border">
        <AvatarFallback className="bg-muted text-xs">
          {getInitials(assignment.employee.firstName, assignment.employee.lastName, assignment.employee.user?.email?.split('@')[0])}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm truncate">
            {assignment.employee.firstName || assignment.employee.lastName ? 
              `${assignment.employee.firstName || ''} ${assignment.employee.lastName || ''}`.trim() : 
              assignment.employee.user?.email?.split('@')[0] || 'No Name'
            }
          </h4>
          {userRole === "ADMIN" && (
            <Badge variant="outline" className="text-[10px] h-4">
              {assignment.employee.employeeCode}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1 text-[11px] text-muted-foreground">
          {userRole === "ADMIN" && assignment.employee.position && (
            <p className="truncate">{assignment.employee.position.title}</p>
          )}
          
          <div className="flex items-center gap-3">
            {userRole === "ADMIN" && assignment.employee.user?.email && (
              <div className="flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{assignment.employee.user.email}</span>
              </div>
            )}
            
            {userRole === "ADMIN" && assignment.employee.phoneNumber && (
              <div className="flex items-center gap-1 truncate">
                <Phone className="h-3 w-3 shrink-0" />
                <span className="truncate">{assignment.employee.phoneNumber}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              {t("order.assigned")} {new Date(assignment.assignedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div className="flex flex-col items-end gap-2 shrink-0">
      <div className="flex items-center gap-1">
        {getStatusBadge(assignment.status)}
      </div>
      
      <div className="flex justify-end gap-1">
        {(userRole === "ADMIN" || userRole === "TEAM_LEADER") && assignment.status === AssignmentStatus.ASSIGNED && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => handleIndividualStart(assignment.employeeId)}
            disabled={actionLoading || storeLoading}
            title={t("order.startWork")}
          >
            <Play className="h-4 w-4" />
          </Button>
        )}
        
        {(userRole === "ADMIN" || userRole === "TEAM_LEADER") && assignment.status === AssignmentStatus.ACTIVE && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
            onClick={() => handlePauseWork(assignment.employeeId)}
            disabled={actionLoading || storeLoading}
            title={t("order.pause")}
          >
            <Pause className="h-4 w-4" />
          </Button>
        )}
        
        {(userRole === "ADMIN" || userRole === "TEAM_LEADER") && (assignment.status === AssignmentStatus.ACTIVE || assignment.status === 'PAUSED') && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={() => handleStopWork(assignment.employeeId)}
            disabled={actionLoading || storeLoading}
            title={t("order.complete")}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}

        {(userRole === "ADMIN" || userRole === "TEAM_LEADER") && assignment.status === 'PAUSED' && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => handleIndividualStart(assignment.employeeId)}
            disabled={actionLoading || storeLoading}
            title={t("order.resume")}
          >
            <Play className="h-4 w-4" />
          </Button>
        )}

        {assignment.status === AssignmentStatus.COMPLETED && (
          <div className="h-8 w-8 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        )}

        {(userRole === "ADMIN" || userRole === "TEAM_LEADER") && assignment.status === AssignmentStatus.ASSIGNED && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
            onClick={() => handleRemoveAssignment(assignment.id)}
            disabled={actionLoading}
            title={t("common.remove")}
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  </div>
);

export const OrderAssignments: React.FC<OrderAssignmentsProps> = ({
  orderId,
  order,
  userRole,
  onAssignmentCountChange,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTeamStartModal, setShowTeamStartModal] = useState(false);
  const { startWork, stopWork, loading: storeLoading } = useOrderStore();

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<any>(`/api/orders/${orderId}/assignments`);
      const assignmentData = response?.data || (Array.isArray(response) ? response : []);
      setAssignments(assignmentData);
      onAssignmentCountChange?.(assignmentData.length);
    } catch (error) {
      console.error("Failed to load assignments:", error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [orderId, order]);

  const handleRemoveAssignment = async (assignmentId: string) => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/api/orders/assignments/${assignmentId}`);
      toast.success(t('messages.success'));
      await loadAssignments();
      onRefresh?.();
    } catch (error) {
      console.error("Failed to remove assignment:", error);
      toast.error(t('messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopWork = async (employeeId: string) => {
    setActionLoading(true);
    try {
      await stopWork(orderId, employeeId);
      toast.success(t('order.workCompleted'));
      await loadAssignments();
      onRefresh?.();
    } catch (error) {
      console.error("Failed to stop work:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseWork = async (employeeId: string) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/api/orders/${orderId}/pause-work/${employeeId}`, {});
      toast.success(t('order.workPaused'));
      await loadAssignments();
      onRefresh?.();
    } catch (error) {
      console.error("Failed to pause work:", error);
      toast.error(t('messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleIndividualStart = async (employeeId: string) => {
    setActionLoading(true);
    try {
      await startWork(orderId, [employeeId]);
      await loadAssignments();
      onRefresh?.();
    } catch (error) {
      console.error("Failed to start work:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignStaff = () => {
    setShowAssignModal(true);
  };

  const handleTeamStart = () => {
    setShowTeamStartModal(true);
  };

  const handleAssignmentComplete = async () => {
    await loadAssignments();
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.ASSIGNED:
        return <Badge variant="secondary">{t("order.assigned")}</Badge>;
      case AssignmentStatus.ACTIVE:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{t("order.workingNow")}</Badge>;
      case 'PAUSED':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">{t("order.pause")}</Badge>;
      case AssignmentStatus.COMPLETED:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{t("order.completed")}</Badge>;
      case AssignmentStatus.CANCELLED:
        return <Badge variant="destructive">{t("order.cancelled")}</Badge>;
      default:
        return null;
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("order.assignedStaff")}</CardTitle>
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
            <CardTitle>{t("order.assignedStaff")}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {assignments.length === 0 ? t("order.noStaffAssigned") : 
               assignments.length === 1 ? `1 ${t("order.personAssigned")}` : 
               `${assignments.length} ${t("order.peopleAssigned")}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {userRole === "ADMIN" && assignments.some(a => a.status === AssignmentStatus.ASSIGNED) && (
              <Button 
                size="sm" 
                variant="default"
                onClick={handleTeamStart}
                disabled={actionLoading || storeLoading}
                className="bg-primary hover:bg-primary/90"
              >
                <Play className="h-4 w-4 mr-2" />
                {t("order.startWork")}
              </Button>
            )}
            {userRole === "ADMIN" && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleAssignStaff}
                disabled={actionLoading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {t("common.assign")}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("order.noStaffAssigned")}</p>
            {userRole === "ADMIN" && (
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-4"
                onClick={handleAssignStaff}
                disabled={actionLoading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {t("order.assignedStaff")}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Working Now Section */}
            {assignments.filter(a => a.status === AssignmentStatus.ACTIVE || a.status === AssignmentStatus.PAUSED).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-green-600 flex items-center gap-2">
                  <Play className="h-3 w-3 fill-current" />
                  {t("order.workingNow")}
                </h4>
                <div className="space-y-2">
                  {assignments
                    .filter(a => a.status === AssignmentStatus.ACTIVE || a.status === AssignmentStatus.PAUSED)
                    .map((assignment) => (
                      <AssignmentRow 
                        key={assignment.id} 
                        assignment={assignment} 
                        userRole={userRole}
                        t={t}
                        actionLoading={actionLoading}
                        storeLoading={storeLoading}
                        handleIndividualStart={handleIndividualStart}
                        handlePauseWork={handlePauseWork}
                        handleStopWork={handleStopWork}
                        handleRemoveAssignment={handleRemoveAssignment}
                        getStatusBadge={getStatusBadge}
                        getInitials={getInitials}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Awaiting Start Section */}
            {assignments.filter(a => a.status === AssignmentStatus.ASSIGNED).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {t("order.awaitingStart")}
                </h4>
                <div className="space-y-2">
                  {assignments
                    .filter(a => a.status === AssignmentStatus.ASSIGNED)
                    .map((assignment) => (
                      <AssignmentRow 
                        key={assignment.id} 
                        assignment={assignment} 
                        userRole={userRole}
                        t={t}
                        actionLoading={actionLoading}
                        storeLoading={storeLoading}
                        handleIndividualStart={handleIndividualStart}
                        handlePauseWork={handlePauseWork}
                        handleStopWork={handleStopWork}
                        handleRemoveAssignment={handleRemoveAssignment}
                        getStatusBadge={getStatusBadge}
                        getInitials={getInitials}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Completed Section */}
            {assignments.filter(a => a.status === AssignmentStatus.COMPLETED).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  {t("order.completed")}
                </h4>
                <div className="space-y-2">
                  {assignments
                    .filter(a => a.status === AssignmentStatus.COMPLETED)
                    .map((assignment) => (
                      <AssignmentRow 
                        key={assignment.id} 
                        assignment={assignment} 
                        userRole={userRole}
                        t={t}
                        actionLoading={actionLoading}
                        storeLoading={storeLoading}
                        handleIndividualStart={handleIndividualStart}
                        handlePauseWork={handlePauseWork}
                        handleStopWork={handleStopWork}
                        handleRemoveAssignment={handleRemoveAssignment}
                        getStatusBadge={getStatusBadge}
                        getInitials={getInitials}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <AssignEmployeeModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        orderId={orderId}
        currentAssignments={assignments.map(a => a.employeeId)}
        onAssignmentComplete={handleAssignmentComplete}
        maxEmployees={undefined}
      />

      <TeamStartModal
        isOpen={showTeamStartModal}
        onClose={() => {
          setShowTeamStartModal(false);
          loadAssignments();
        }}
        orderId={orderId}
        assignments={assignments}
      />
    </Card>
  );
};
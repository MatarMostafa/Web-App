"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { LoadingSpinnerWithText } from "@/components/ui";
import {
  Calendar,
  Clock,
  User,
  Building,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useEmployeeStore } from "@/store/employeeStore";
import LeaveActionModal from "@/components/modals/LeaveActionModal";

const LeaveRequestsPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: "approve" | "reject";
    absenceId: string;
    employeeName: string;
    leaveType: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const {
    allAbsences,
    loading,
    fetchAllAbsences,
    approveAbsence,
    rejectAbsence,
  } = useEmployeeStore();

  useEffect(() => {
    let filters = {};
    if (activeTab !== "all") {
      filters = { status: activeTab.toUpperCase() };
    }
    fetchAllAbsences(filters);
  }, [activeTab, fetchAllAbsences]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleActionClick = (action: "approve" | "reject", absence: any) => {
    setModalState({
      isOpen: true,
      action,
      absenceId: absence.id,
      employeeName: `${absence.employee?.firstName} ${absence.employee?.lastName}`,
      leaveType: absence.type,
    });
  };

  const handleQuickApprove = async (absenceId: string) => {
    setActionLoading(true);
    try {
      await approveAbsence(absenceId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalConfirm = async (reason?: string) => {
    if (!modalState) return;

    setActionLoading(true);
    try {
      if (modalState.action === "approve") {
        await approveAbsence(modalState.absenceId, reason);
      } else {
        await rejectAbsence(modalState.absenceId, reason);
      }
      setModalState(null);
    } catch (error) {
      // Error handling is done in the store
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalState(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Leave Requests Management</h1>
        <p className="text-muted-foreground">
          Manage employee leave requests and time-off approvals
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {activeTab === "all"
                  ? "All Leave Requests"
                  : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Requests`}{" "}
                ({allAbsences.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinnerWithText text="Loading requests..." />
                </div>
              ) : allAbsences.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    No {activeTab === "all" ? "" : activeTab} requests found
                  </p>
                  <p className="text-sm">
                    {activeTab === "pending"
                      ? "All leave requests have been processed"
                      : "No requests match the current filter"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allAbsences.map((absence) => (
                    <div
                      key={absence.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <h4 className="font-medium text-lg">
                                {absence.employee?.firstName}{" "}
                                {absence.employee?.lastName}
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                ({absence.employee?.employeeCode})
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                <span>
                                  {absence.employee?.department?.name}
                                </span>
                              </div>
                              <span>•</span>
                              <span>{absence.employee?.position?.title}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getStatusBadgeClass(absence.status)}
                          >
                            {absence.status}
                          </Badge>
                          <div className="flex gap-1">
                            {absence.status !== "APPROVED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickApprove(absence.id)}
                                disabled={actionLoading}
                                className="bg-green-50 text-green-700 hover:text-green-700 hover:bg-green-100"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {absence.status === "REJECTED"
                                  ? "Re-approve"
                                  : "Approve"}
                              </Button>
                            )}
                            {absence.status !== "REJECTED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleActionClick("reject", absence)
                                }
                                className="bg-red-50 text-red-700 hover:text-red-700 hover:bg-red-100"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {absence.status === "APPROVED"
                                  ? "Revoke"
                                  : "Reject"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">
                            Type:
                          </span>
                          <p className="text-sm">
                            {absence.type.replace("_", " ")}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">
                            Duration:
                          </span>
                          <p className="text-sm">
                            {calculateDays(absence.startDate, absence.endDate)}{" "}
                            day(s)
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">
                            Start Date:
                          </span>
                          <p className="text-sm">
                            {formatDate(absence.startDate)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">
                            End Date:
                          </span>
                          <p className="text-sm">
                            {formatDate(absence.endDate)}
                          </p>
                        </div>
                      </div>

                      {absence.reason && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-muted-foreground">
                            Reason:
                          </span>
                          <p className="text-sm mt-1 p-2 bg-gray-100 rounded">
                            {absence.reason}
                          </p>
                        </div>
                      )}

                      {absence.status !== "PENDING" && (
                        <div className="text-xs text-muted-foreground border-t pt-2">
                          {absence.status === "APPROVED" &&
                            absence.approvedAt && (
                              <span>
                                Approved on {formatDate(absence.approvedAt)}
                              </span>
                            )}
                          {absence.status === "REJECTED" &&
                            absence.rejectedAt && (
                              <div>
                                <span>
                                  Rejected on {formatDate(absence.rejectedAt)}
                                </span>
                                {absence.rejectionReason && (
                                  <span className="block mt-1">
                                    Reason: {absence.rejectionReason}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {modalState && (
        <LeaveActionModal
          isOpen={modalState.isOpen}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          action={modalState.action}
          employeeName={modalState.employeeName}
          leaveType={modalState.leaveType}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default LeaveRequestsPage;

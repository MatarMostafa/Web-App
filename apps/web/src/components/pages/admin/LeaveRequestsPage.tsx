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
import { useTranslation } from "@/hooks/useTranslation";

const LeaveRequestsPage = () => {
  const { t } = useTranslation();
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return t("admin.leaveManagement.status.approved");
      case "PENDING":
        return t("admin.leaveManagement.status.pending");
      case "REJECTED":
        return t("admin.leaveManagement.status.rejected");
      default:
        return status;
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
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">{t("admin.leaveManagement.title")}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("admin.leaveManagement.subtitle")}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-full min-w-max sm:grid sm:grid-cols-4 h-auto p-1">
            <TabsTrigger value="pending" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap">{t("admin.leaveManagement.tabs.pending")}</TabsTrigger>
            <TabsTrigger value="approved" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap">{t("admin.leaveManagement.tabs.approved")}</TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap">{t("admin.leaveManagement.tabs.rejected")}</TabsTrigger>
            <TabsTrigger value="all" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap">{t("admin.leaveManagement.tabs.all")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">
                  {activeTab === "all"
                    ? t("admin.leaveManagement.requests.allLeaveRequests")
                    : t(`admin.leaveManagement.requests.${activeTab}Requests`)}{" "}
                  ({allAbsences.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {loading ? (
                <div className="flex justify-center py-6 sm:py-8">
                  <LoadingSpinnerWithText text={t("admin.leaveManagement.requests.loadingRequests")} />
                </div>
              ) : allAbsences.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">
                    {activeTab === "all" 
                      ? t("admin.leaveManagement.requests.noRequestsFoundGeneral")
                      : `No ${activeTab} requests found`
                    }
                  </p>
                  <p className="text-xs sm:text-sm">
                    {activeTab === "pending"
                      ? t("admin.leaveManagement.requests.allProcessed")
                      : t("admin.leaveManagement.requests.noMatchingFilter")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {allAbsences.map((absence) => (
                    <div
                      key={absence.id}
                      className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <h4 className="font-medium text-base sm:text-lg">
                                {absence.employee?.firstName}{" "}
                                {absence.employee?.lastName}
                              </h4>
                            </div>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              ({absence.employee?.employeeCode})
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="truncate">
                                {absence.employee?.department?.name}
                              </span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">{absence.employee?.position?.title}</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Badge
                            className={`${getStatusBadgeClass(absence.status)} text-xs`}
                          >
                            {getStatusText(absence.status)}
                          </Badge>
                          <div className="flex flex-col sm:flex-row gap-1 w-full sm:w-auto">
                            {absence.status !== "APPROVED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickApprove(absence.id)}
                                disabled={actionLoading}
                                className="bg-green-50 text-green-700 hover:text-green-700 hover:bg-green-100 text-xs sm:text-sm w-full sm:w-auto"
                              >
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden sm:inline">
                                  {absence.status === "REJECTED"
                                    ? t("admin.leaveManagement.actions.reApprove")
                                    : t("admin.leaveManagement.actions.approve")}
                                </span>
                                <span className="sm:hidden">✓</span>
                              </Button>
                            )}
                            {absence.status !== "REJECTED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleActionClick("reject", absence)
                                }
                                className="bg-red-50 text-red-700 hover:text-red-700 hover:bg-red-100 text-xs sm:text-sm w-full sm:w-auto"
                              >
                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden sm:inline">
                                  {absence.status === "APPROVED"
                                    ? t("admin.leaveManagement.actions.revoke")
                                    : t("admin.leaveManagement.actions.reject")}
                                </span>
                                <span className="sm:hidden">✗</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                            {t("admin.leaveManagement.details.type")}:
                          </span>
                          <p className="text-xs sm:text-sm truncate">
                            {absence.type.replace("_", " ")}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                            {t("admin.leaveManagement.details.duration")}:
                          </span>
                          <p className="text-xs sm:text-sm">
                            {calculateDays(absence.startDate, absence.endDate)}{" "}
                            {t("admin.leaveManagement.details.days")}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                            {t("admin.leaveManagement.details.startDate")}:
                          </span>
                          <p className="text-xs sm:text-sm">
                            {formatDate(absence.startDate)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                            {t("admin.leaveManagement.details.endDate")}:
                          </span>
                          <p className="text-xs sm:text-sm">
                            {formatDate(absence.endDate)}
                          </p>
                        </div>
                      </div>

                      {absence.reason && (
                        <div className="mb-3">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                            {t("admin.leaveManagement.details.reason")}:
                          </span>
                          <p className="text-xs sm:text-sm mt-1 p-2 bg-gray-100 rounded break-words">
                            {absence.reason}
                          </p>
                        </div>
                      )}

                      {absence.status !== "PENDING" && (
                        <div className="text-xs text-muted-foreground border-t pt-2">
                          {absence.status === "APPROVED" &&
                            absence.approvedAt && (
                              <span className="block sm:inline">
                                {t("admin.leaveManagement.details.approvedOn")} {formatDate(absence.approvedAt)}
                              </span>
                            )}
                          {absence.status === "REJECTED" &&
                            absence.rejectedAt && (
                              <div>
                                <span className="block sm:inline">
                                  {t("admin.leaveManagement.details.rejectedOn")} {formatDate(absence.rejectedAt)}
                                </span>
                                {absence.rejectionReason && (
                                  <span className="block mt-1 break-words">
                                    {t("admin.leaveManagement.details.reason")}: {absence.rejectionReason}
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

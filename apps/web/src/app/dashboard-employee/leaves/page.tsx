"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useEmployeeLeaveStore } from "@/store/employeeLeaveStore";
import { LeaveRequestModal } from "@/components/employee/LeaveRequestModal";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

const LeavesPage = () => {
  const { t } = useTranslation();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { absences, stats, loading, fetchMyAbsences, fetchLeaveStats } =
    useEmployeeLeaveStore();

  useEffect(() => {
    fetchMyAbsences();
    fetchLeaveStats();
  }, [fetchMyAbsences, fetchLeaveStats]);

  // Listen for refresh events from notifications
  useEffect(() => {
    const handleRefreshLeaveData = (event: CustomEvent) => {
      if (event.detail?.type === 'employee') {
        // Refresh employee leave data
        fetchMyAbsences();
        fetchLeaveStats();
      }
    };

    window.addEventListener('refreshLeaveData', handleRefreshLeaveData as EventListener);
    return () => {
      window.removeEventListener('refreshLeaveData', handleRefreshLeaveData as EventListener);
    };
  }, [fetchMyAbsences, fetchLeaveStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('employee.dashboard.leaveManagement')}</h1>
        <Button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="sm:inline">{t('employee.dashboard.requestLeave')}</span>
        </Button>
      </div>

      {/* Leave Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">{t('employee.dashboard.leaveStats.totalDays')}</p>
                <p className="text-lg sm:text-2xl font-bold">{stats?.totalDays || 0}</p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">{t('employee.dashboard.leaveStats.approved')}</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {stats?.approvedDays || 0}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">{t('employee.dashboard.leaveStats.pending')}</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                  {stats?.pendingDays || 0}
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">{t('employee.dashboard.leaveStats.rejected')}</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">
                  {stats?.rejectedDays || 0}
                </p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">{t('employee.dashboard.myLeaveRequests')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {absences.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-500">{t('employee.dashboard.noLeaveRequests')}</p>
              <Button
                onClick={() => setShowRequestModal(true)}
                className="mt-4 w-full sm:w-auto"
                variant="outline"
              >
                {t('employee.dashboard.submitFirstRequest')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {absences.map((absence) => (
                <div
                  key={absence.id}
                  className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50"
                >
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-medium text-sm sm:text-base">
                        {t(`employee.leaveTypes.${absence.type}`, absence.type.replace('_', ' '))}
                      </h3>
                      <Badge className={`${getStatusColor(absence.status)} text-xs w-fit`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(absence.status)}
                          {t(`employee.leaveStatus.${absence.status.toLowerCase()}`, absence.status)}
                        </div>
                      </Badge>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className="font-medium">{t('employee.leaveDuration')}:</span>
                        <span>
                          {formatDate(absence.startDate, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          -{" "}
                          {formatDate(absence.endDate, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({calculateDays(absence.startDate, absence.endDate)} {t('employee.days')})
                        </span>
                      </div>
                      {absence.reason && (
                        <div>
                          <span className="font-medium">{t('employee.reason')}:</span>
                          <p className="mt-1 break-words">{absence.reason}</p>
                        </div>
                      )}
                      {absence.status === "REJECTED" &&
                        absence.rejectionReason && (
                          <div className="text-red-600">
                            <span className="font-medium">{t('employee.rejectionReason')}:</span>
                            <p className="mt-1 break-words">{absence.rejectionReason}</p>
                          </div>
                        )}
                      <p className="text-xs text-gray-500">
                        {t('employee.submittedOn')}{" "}
                        {formatDate(absence.createdAt, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={() => {
          setShowRequestModal(false);
          fetchMyAbsences();
          fetchLeaveStats();
        }}
      />
    </div>
  );
};

export default LeavesPage;

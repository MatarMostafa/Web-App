import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Award,
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  MapPin,
  Download,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Employee } from "@/types/employee";
import { useEmployeeStore } from "@/store/employeeStore";
import LeaveActionModal from "@/components/modals/LeaveActionModal";
import { useTranslation } from '@/hooks/useTranslation';

interface EmployeeProfileProps {
  employee: Employee & { name: string };
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employee }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("assignments");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: "approve" | "reject";
    absenceId: string;
    employeeName: string;
    leaveType: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const {
    employeeAssignments,
    employeePerformance,
    employeeQualifications,
    employeeAbsences,
    employeeFiles,
    isLoadingAssignments,
    isLoadingPerformance,
    isLoadingQualifications,
    isLoadingAbsences,
    isLoadingFiles,
    fetchEmployeeAssignments,
    fetchEmployeePerformance,
    fetchEmployeeQualifications,
    fetchEmployeeAbsences,
    fetchEmployeeFiles,
    downloadFile,
    previewFile,
    approveAbsence,
    rejectAbsence,
  } = useEmployeeStore();

  useEffect(() => {
    if (employee.id) {
      switch (activeTab) {
        case "assignments":
          fetchEmployeeAssignments(employee.id);
          break;
        case "performance":
          fetchEmployeePerformance(employee.id);
          break;
        case "qualifications":
          fetchEmployeeQualifications(employee.id);
          break;
        case "attendance":
          fetchEmployeeAbsences(employee.id);
          break;
        case "documents":
          fetchEmployeeFiles(employee.id);
          break;
      }
    }
  }, [
    employee.id,
    activeTab,
    fetchEmployeeAssignments,
    fetchEmployeePerformance,
    fetchEmployeeQualifications,
    fetchEmployeeAbsences,
    fetchEmployeeFiles,
  ]);

  const handleActionClick = (action: "approve" | "reject", absence: any) => {
    setModalState({
      isOpen: true,
      action,
      absenceId: absence.id,
      employeeName: employee.name,
      leaveType: absence.type,
    });
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
    } finally {
      setActionLoading(false);
      setModalState(null);
    }
  };

  const handleModalClose = () => {
    setModalState(null);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="assignments">{t('admin.employeeDetails.tabs.assignments')}</TabsTrigger>
          <TabsTrigger value="performance">{t('admin.employeeDetails.tabs.performance')}</TabsTrigger>
          <TabsTrigger value="qualifications">{t('admin.employeeDetails.tabs.skills')}</TabsTrigger>
          <TabsTrigger value="attendance">{t('admin.employeeDetails.tabs.attendance')}</TabsTrigger>
          <TabsTrigger value="documents">{t('admin.employeeDetails.tabs.documents')}</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {t('admin.employeeDetails.assignments.title')} ({employeeAssignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAssignments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('admin.employeeDetails.assignments.loading')}
                  </p>
                </div>
              ) : employeeAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin.employeeDetails.assignments.noAssignments')}</p>
                  <p className="text-sm">
                    {t('admin.employeeDetails.assignments.noAssignmentsDesc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employeeAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-lg">
                            {assignment.order.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Order #{assignment.order.orderNumber}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {/* <Badge variant={assignment.status === 'COMPLETED' ? 'default' : assignment.status === 'ACTIVE' ? 'secondary' : 'outline'}>
                            {assignment.status}
                          </Badge> */}
                          <Badge
                            variant={
                              assignment.order.status === "COMPLETED"
                                ? "default"
                                : "outline"
                            }
                          >
                            {assignment.order.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {t('admin.employeeDetails.assignments.assigned')}:{" "}
                            {new Date(
                              assignment.assignedDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {t('admin.employeeDetails.assignments.scheduled')}:{" "}
                            {new Date(
                              assignment.order.scheduledDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{t('admin.employeeDetails.assignments.priority')}: {assignment.order.priority}</span>
                        </div>
                        {assignment.estimatedHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{t('admin.employeeDetails.assignments.estimated')}: {assignment.estimatedHours}h</span>
                          </div>
                        )}
                      </div>
                      {assignment.notes && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <strong>{t('admin.employeeDetails.assignments.notes')}:</strong> {assignment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('admin.employeeDetails.performance.title')} ({employeePerformance.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPerformance ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('admin.employeeDetails.performance.loading')}
                  </p>
                </div>
              ) : employeePerformance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin.employeeDetails.performance.noData')}</p>
                  <p className="text-sm">
                    {t('admin.employeeDetails.performance.noDataDesc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employeePerformance.map((performance) => (
                    <div
                      key={performance.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-lg">
                            {t('admin.employeeDetails.performance.period')}:{" "}
                            {new Date(
                              performance.periodStart
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              performance.periodEnd
                            ).toLocaleDateString()}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {t('admin.employeeDetails.performance.score')}: {performance.score}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            className={
                              performance.trafficLight === "GREEN"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : performance.trafficLight === "YELLOW"
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                            }
                          >
                            {performance.trafficLight}
                          </Badge>
                          {performance.manualOverride && (
                            <Badge variant="outline">{t('admin.employeeDetails.performance.manualOverride')}</Badge>
                          )}
                        </div>
                      </div>
                      {performance.trafficLightReason && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <strong>{t('admin.employeeDetails.performance.reason')}:</strong>{" "}
                          {performance.trafficLightReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                {t('admin.employeeDetails.qualifications.title')} ({employeeQualifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingQualifications ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('admin.employeeDetails.qualifications.loading')}
                  </p>
                </div>
              ) : employeeQualifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin.employeeDetails.qualifications.noQualifications')}</p>
                  <p className="text-sm">
                    {t('admin.employeeDetails.qualifications.noQualificationsDesc')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employeeQualifications.map((qual) => (
                    <div
                      key={qual.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-lg">
                            {qual.qualification.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {qual.qualification.category}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {t('admin.employeeDetails.qualifications.level')} {qual.proficiencyLevel}
                          </Badge>
                          {qual.isVerified && (
                            <Badge variant="default">{t('admin.employeeDetails.qualifications.verified')}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {t('admin.employeeDetails.qualifications.acquired')}:{" "}
                          {new Date(qual.acquiredDate).toLocaleDateString()}
                        </p>
                        {qual.expiryDate && (
                          <p>
                            {t('admin.employeeDetails.qualifications.expires')}:{" "}
                            {new Date(qual.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {qual.qualification.description && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          {qual.qualification.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('admin.employeeDetails.attendance.title')} ({employeeAbsences.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAbsences ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('admin.employeeDetails.attendance.loading')}
                  </p>
                </div>
              ) : employeeAbsences.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin.employeeDetails.attendance.noRecords')}</p>
                  <p className="text-sm">
                    {t('admin.employeeDetails.attendance.noRecordsDesc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employeeAbsences.map((absence) => (
                    <div
                      key={absence.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-lg">
                            {absence.type.replace("_", " ")}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(absence.startDate).toLocaleDateString()} -{" "}
                            {new Date(absence.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              absence.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : absence.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {absence.status}
                          </Badge>
                          <div className="flex gap-1">
                            {absence.status !== "APPROVED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleActionClick("approve", absence)
                                }
                                className="bg-green-50 text-green-700 hover:text-green-700 hover:bg-green-100"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {absence.status === "REJECTED"
                                  ? t('admin.employeeDetails.attendance.reApprove')
                                  : t('admin.employeeDetails.attendance.approve')}
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
                                <XCircle className="h-3 w-3 mr-1" />
                                {absence.status === "APPROVED"
                                  ? t('admin.employeeDetails.attendance.revoke')
                                  : t('admin.employeeDetails.attendance.reject')}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      {absence.reason && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <strong>{t('admin.employeeDetails.attendance.reason')}:</strong> {absence.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('admin.employeeDetails.documents.title')} ({employeeFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingFiles ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('admin.employeeDetails.documents.loading')}
                  </p>
                </div>
              ) : employeeFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin.employeeDetails.documents.noDocuments')}</p>
                  <p className="text-sm">
                    {t('admin.employeeDetails.documents.noDocumentsDesc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employeeFiles.map((file) => (
                    <div
                      key={file.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-blue-500" />
                          <div>
                            <h4 className="font-medium text-lg">
                              {file.originalName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {file.documentType.replace("_", " ")} •{" "}
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => previewFile(file.id)}
                            title="View file"
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t('admin.employeeDetails.documents.view')}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              downloadFile(file.id, file.originalName)
                            }
                            title="Download file"
                            className="bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {t('admin.employeeDetails.documents.download')}
                          </Button>
                          {file.isVerified && (
                            <Badge variant="default">{t('admin.employeeDetails.documents.verified')}</Badge>
                          )}
                          <Badge variant="outline">
                            {file.mimeType.split("/")[1].toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      {file.description && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <strong>{t('admin.employeeDetails.documents.description')}:</strong> {file.description}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">
                        {t('admin.employeeDetails.documents.uploaded')}:{" "}
                        {new Date(file.createdAt).toLocaleDateString()}
                      </div>
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

export default EmployeeProfile;

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

interface EmployeeProfileProps {
  employee: Employee & { name: string };
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employee }) => {
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
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="qualifications">Skills</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Assignments ({employeeAssignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAssignments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Loading assignments...
                  </p>
                </div>
              ) : employeeAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No assignments found</p>
                  <p className="text-sm">
                    This employee has no current or past assignments
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
                            Assigned:{" "}
                            {new Date(
                              assignment.assignedDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Scheduled:{" "}
                            {new Date(
                              assignment.order.scheduledDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>Priority: {assignment.order.priority}</span>
                        </div>
                        {assignment.estimatedHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Est: {assignment.estimatedHours}h</span>
                          </div>
                        )}
                      </div>
                      {assignment.notes && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <strong>Notes:</strong> {assignment.notes}
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
                Performance Overview ({employeePerformance.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPerformance ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Loading performance data...
                  </p>
                </div>
              ) : employeePerformance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No performance data available</p>
                  <p className="text-sm">
                    Performance metrics will appear here when available
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
                            Period:{" "}
                            {new Date(
                              performance.periodStart
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              performance.periodEnd
                            ).toLocaleDateString()}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Score: {performance.score}
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
                            <Badge variant="outline">Manual Override</Badge>
                          )}
                        </div>
                      </div>
                      {performance.trafficLightReason && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <strong>Reason:</strong>{" "}
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
                Skills & Qualifications ({employeeQualifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingQualifications ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Loading qualifications...
                  </p>
                </div>
              ) : employeeQualifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No qualifications recorded</p>
                  <p className="text-sm">
                    Employee skills and certifications will appear here
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
                            Level {qual.proficiencyLevel}
                          </Badge>
                          {qual.isVerified && (
                            <Badge variant="default">Verified</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>
                          Acquired:{" "}
                          {new Date(qual.acquiredDate).toLocaleDateString()}
                        </p>
                        {qual.expiryDate && (
                          <p>
                            Expires:{" "}
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
                Attendance & Time Off ({employeeAbsences.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAbsences ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Loading attendance data...
                  </p>
                </div>
              ) : employeeAbsences.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No attendance records</p>
                  <p className="text-sm">
                    Time tracking and absence data will appear here
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
                                <XCircle className="h-3 w-3 mr-1" />
                                {absence.status === "APPROVED"
                                  ? "Revoke"
                                  : "Reject"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      {absence.reason && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <strong>Reason:</strong> {absence.reason}
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
                Documents & Files ({employeeFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingFiles ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Loading documents...
                  </p>
                </div>
              ) : employeeFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded</p>
                  <p className="text-sm">
                    Employee documents and files will appear here
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
                            View
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
                            Download
                          </Button>
                          {file.isVerified && (
                            <Badge variant="default">Verified</Badge>
                          )}
                          <Badge variant="outline">
                            {file.mimeType.split("/")[1].toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      {file.description && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <strong>Description:</strong> {file.description}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">
                        Uploaded:{" "}
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

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui";
import {
  Briefcase,
  Award,
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  MapPin,
} from "lucide-react";
import { Employee } from "@/types/employee";
import { useEmployeeStore } from "@/store/employeeStore";

interface EmployeeProfileProps {
  employee: Employee & { name: string };
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employee }) => {
  const [activeTab, setActiveTab] = useState("assignments");
  const {
    employeeAssignments,
    isLoadingAssignments,
    fetchEmployeeAssignments,
  } = useEmployeeStore();

  useEffect(() => {
    if (employee.id && activeTab === "assignments") {
      fetchEmployeeAssignments(employee.id);
    }
  }, [employee.id, activeTab, fetchEmployeeAssignments]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
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
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No performance data available</p>
                <p className="text-sm">
                  Performance metrics will appear here when available
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skills & Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No qualifications recorded</p>
                <p className="text-sm">
                  Employee skills and certifications will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Attendance & Time Off
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance records</p>
                <p className="text-sm">
                  Time tracking and absence data will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents & Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents uploaded</p>
                <p className="text-sm">
                  Employee documents and files will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeProfile;

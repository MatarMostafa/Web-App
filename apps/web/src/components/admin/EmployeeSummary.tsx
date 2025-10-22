import React from "react";
import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  User,
  Building,
  Briefcase,
  Clock,
  DollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Card, CardContent } from "@/components/ui";
import { format } from "date-fns";
import { Employee } from "@/types/employee";

interface EmployeeSummaryProps {
  employee: Employee;
}

const EmployeeSummary: React.FC<EmployeeSummaryProps> = ({ employee }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const getFullName = () => {
    return `${employee.firstName} ${employee.lastName}`.trim();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="bg-background border-border shadow-sm mb-8">
      <CardContent className="p-8">
        <div className="flex flex-col mb-5">
          <div className="flex items-center gap-4 w-full justify-center lg:justify-start">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getFullName()}
            </h1>
            <p className="text-lg text-muted-foreground">
              Employee Code: {employee.employeeCode}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={employee.isAvailable ? "default" : "destructive"}
                className="text-xs"
              >
                {employee.isAvailable ? "Available" : "Unavailable"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {employee.scheduleType.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h3>

            <div className="space-y-3">
              {employee.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${employee.phoneNumber}`}
                    className="text-foreground hover:text-primary transition-colors font-medium"
                  >
                    {employee.phoneNumber}
                  </a>
                </div>
              )}

              {employee.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {employee.address}
                  </span>
                </div>
              )}

              {employee.dateOfBirth && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="font-medium text-foreground">
                    {formatDate(employee.dateOfBirth)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Center Column - Employment Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Employment Details
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium text-foreground">
                  {employee.departmentId}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Position:</span>
                <span className="font-medium text-foreground">
                  {employee.positionId}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Hire Date:</span>
                <span className="font-medium text-foreground">
                  {formatDate(employee.hireDate)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Schedule:</span>
                <span className="font-medium text-foreground">
                  {employee.scheduleType.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Compensation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Compensation
            </h3>

            <div className="space-y-3">
              {employee.salary && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Annual Salary:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(employee.salary)}
                  </span>
                </div>
              )}

              {employee.hourlyRate && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Hourly Rate:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(employee.hourlyRate)}/hr
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Priority Level:</span>
                <span className="font-medium text-foreground">
                  {employee.priority}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeSummary;

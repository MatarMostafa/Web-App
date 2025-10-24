import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Avatar, AvatarFallback } from "@/components/ui";
import { Edit3, Trash2, Shield, ShieldOff } from "lucide-react";
import { format } from "date-fns";
import { Employee } from "@/types/employee";
import { useRouter } from "next/navigation";

interface EmployeeTableViewProps {
  employees: Employee[];
  loading?: boolean;
  onEdit?: (employee: Employee) => void;
  onDelete?: (id: string) => void;
  onBlock?: (employee: Employee) => void;
  onUnblock?: (employee: Employee) => void;
}

const EmployeeTableView: React.FC<EmployeeTableViewProps> = ({
  employees,
  loading = false,
  onEdit,
  onDelete,
  onBlock,
  onUnblock,
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };
  const router = useRouter();
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow className="border-b">
              <TableHead className="w-[200px]">Employee</TableHead>
              <TableHead className="w-[150px]">Employee Code</TableHead>
              <TableHead className="w-[200px]">User ID</TableHead>
              <TableHead className="w-[150px]">Phone</TableHead>
              <TableHead className="w-[150px]">Hire Date</TableHead>
              <TableHead className="w-[150px]">Schedule</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[150px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading employees...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/50">
                  {/* Employee Name */}
                  <TableCell>
                    <div
                      className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                      onClick={() =>
                        router.push(`/dashboard-admin/employees/${employee.id}`)
                      }
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(employee.firstName, employee.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-primary hover:underline">
                          {employee.firstName} {employee.lastName}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Employee Code */}
                  <TableCell>
                    <span className="text-sm font-mono">
                      {employee.employeeCode}
                    </span>
                  </TableCell>

                  {/* User ID */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {employee.userId || "—"}
                    </span>
                  </TableCell>

                  {/* Phone */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {employee.phoneNumber || "—"}
                    </span>
                  </TableCell>

                  {/* Hire Date */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(employee.hireDate), "MMM d, yyyy")}
                    </span>
                  </TableCell>

                  {/* Schedule Type */}
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {employee.scheduleType.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={employee.isAvailable ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {employee.isAvailable ? "Available" : "Blocked"}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(employee)}
                          title="Edit Employee"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      {employee.isAvailable ? (
                        onBlock && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onBlock(employee)}
                            title="Block Employee"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )
                      ) : (
                        onUnblock && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUnblock(employee)}
                            title="Unblock Employee"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <ShieldOff className="h-4 w-4" />
                          </Button>
                        )
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(employee.id)}
                          title="Delete Employee"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EmployeeTableView;

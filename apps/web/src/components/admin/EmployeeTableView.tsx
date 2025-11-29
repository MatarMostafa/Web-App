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
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Edit3, Trash2, Shield, ShieldOff, KeyRound } from "lucide-react";
import { format } from "date-fns";
import { Employee } from "@/types/employee";
import { useRouter } from "next/navigation";
import { useTranslation } from '@/hooks/useTranslation';

interface EmployeeTableViewProps {
  employees: Employee[];
  loading?: boolean;
  onEdit?: (employee: Employee) => void;
  onDelete?: (id: string) => void;
  onBlock?: (employee: Employee) => void;
  onUnblock?: (employee: Employee) => void;
  onResetPassword?: (employee: Employee) => void;
}

const EmployeeTableView: React.FC<EmployeeTableViewProps> = ({
  employees,
  loading = false,
  onEdit,
  onDelete,
  onBlock,
  onUnblock,
  onResetPassword,
}) => {
  const { t } = useTranslation();
  const { currentPage, setCurrentPage, paginatedItems, totalItems } = usePagination(employees);
  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName || lastName) {
      return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    }
    return username?.[0]?.toUpperCase() || "U";
  };
  const router = useRouter();
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow className="border-b">
              <TableHead className="w-[200px]">{t('admin.employees.table.employee')}</TableHead>
              <TableHead className="w-[150px]">{t('admin.employees.table.employeeCode')}</TableHead>
              <TableHead className="w-[200px]">{t('admin.employees.table.userId')}</TableHead>
              <TableHead className="w-[150px]">{t('admin.employees.table.phone')}</TableHead>
              <TableHead className="w-[150px]">{t('admin.employees.table.hireDate')}</TableHead>
              <TableHead className="w-[150px]">{t('admin.employees.table.schedule')}</TableHead>
              <TableHead className="w-[100px]">{t('admin.employees.table.status')}</TableHead>
              <TableHead className="w-[150px] text-center">{t('admin.employees.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {t('admin.employees.noEmployeesFound')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((employee) => (
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
                          {getInitials(employee.firstName, employee.lastName, employee.user?.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-primary hover:underline">
                          {employee.firstName || employee.lastName ? 
                            `${employee.firstName || ""} ${employee.lastName || ""}`.trim() : 
                            employee.user?.username || "No Name"
                          }
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
                      {employee.isAvailable ? t('admin.employees.table.available') : t('admin.employees.table.blocked')}
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
                          title={t('admin.employees.table.editEmployee')}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      {onResetPassword && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onResetPassword(employee)}
                          title={t('admin.employees.table.resetPassword')}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                      )}
                      {employee.isAvailable ? (
                        onBlock && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onBlock(employee)}
                            title={t('admin.employees.table.blockEmployee')}
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
                            title={t('admin.employees.table.unblockEmployee')}
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
                          title={t('admin.employees.table.deleteEmployee')}
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
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default EmployeeTableView;

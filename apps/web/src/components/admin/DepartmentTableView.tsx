"use client";
import React from "react";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Edit, Trash2, Building } from "lucide-react";
import { Department } from "@/types/department";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface DepartmentTableViewProps {
  departments: Department[];
  loading: boolean;
  onEdit: (department: Department) => void;
  onDelete: (id: string) => void;
}

const DepartmentTableView: React.FC<DepartmentTableViewProps> = ({
  departments,
  loading,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { currentPage, setCurrentPage, paginatedItems, totalItems } = usePagination(departments);
  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">{t("admin.departments.table.loadingDepartments")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">{t("admin.departments.table.name")}</th>
              <th className="text-left p-4 font-medium">{t("admin.departments.table.code")}</th>
              <th className="text-left p-4 font-medium">{t("admin.departments.table.description")}</th>
              <th className="text-left p-4 font-medium">{t("admin.departments.table.created")}</th>
              <th className="text-left p-4 font-medium">{t("admin.departments.table.status")}</th>
              <th className="text-right p-4 font-medium">{t("admin.departments.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((department) => (
              <tr key={department.id} className="border-t hover:bg-muted/25">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Building className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{department.name}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline">{department.code}</Badge>
                </td>
                <td className="p-4">
                  <p className="text-sm text-muted-foreground max-w-xs truncate">
                    {department.description || t("admin.departments.table.noDescription")}
                  </p>
                </td>
                <td className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(department.createdAt), "MMM d, yyyy")}
                  </p>
                </td>
                <td className="p-4">
                  <Badge variant={department.isActive ? "default" : "destructive"}>
                    {department.isActive ? t("admin.departments.table.active") : t("admin.departments.table.inactive")}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(department)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(department.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default DepartmentTableView;
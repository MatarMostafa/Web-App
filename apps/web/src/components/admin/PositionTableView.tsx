"use client";
import React from "react";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Edit, Trash2, Briefcase } from "lucide-react";
import { Position } from "@/types/position";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface PositionTableViewProps {
  positions: Position[];
  loading: boolean;
  onEdit: (position: Position) => void;
  onDelete: (id: string) => void;
}

const PositionTableView: React.FC<PositionTableViewProps> = ({
  positions,
  loading,
  onEdit,
  onDelete,
}) => {
  const { t, ready } = useTranslation();
  const { currentPage, setCurrentPage, paginatedItems, totalItems } = usePagination(positions);
  
  if (!ready) {
    return (
      <div className="border rounded-lg">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">{t("admin.positions.table.loadingPositions")}</p>
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
              <th className="text-left p-4 font-medium">{t("admin.positions.table.title")}</th>
              <th className="text-left p-4 font-medium">{t("admin.positions.table.department")}</th>
              <th className="text-left p-4 font-medium">{t("admin.positions.table.description")}</th>
              <th className="text-left p-4 font-medium">{t("admin.positions.table.created")}</th>
              <th className="text-left p-4 font-medium">{t("admin.positions.table.status")}</th>
              <th className="text-right p-4 font-medium">{t("admin.positions.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((position) => (
              <tr key={position.id} className="border-t hover:bg-muted/25">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{position.title}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline">{position.department?.name || t("admin.positions.table.noDepartment")}</Badge>
                </td>
                <td className="p-4">
                  <p className="text-sm text-muted-foreground max-w-xs truncate">
                    {position.description || t("admin.positions.table.noDescription")}
                  </p>
                </td>
                <td className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(position.createdAt), "MMM d, yyyy")}
                  </p>
                </td>
                <td className="p-4">
                  <Badge variant={position.isActive ? "default" : "destructive"}>
                    {position.isActive ? t("admin.positions.table.active") : t("admin.positions.table.inactive")}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(position)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(position.id)}
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

export default PositionTableView;
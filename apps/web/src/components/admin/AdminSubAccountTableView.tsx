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
import { Edit3, Trash2, KeyRound, Shield, ShieldOff } from "lucide-react";
import { format } from "date-fns";
import { SubAccount } from "@/types/subAccount";
import { useTranslation } from "@/hooks/useTranslation";

interface AdminSubAccountTableViewProps {
  subAccounts: SubAccount[];
  loading?: boolean;
  onEdit?: (subAccount: SubAccount) => void;
  onDelete?: (id: string) => void;
  onResetPassword?: (subAccount: SubAccount) => void;
}

const AdminSubAccountTableView: React.FC<AdminSubAccountTableViewProps> = ({
  subAccounts,
  loading = false,
  onEdit,
  onDelete,
  onResetPassword,
}) => {
  const { t } = useTranslation();
  const { currentPage, setCurrentPage, paginatedItems, totalItems } = usePagination(subAccounts);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow className="border-b">
              <TableHead className="w-[200px]">{t("admin.customerDetails.subAccounts.table.name")}</TableHead>
              <TableHead className="w-[200px]">{t("admin.customerDetails.subAccounts.table.email")}</TableHead>
              <TableHead className="w-[150px]">{t("admin.customerDetails.subAccounts.table.username")}</TableHead>
              <TableHead className="w-[100px]">{t("admin.customerDetails.subAccounts.table.status")}</TableHead>
              <TableHead className="w-[150px]">{t("admin.customerDetails.subAccounts.table.created")}</TableHead>
              <TableHead className="w-[120px] text-center">{t("admin.customerDetails.subAccounts.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t("admin.customerDetails.subAccounts.table.loading")}
                </TableCell>
              </TableRow>
            ) : subAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t("admin.customerDetails.subAccounts.table.noSubAccounts")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((subAccount) => (
                <TableRow key={subAccount.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(subAccount.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{subAccount.name}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {subAccount.user?.email || "—"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {subAccount.user?.username || "—"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={subAccount.isActive ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {subAccount.isActive ? t("admin.customerDetails.subAccounts.table.active") : t("admin.customerDetails.subAccounts.table.inactive")}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(subAccount.createdAt), "MMM d, yyyy")}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(subAccount)}
                          title={t('admin.customerDetails.subAccounts.table.editSubAccount')}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      {onResetPassword && subAccount.user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onResetPassword(subAccount)}
                          title={t('admin.customerDetails.subAccounts.table.resetPassword')}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(subAccount.id)}
                          title={t('admin.customerDetails.subAccounts.table.deleteSubAccount')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

export default AdminSubAccountTableView;
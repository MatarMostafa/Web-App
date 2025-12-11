import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, KeyRound } from "lucide-react";
import { SubAccount } from "@/types/subAccount";
import { useTranslation } from "@/hooks/useTranslation";

interface CustomerSubAccountTableViewProps {
  subAccounts: SubAccount[];
  loading: boolean;
  onEdit: (subAccount: SubAccount) => void;
  onDelete: (id: string) => void;
  onResetPassword: (subAccount: SubAccount) => void;
}

export default function CustomerSubAccountTableView({
  subAccounts,
  loading,
  onEdit,
  onDelete,
  onResetPassword,
}: CustomerSubAccountTableViewProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t("common.loading")}</p>
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
              <th className="text-left p-4 font-medium">
                {t("customerPortal.subAccounts.table.name")}
              </th>
              <th className="text-left p-4 font-medium">
                {t("customerPortal.subAccounts.table.email")}
              </th>
              <th className="text-left p-4 font-medium">
                {t("customerPortal.subAccounts.table.status")}
              </th>
              <th className="text-left p-4 font-medium">
                {t("customerPortal.subAccounts.table.lastLogin")}
              </th>
              <th className="text-right p-4 font-medium">
                {t("customerPortal.subAccounts.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {subAccounts.map((subAccount) => (
              <tr key={subAccount.id} className="border-t hover:bg-muted/30">
                <td className="p-4">
                  <div>
                    <div className="font-medium">{subAccount.name}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-muted-foreground">
                    {subAccount.user?.email || t("customerPortal.subAccounts.table.noEmail")}
                  </div>
                </td>
                <td className="p-4">
                  <Badge
                    variant={subAccount.isActive ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {subAccount.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="text-sm text-muted-foreground">
                    {subAccount.user?.lastLogin
                      ? new Date(subAccount.user.lastLogin).toLocaleDateString()
                      : t("customerPortal.subAccounts.table.never")}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(subAccount)}
                      className="h-8 w-8 p-0"
                      title={t("common.edit")}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResetPassword(subAccount)}
                      className="h-8 w-8 p-0"
                      title={t("customerPortal.subAccounts.resetPassword.title")}
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(subAccount.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title={t("common.delete")}
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
    </div>
  );
}
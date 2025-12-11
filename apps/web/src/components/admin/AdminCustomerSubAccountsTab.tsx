import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Search, Plus, Users } from "lucide-react";
import AdminSubAccountTableView from "@/components/admin/AdminSubAccountTableView";
import CreateSubAccountDialog from "@/components/customer/CreateSubAccountDialog";
import EditSubAccountDialog from "@/components/customer/EditSubAccountDialog";
import ResetSubAccountPasswordDialog from "@/components/customer/ResetSubAccountPasswordDialog";
import { useSubAccountStore } from "@/store/subAccountStore";
import { SubAccount } from "@/types/subAccount";
import { useTranslation } from "@/hooks/useTranslation";

interface AdminCustomerSubAccountsTabProps {
  customerId: string;
}

const AdminCustomerSubAccountsTab: React.FC<AdminCustomerSubAccountsTabProps> = ({ customerId }) => {
  const { t } = useTranslation();
  const { subAccounts, loading, fetchSubAccounts, deleteSubAccount } = useSubAccountStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSubAccount, setEditingSubAccount] = useState<SubAccount | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordState, setResetPasswordState] = useState<{
    isOpen: boolean;
    subAccount: SubAccount | null;
  }>({ isOpen: false, subAccount: null });

  useEffect(() => {
    if (customerId) {
      fetchSubAccounts(customerId);
    }
  }, [customerId, fetchSubAccounts]);

  const filteredSubAccounts = subAccounts.filter(
    (subAccount) =>
      subAccount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subAccount.user?.email && subAccount.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subAccount.user?.username && subAccount.user.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (subAccount: SubAccount) => {
    setEditingSubAccount(subAccount);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("admin.customerDetails.subAccounts.confirmDelete"))) {
      await deleteSubAccount(id);
    }
  };

  const handleResetPassword = (subAccount: SubAccount) => {
    setResetPasswordState({ isOpen: true, subAccount });
  };

  const handleDialogSuccess = () => {
    if (customerId) {
      fetchSubAccounts(customerId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('admin.customerDetails.subAccounts.title')} ({subAccounts.length})
          </CardTitle>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.customerDetails.subAccounts.addSubAccount')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t("admin.customerDetails.subAccounts.searchPlaceholder")}
              className="pl-10 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <AdminSubAccountTableView
          subAccounts={filteredSubAccounts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResetPassword={handleResetPassword}
        />

        <CreateSubAccountDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          customerId={customerId}
          onSuccess={handleDialogSuccess}
        />

        {editingSubAccount && (
          <EditSubAccountDialog
            subAccount={editingSubAccount}
            open={editDialogOpen}
            onOpenChange={(open) => {
              setEditDialogOpen(open);
              if (!open) setEditingSubAccount(null);
            }}
            onSuccess={handleDialogSuccess}
          />
        )}

        {resetPasswordState.subAccount && (
          <ResetSubAccountPasswordDialog
            subAccount={resetPasswordState.subAccount}
            open={resetPasswordState.isOpen}
            onOpenChange={(open) => {
              setResetPasswordState({ isOpen: open, subAccount: open ? resetPasswordState.subAccount : null });
            }}
            onSuccess={handleDialogSuccess}
            isAdmin={true}
          />
        )}

        {!loading && subAccounts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('admin.customerDetails.subAccounts.noSubAccounts')}</p>
            <p className="text-sm">{t('admin.customerDetails.subAccounts.noSubAccountsDesc')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCustomerSubAccountsTab;
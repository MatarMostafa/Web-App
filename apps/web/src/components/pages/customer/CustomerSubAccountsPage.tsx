"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Search, Plus, Users } from "lucide-react";
import CustomerSubAccountTableView from "@/components/customer/CustomerSubAccountTableView";
import AddCustomerSubAccountDialog from "@/components/customer/AddCustomerSubAccountDialog";
import EditCustomerSubAccountDialog from "@/components/customer/EditCustomerSubAccountDialog";
import { useCustomerSubAccountStore } from "@/store/customerSubAccountStore";
import { SubAccount } from "@/types/subAccount";
import { useTranslation } from "@/hooks/useTranslation";

const CustomerSubAccountsPage = () => {
  const { t } = useTranslation();
  const { subAccounts, loading, fetchSubAccounts, deleteSubAccount } = useCustomerSubAccountStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSubAccount, setEditingSubAccount] = useState<SubAccount | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchSubAccounts();
  }, [fetchSubAccounts]);

  const filteredSubAccounts = subAccounts.filter(
    (subAccount) =>
      subAccount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subAccount.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (subAccount: SubAccount) => {
    setEditingSubAccount(subAccount);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("customerPortal.subAccounts.confirmDelete"))) {
      await deleteSubAccount(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {t("customerPortal.subAccounts.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("customerPortal.subAccounts.subtitle")}
          </p>
        </div>
        <AddCustomerSubAccountDialog
          trigger={
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> {t("customerPortal.subAccounts.addSubAccount")}
            </Button>
          }
        />
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("customerPortal.subAccounts.searchPlaceholder")}
            className="pl-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <CustomerSubAccountTableView
        subAccounts={filteredSubAccounts}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {editingSubAccount && (
        <EditCustomerSubAccountDialog
          subAccount={editingSubAccount}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditingSubAccount(null);
          }}
        />
      )}

      {!loading && subAccounts.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-12 border rounded-lg">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">{t("customerPortal.subAccounts.noSubAccountsFound")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("customerPortal.subAccounts.getStartedMessage")}
          </p>
          <AddCustomerSubAccountDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" /> {t("customerPortal.subAccounts.addSubAccount")}
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default CustomerSubAccountsPage;
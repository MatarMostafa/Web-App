"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Search, Plus, Building } from "lucide-react";
import CustomerTableView from "@/components/admin/CustomerTableView";
import AddCustomerDialog from "@/components/admin/AddCustomerDialog";
import EditCustomerDialog from "@/components/admin/EditCustomerDialog";
import ResetPasswordDialog from "@/components/admin/ResetPasswordDialog";
import CreateCustomerAccountDialog from "@/components/admin/CreateCustomerAccountDialog";
import BlockCustomerModal from "@/components/modals/BlockCustomerModal";
import { CustomerExportDialog } from "@/components/admin/CustomerExportDialog";
import { useCustomerStore } from "@/store/customerStore";
import { Customer } from "@/types/customer";
import { useTranslation } from "@/hooks/useTranslation";

const CustomersPage = () => {
  const { t } = useTranslation();
  const { customers, loading, fetchCustomers, deleteCustomer, blockCustomer, unblockCustomer } =
    useCustomerStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordState, setResetPasswordState] = useState<{
    isOpen: boolean;
    customer: Customer | null;
  }>({ isOpen: false, customer: null });
  const [createAccountState, setCreateAccountState] = useState<{
    isOpen: boolean;
    customer: Customer | null;
  }>({ isOpen: false, customer: null });
  const [blockModalState, setBlockModalState] = useState<{
    isOpen: boolean;
    action: "block" | "unblock";
    customer: Customer | null;
  }>({ isOpen: false, action: "block", customer: null });

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.contactEmail &&
        customer.contactEmail
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (customer.contactPhone && customer.contactPhone.includes(searchQuery)) ||
      (customer.industry &&
        customer.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("admin.customers.confirmDelete"))) {
      await deleteCustomer(id);
    }
  };

  const handleResetPassword = (customer: Customer) => {
    setResetPasswordState({ isOpen: true, customer });
  };

  const handleCreateAccount = (customer: Customer) => {
    setCreateAccountState({ isOpen: true, customer });
  };

  const handleBlock = (customer: Customer) => {
    setBlockModalState({
      isOpen: true,
      action: "block",
      customer,
    });
  };

  const handleUnblock = (customer: Customer) => {
    setBlockModalState({
      isOpen: true,
      action: "unblock",
      customer,
    });
  };

  const handleBlockConfirm = async (reason?: string) => {
    if (!blockModalState.customer) return;
    
    try {
      if (blockModalState.action === "block") {
        await blockCustomer(blockModalState.customer.id, reason);
      } else {
        await unblockCustomer(blockModalState.customer.id);
      }
      await fetchCustomers(); // Refresh the customer list
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleBlockModalClose = () => {
    setBlockModalState({ isOpen: false, action: "block", customer: null });
  };

  const handleAccountCreated = () => {
    fetchCustomers(); // Refresh the list
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">{t("admin.customers.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.customers.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <CustomerExportDialog customers={customers} />
          <AddCustomerDialog
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> {t("admin.customers.addCustomer")}
              </Button>
            }
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("admin.customers.searchPlaceholder")}
            className="pl-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <CustomerTableView
        customers={filteredCustomers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
      />

      {editingCustomer && (
        <EditCustomerDialog
          customer={editingCustomer}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditingCustomer(null);
          }}
        />
      )}

      {resetPasswordState.customer && (
        <ResetPasswordDialog
          open={resetPasswordState.isOpen}
          onOpenChange={(open) => {
            setResetPasswordState({ isOpen: open, customer: open ? resetPasswordState.customer : null });
          }}
          userType="customer"
          userId={resetPasswordState.customer.id}
          userName={resetPasswordState.customer.companyName}
          username={resetPasswordState.customer.user?.username}
        />
      )}

      {createAccountState.customer && (
        <CreateCustomerAccountDialog
          open={createAccountState.isOpen}
          onOpenChange={(open) => {
            setCreateAccountState({ isOpen: open, customer: open ? createAccountState.customer : null });
          }}
          customer={createAccountState.customer}
          onAccountCreated={handleAccountCreated}
        />
      )}

      <BlockCustomerModal
        isOpen={blockModalState.isOpen}
        onClose={handleBlockModalClose}
        onConfirm={handleBlockConfirm}
        action={blockModalState.action}
        customerName={blockModalState.customer ? blockModalState.customer.companyName : ""}
        loading={loading}
      />

      {!loading && customers.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-12 border rounded-lg">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">{t("admin.customers.noCustomersFound")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("admin.customers.getStartedMessage")}
          </p>
          <AddCustomerDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" /> {t("admin.customers.addCustomer")}
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default CustomersPage;

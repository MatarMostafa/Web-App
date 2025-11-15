"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Search, Plus, Building } from "lucide-react";
import CustomerTableView from "@/components/admin/CustomerTableView";
import AddCustomerDialog from "@/components/admin/AddCustomerDialog";
import EditCustomerDialog from "@/components/admin/EditCustomerDialog";
import { useCustomerStore } from "@/store/customerStore";
import { Customer } from "@/types/customer";
import { useTranslation } from "@/hooks/useTranslation";

const CustomersPage = () => {
  const { t } = useTranslation();
  const { customers, loading, fetchCustomers, deleteCustomer } =
    useCustomerStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">{t("admin.customers.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.customers.subtitle")}
          </p>
        </div>
        <AddCustomerDialog
          trigger={
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> {t("admin.customers.addCustomer")}
            </Button>
          }
        />
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

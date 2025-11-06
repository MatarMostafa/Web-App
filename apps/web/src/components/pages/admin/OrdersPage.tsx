"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Search, Plus, Package, LogOut } from "lucide-react";
import OrderTableView from "@/components/admin/OrderTableView";
import AddOrderDialog from "@/components/admin/AddOrderDialog";
import EditOrderDialog from "@/components/admin/EditOrderDialog";
import { OrderNotesDialog } from "@/components/order-notes";
import { useOrderStore } from "@/store/orderStore";
import { Order } from "@/types/order";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

const OrdersPage = () => {
  const { t, ready } = useTranslation();
  
  if (!ready) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  const { orders, loading, fetchOrders, deleteOrder, getOrderEmployeeNames } = useOrderStore();
  const [assignedEmployees, setAssignedEmployees] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [notesOrder, setNotesOrder] = useState<Order | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.location &&
        order.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.description &&
        order.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("admin.orders.confirmDelete"))) {
      try {
        await deleteOrder(id);
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(t("admin.orders.form.deleteError"));
      }
    }
  };

  const handleViewNotes = async (order: Order) => {
    setNotesOrder(order);
    setNotesDialogOpen(true);
    
    // Fetch employee names for this order
    if (!assignedEmployees[order.id]) {
      try {
        const employeeNames = await getOrderEmployeeNames(order.id);
        setAssignedEmployees(prev => ({ ...prev, [order.id]: employeeNames }));
      } catch (error) {
        console.error('Failed to fetch employee names:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">{t("admin.orders.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.orders.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <AddOrderDialog
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> {t("admin.orders.addOrder")}
              </Button>
            }
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("admin.orders.searchPlaceholder")}
            className="pl-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <OrderTableView
        orders={filteredOrders}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewNotes={handleViewNotes}
      />

      {editingOrder && (
        <EditOrderDialog
          order={editingOrder}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditingOrder(null);
          }}
        />
      )}

      {notesOrder && (
        <OrderNotesDialog
          orderId={notesOrder.id}
          orderNumber={notesOrder.orderNumber}
          orderStatus={notesOrder.status}
          orderDetails={{
            scheduledDate: notesOrder.scheduledDate,
            location: notesOrder.location,
            assignedEmployee: assignedEmployees[notesOrder.id] || "Loading..."
          }}
          open={notesDialogOpen}
          onOpenChange={(open) => {
            setNotesDialogOpen(open);
            if (!open) setNotesOrder(null);
          }}
          userRole="ADMIN"
        />
      )}

      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-12 border rounded-lg">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">{t("admin.orders.noOrdersFound")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("admin.orders.getStartedMessage")}
          </p>
          <AddOrderDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" /> {t("admin.orders.addOrder")}
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

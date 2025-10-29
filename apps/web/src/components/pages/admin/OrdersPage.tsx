"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Search, Plus, Package, LogOut } from "lucide-react";
import OrderTableView from "@/components/admin/OrderTableView";
import AddOrderDialog from "@/components/admin/AddOrderDialog";
import EditOrderDialog from "@/components/admin/EditOrderDialog";
import { useOrderStore } from "@/store/orderStore";
import { Order } from "@/types/order";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const OrdersPage = () => {
  const { orders, loading, fetchOrders, deleteOrder } = useOrderStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(id);
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete order");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Orders</h1>
          <p className="text-muted-foreground">
            Manage your organization's orders
          </p>
        </div>
        <div className="flex gap-2">
          <AddOrderDialog
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Add Order
              </Button>
            }
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search orders by number, location, or description..."
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

      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-12 border rounded-lg">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No orders found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first order
          </p>
          <AddOrderDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Order
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

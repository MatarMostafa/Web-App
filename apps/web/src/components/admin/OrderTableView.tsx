"use client";
import React from "react";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Edit, Trash2, Calendar, MapPin, Users, MessageSquare } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface OrderTableViewProps {
  orders: Order[];
  loading: boolean;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onViewNotes: (order: Order) => void;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DRAFT:
      return "bg-gray-100 text-gray-800";
    case OrderStatus.OPEN:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.ACTIVE:
      return "bg-green-100 text-green-800";
    case OrderStatus.IN_PROGRESS:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.IN_REVIEW:
      return "bg-orange-100 text-orange-800";
    case OrderStatus.COMPLETED:
      return "bg-emerald-100 text-emerald-800";
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    case OrderStatus.EXPIRED:
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const OrderTableView: React.FC<OrderTableViewProps> = ({
  orders,
  loading,
  onEdit,
  onDelete,
  onViewNotes,
}) => {
  const { t, ready } = useTranslation();
  
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
  const { currentPage, setCurrentPage, paginatedItems, totalItems } = usePagination(orders);

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DRAFT:
        return t("admin.orders.status.draft");
      case OrderStatus.OPEN:
        return t("admin.orders.status.open");
      case OrderStatus.ACTIVE:
        return t("admin.orders.status.active");
      case OrderStatus.IN_PROGRESS:
        return t("admin.orders.status.inProgress");
      case OrderStatus.COMPLETED:
        return t("admin.orders.status.completed");
      case OrderStatus.CANCELLED:
        return t("admin.orders.status.cancelled");
      case OrderStatus.EXPIRED:
        return t("admin.orders.status.expired");
      default:
        return String(status).replace("_", " ");
    }
  };
  if (loading) {
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">{t("admin.orders.table.order")}</th>
              <th className="text-left p-4 font-medium">{t("admin.orders.table.status")}</th>
              <th className="text-left p-4 font-medium">{t("admin.orders.table.scheduledDate")}</th>
              <th className="text-left p-4 font-medium">{t("admin.orders.table.location")}</th>
              <th className="text-left p-4 font-medium">{t("admin.orders.table.requiredStaff")}</th>
              <th className="text-left p-4 font-medium">{t("admin.orders.table.priority")}</th>
              <th className="text-right p-4 font-medium">{t("admin.orders.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((order) => (
              <tr key={order.id} className="border-t hover:bg-muted/25">
                <td className="p-4">
                  <div>
                    <button
                      onClick={() => window.location.href = `/dashboard-admin/orders/${order.id}`}
                      className="font-medium text-primary hover:underline cursor-pointer"
                    >
                      #{order.orderNumber}
                    </button>
                    <div className="text-sm text-muted-foreground">
                      {order.description || t("admin.orders.table.noDescription")}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(order.scheduledDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  {order.location ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.location}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{order.requiredEmployees}</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline">P{order.priority}</Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewNotes(order)}
                      className="relative"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {order.status === OrderStatus.IN_REVIEW && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-orange-500 rounded-full" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(order)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(order.id)}
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

export default OrderTableView;
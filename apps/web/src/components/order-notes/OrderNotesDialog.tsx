"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Badge } from "@/components/ui";
import { OrderStatus } from "@/types/order";
import { NotesThread } from "./NotesThread";
import { NoteComposer } from "./NoteComposer";
import { Calendar, MapPin, User } from "lucide-react";
import { orderNotesApi, OrderNote } from "@/lib/orderNotesApi";
import { useOrderStore } from "@/store/orderStore";
import { useEmployeeOrderStore } from "@/store/employee/employeeOrderStore";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface OrderNotesDialogProps {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  orderDetails?: {
    scheduledDate: string;
    location?: string;
    assignedEmployee?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: "ADMIN" | "EMPLOYEE" | "TEAM_LEADER";
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

export const OrderNotesDialog: React.FC<OrderNotesDialogProps> = ({
  orderId,
  orderNumber,
  orderStatus: initialOrderStatus,
  orderDetails,
  open,
  onOpenChange,
  userRole,
}) => {
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [loading, setLoading] = useState(false);
  const { updateOrderStatus, orders } = useOrderStore();
  const { employeeAssignments, fetchEmployeeAssignments } = useEmployeeOrderStore();
  const { data: session } = useSession();
  
  // Use state to track current status for real-time updates
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialOrderStatus);
  
  // Get current order status from appropriate store based on user role
  const adminOrder = orders.find(order => order.id === orderId);
  const employeeAssignment = employeeAssignments.find(a => a.order.id === orderId);
  const employeeOrder = employeeAssignment?.order;
  
  const currentOrder = userRole === "ADMIN" ? adminOrder : employeeOrder;
  const orderStatus = currentOrder?.status || currentStatus;
  
  // Update local status when order from store changes
  useEffect(() => {
    if (currentOrder?.status && currentOrder.status !== currentStatus) {
      setCurrentStatus(currentOrder.status as OrderStatus);
    }
  }, [currentOrder?.status, currentStatus]);
  

  // Fetch notes and refresh order status when dialog opens
  useEffect(() => {
    if (open && orderId) {
      fetchNotes();
      // Refresh the specific order's status from the store
      refreshOrderStatus();
      // Also refresh order data from API
      refreshOrderData();
    }
  }, [open, orderId]);
  
  // Also refresh when the dialog is already open and order data changes
  useEffect(() => {
    if (open && orderId) {
      refreshOrderStatus();
    }
  }, [open, orderId, orders, employeeAssignments]);

  // Listen for notification-triggered opens and force refresh
  useEffect(() => {
    const handleNotificationRefresh = () => {
      if (open && orderId) {
        fetchNotes();
        refreshOrderData();
        setTimeout(() => refreshOrderStatus(), 500);
      }
    };

    // Add a small delay to ensure the dialog is fully open
    if (open) {
      setTimeout(handleNotificationRefresh, 100);
    }
  }, [open]);
  
  const refreshOrderStatus = () => {
    // Try to get updated order from appropriate store
    if (userRole === "ADMIN") {
      const currentOrder = useOrderStore.getState().orders.find(order => order.id === orderId);
      if (currentOrder && currentOrder.status !== currentStatus) {
       setCurrentStatus(currentOrder.status);
      }
    } else {
      const assignment = useEmployeeOrderStore.getState().employeeAssignments.find(a => a.order.id === orderId);
      if (assignment?.order && assignment.order.status !== currentStatus) {
        setCurrentStatus(assignment.order.status as OrderStatus);
      }
    }
  };

  const refreshOrderData = async () => {
    try {
      if (userRole === "ADMIN") {
        // Refresh orders for admin
        const { fetchOrders } = useOrderStore.getState();
        await fetchOrders();
      } else {
        // Refresh employee assignments
        if (session?.user?.id) {
          await fetchEmployeeAssignments(session.user.id);
        }
      }
    } catch (error) {
      console.error('Failed to refresh order data:', error);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const fetchedNotes = await orderNotesApi.getOrderNotes(orderId);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleNoteCreated = (newNote: OrderNote) => {
    setNotes((prev) => [newNote, ...prev]); // Add new note at the beginning
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    // Update local state immediately for real-time UI updates
    setCurrentStatus(newStatus);
    
    // Update appropriate store based on user role
    if (userRole === "ADMIN") {
      updateOrderStatus(orderId, newStatus);
    } else {
      // For employees, update the assignment's order status
      const { employeeAssignments } = useEmployeeOrderStore.getState();
      const updatedAssignments = employeeAssignments.map(assignment => {
        if (assignment.order.id === orderId) {
          return {
            ...assignment,
            order: { ...assignment.order, status: newStatus }
          };
        }
        return assignment;
      });
      useEmployeeOrderStore.setState({ employeeAssignments: updatedAssignments });
    }
    
    // Refresh notes to get updated status
    fetchNotes();
    // Force a refresh of the order status
    setTimeout(() => refreshOrderStatus(), 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] h-[90vh] p-0 sm:w-full">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <DialogTitle className="text-lg sm:text-xl truncate">
                Order #{orderNumber}
              </DialogTitle>
              <Badge
                className={`${getStatusColor(orderStatus as OrderStatus)} text-xs whitespace-nowrap flex-shrink-0 mr-4`}
              >
                {orderStatus === "IN_PROGRESS"
                  ? "In Progress"
                  : orderStatus === "IN_REVIEW"
                    ? "In Review"
                    : orderStatus.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
              {orderDetails?.scheduledDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>
                    {new Date(orderDetails.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {orderDetails?.location && (
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">{orderDetails.location}</span>
                </div>
              )}
              {orderDetails?.assignedEmployee && (
                <div className="flex items-start gap-1">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 mt-0.5" />
                  <span className="wrap-break-words flex-1">
                    {orderDetails.assignedEmployee}
                  </span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-140px)] sm:h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-hidden">
            <NotesThread
              orderId={orderId}
              notes={notes}
              loading={loading}
              userRole={userRole}
            />
          </div>

          <div className="border-t bg-background">
            <NoteComposer
              orderId={orderId}
              userRole={userRole}
              orderStatus={orderStatus as OrderStatus}
              onNoteCreated={handleNoteCreated}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

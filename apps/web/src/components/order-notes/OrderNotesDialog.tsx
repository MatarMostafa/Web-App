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
    case OrderStatus.IN_PROGRESS:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.IN_REVIEW:
      return "bg-orange-100 text-orange-800";
    case OrderStatus.COMPLETED:
      return "bg-green-100 text-green-800";
    case OrderStatus.ACTIVE:
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const OrderNotesDialog: React.FC<OrderNotesDialogProps> = ({
  orderId,
  orderNumber,
  orderStatus,
  orderDetails,
  open,
  onOpenChange,
  userRole,
}) => {
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notes when dialog opens
  useEffect(() => {
    if (open && orderId) {
      fetchNotes();
    }
  }, [open, orderId]);

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
    setNotes((prev) => [...prev, newNote]);
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    // Refresh notes to get updated status
    fetchNotes();
    // Notify parent component of status change
    console.log("Status changed to:", newStatus);
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
                className={`${getStatusColor(orderStatus)} text-xs whitespace-nowrap flex-shrink-0 mr-4`}
              >
                {orderStatus === "IN_PROGRESS"
                  ? "In Progress"
                  : orderStatus === "IN_REVIEW"
                    ? "In Review"
                    : orderStatus.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
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
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{orderDetails.location}</span>
                </div>
              )}
              {orderDetails?.assignedEmployee && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">
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
              orderStatus={orderStatus}
              onNoteCreated={handleNoteCreated}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

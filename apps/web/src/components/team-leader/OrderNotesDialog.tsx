"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Badge } from "@/components/ui";
import { NotesThread } from "../order-notes/NotesThread";
import { NoteComposer } from "../order-notes/NoteComposer";
import { Calendar, MapPin, User } from "lucide-react";
import { orderNotesApi, OrderNote } from "@/lib/orderNotesApi";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface OrderNotesDialogProps {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  orderDetails?: {
    scheduledDate: string;
    location?: string;
    assignedEmployee?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (orderId: string, newStatus: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'draft':
      return "bg-gray-100 text-gray-800";
    case 'open':
      return "bg-blue-100 text-blue-800";
    case 'active':
      return "bg-green-100 text-green-800";
    case 'in_progress':
      return "bg-yellow-100 text-yellow-800";
    case 'in_review':
      return "bg-orange-100 text-orange-800";
    case 'completed':
      return "bg-emerald-100 text-emerald-800";
    case 'cancelled':
      return "bg-red-100 text-red-800";
    case 'expired':
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const TeamLeaderOrderNotesDialog: React.FC<OrderNotesDialogProps> = ({
  orderId,
  orderNumber,
  orderStatus: initialOrderStatus,
  orderDetails,
  open,
  onOpenChange,
  onStatusChange,
}) => {
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(initialOrderStatus);
  const { data: session } = useSession();

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
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    onStatusChange?.(orderId, newStatus);
    fetchNotes();
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
                className={`${getStatusColor(currentStatus)} text-xs whitespace-nowrap flex-shrink-0 mr-4`}
              >
                {currentStatus === "IN_PROGRESS"
                  ? "In Progress"
                  : currentStatus === "IN_REVIEW"
                    ? "In Review"
                    : currentStatus.replace("_", " ")}
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
              userRole="TEAM_LEADER"
            />
          </div>

          <div className="border-t bg-background">
            <NoteComposer
              orderId={orderId}
              userRole="TEAM_LEADER"
              orderStatus={currentStatus as any}
              onNoteCreated={handleNoteCreated}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
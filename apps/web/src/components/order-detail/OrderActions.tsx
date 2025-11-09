"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Edit,
  AlertCircle,
  Clock
} from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { orderNotesApi } from "@/lib/orderNotesApi";
import { useOrderStore } from "@/store/orderStore";
import { useEmployeeOrderStore } from "@/store/employee/employeeOrderStore";
import toast from "react-hot-toast";

interface OrderActionsProps {
  orderId: string;
  order: Order;
  userRole: "ADMIN" | "EMPLOYEE";
}

const getAvailableActions = (status: OrderStatus, userRole: "ADMIN" | "EMPLOYEE") => {
  const actions = [];

  if (userRole === "ADMIN") {
    switch (status) {
      case OrderStatus.DRAFT:
      case OrderStatus.OPEN:
        actions.push({ key: "activate", label: "Activate Order", icon: Play, variant: "default" as const });
        break;
      case OrderStatus.ACTIVE:
        actions.push({ key: "start", label: "Start Work", icon: Play, variant: "default" as const });
        actions.push({ key: "cancel", label: "Cancel Order", icon: XCircle, variant: "destructive" as const });
        break;
      case OrderStatus.IN_PROGRESS:
        actions.push({ key: "review", label: "Request Review", icon: AlertCircle, variant: "default" as const });
        actions.push({ key: "complete", label: "Mark Complete", icon: CheckCircle, variant: "default" as const });
        actions.push({ key: "pause", label: "Pause Work", icon: Pause, variant: "outline" as const });
        break;
      case OrderStatus.IN_REVIEW:
        actions.push({ key: "approve", label: "Approve", icon: CheckCircle, variant: "default" as const });
        actions.push({ key: "reject", label: "Reject", icon: XCircle, variant: "destructive" as const });
        break;
    }
  } else {
    // Employee actions
    switch (status) {
      case OrderStatus.ACTIVE:
        actions.push({ key: "start", label: "Start Work", icon: Play, variant: "default" as const });
        break;
      case OrderStatus.IN_PROGRESS:
        actions.push({ key: "review", label: "Request Review", icon: AlertCircle, variant: "default" as const });
        actions.push({ key: "pause", label: "Pause Work", icon: Pause, variant: "outline" as const });
        break;
    }
  }

  return actions;
};

export const OrderActions: React.FC<OrderActionsProps> = ({
  orderId,
  order,
  userRole,
}) => {
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateOrderStatus } = useOrderStore();
  const { employeeAssignments } = useEmployeeOrderStore();

  const availableActions = getAvailableActions(order.status, userRole);

  const handleStatusChange = async (newStatus: OrderStatus, note?: string) => {
    setIsSubmitting(true);
    try {
      // Add note with status change
      await orderNotesApi.createOrderNote(orderId, {
        content: note || `Status changed to ${newStatus}`,
        triggersStatus: newStatus,
        category: 'ADMIN_RESPONSE',
        isInternal: false
      });

      // Update local store
      updateOrderStatus(orderId, newStatus);
      
      // Update employee store if needed
      if (userRole === "EMPLOYEE") {
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

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionClick = (actionKey: string) => {
    switch (actionKey) {
      case "activate":
        handleStatusChange(OrderStatus.ACTIVE, "Order activated and ready for work");
        break;
      case "start":
        handleStatusChange(OrderStatus.IN_PROGRESS, "Work started on this order");
        break;
      case "pause":
        handleStatusChange(OrderStatus.ACTIVE, "Work paused on this order");
        break;
      case "review":
        handleStatusChange(OrderStatus.IN_REVIEW, "Order submitted for review");
        break;
      case "complete":
        handleStatusChange(OrderStatus.COMPLETED, "Order marked as completed");
        break;
      case "approve":
        handleStatusChange(OrderStatus.COMPLETED, "Order approved and completed");
        break;
      case "reject":
        handleStatusChange(OrderStatus.ACTIVE, "Order rejected, returned for revision");
        break;
      case "cancel":
        handleStatusChange(OrderStatus.CANCELLED, "Order cancelled");
        break;
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    setIsSubmitting(true);
    try {
      await orderNotesApi.createOrderNote(orderId, {
        content: noteContent.trim(),
        category: 'GENERAL_UPDATE',
        isInternal: false
      });

      setNoteContent("");
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Failed to add note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {availableActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.key}
                    variant={action.variant}
                    size="sm"
                    onClick={() => handleActionClick(action.key)}
                    disabled={isSubmitting}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Note */}
      <Card>
        <CardHeader>
          <CardTitle>Add Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add a note about this order..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleAddNote}
            disabled={!noteContent.trim() || isSubmitting}
            className="w-full"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui";
import { Textarea } from "@/components/ui";
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  AlertTriangle,
  Send,
  Paperclip
} from "lucide-react";
import { OrderStatus } from "@/types/order";
import { CategorySelector } from "./CategorySelector";
import { orderNotesApi, OrderNote, CreateOrderNoteData } from "@/lib/orderNotesApi";
import toast from "react-hot-toast";

type NoteCategory = "COMPLETION_REQUEST" | "ADMIN_RESPONSE" | "GENERAL_UPDATE" | "ISSUE_REPORT";

interface NoteComposerProps {
  orderId: string;
  userRole: "ADMIN" | "EMPLOYEE" | "TEAM_LEADER";
  orderStatus: OrderStatus;
  onNoteCreated: (note: OrderNote) => void;
  onStatusChange: (newStatus: OrderStatus) => void;
}

export const NoteComposer: React.FC<NoteComposerProps> = ({
  orderId,
  userRole,
  orderStatus,
  onNoteCreated,
  onStatusChange,
}) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>("GENERAL_UPDATE");
  const [isStatusAction, setIsStatusAction] = useState(false);

  const handleSubmit = async (triggersStatus?: OrderStatus) => {
    if (!content.trim()) return;
    
    setLoading(true);
    
    try {
      // Determine category: auto for status actions, manual for general notes
      const category = triggersStatus ? 
        (triggersStatus === OrderStatus.IN_REVIEW ? "COMPLETION_REQUEST" : "ADMIN_RESPONSE") : 
        selectedCategory;
      
      const noteData: CreateOrderNoteData = {
        content: content.trim(),
        triggersStatus,
        category,
        isInternal: false,
      };
      
      const newNote = await orderNotesApi.createOrderNote(orderId, noteData);
      
      if (newNote) {
        onNoteCreated(newNote);
        if (triggersStatus) {
          onStatusChange(triggersStatus);
        }
        setContent("");
        setSelectedCategory("GENERAL_UPDATE");
        toast.success("Note added successfully");
      } else {
        toast.error("Failed to create note");
      }
      
      setIsStatusAction(false);
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  const getActionButtons = () => {
    const buttons = [];

    // Employee actions
    if (userRole === "EMPLOYEE") {
      if (orderStatus === OrderStatus.IN_PROGRESS) {
        buttons.push(
          <Button
            key="complete"
            onClick={() => {
              setIsStatusAction(true);
              handleSubmit(OrderStatus.IN_REVIEW);
            }}
            disabled={!content.trim() || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Mark Complete</span>
          </Button>
        );
      }
      
      buttons.push(
        <Button
          key="update"
          variant="outline"
          onClick={() => {
            setIsStatusAction(false);
            handleSubmit();
          }}
          disabled={!content.trim() || loading}
        >
          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">Add Note</span>
        </Button>
      );
    }

    // Admin actions
    if (userRole === "ADMIN" || userRole === "TEAM_LEADER") {
      if (orderStatus === OrderStatus.IN_REVIEW) {
        buttons.push(
          <Button
            key="approve"
            onClick={() => {
              setIsStatusAction(true);
              handleSubmit(OrderStatus.COMPLETED);
            }}
            disabled={!content.trim() || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Approve</span>
          </Button>
        );
        
        buttons.push(
          <Button
            key="request-changes"
            variant="outline"
            onClick={() => {
              setIsStatusAction(true);
              handleSubmit(OrderStatus.IN_PROGRESS);
            }}
            disabled={!content.trim() || loading}
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Changes</span>
          </Button>
        );
      } else {
        buttons.push(
          <Button
            key="instructions"
            variant="outline"
            onClick={() => {
              setIsStatusAction(false);
              handleSubmit();
            }}
            disabled={!content.trim() || loading}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        );
      }
    }

    return buttons;
  };

  return (
    <div className="p-3 sm:p-4 space-y-3">
      <div className="space-y-3">
        {/* Category Selector - only show for general notes */}
        {!isStatusAction && (
          <CategorySelector
            value={selectedCategory}
            onChange={setSelectedCategory}
            userRole={userRole}
          />
        )}
        
        <Textarea
          placeholder={
            orderStatus === OrderStatus.IN_REVIEW && userRole === "ADMIN"
              ? "Review the completed work and provide feedback..."
              : orderStatus === OrderStatus.IN_PROGRESS && userRole === "EMPLOYEE"
              ? "Add an update or mark work as complete..."
              : "Add a note..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[60px] sm:min-h-[80px] resize-none text-sm"
          disabled={loading}
        />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs sm:text-sm"
              disabled={loading}
            >
              <Paperclip className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Attach
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {getActionButtons()}
          </div>
        </div>
      </div>
      
      {orderStatus === OrderStatus.IN_REVIEW && (
        <div className="text-xs text-muted-foreground bg-orange-50 p-2 rounded border border-orange-200">
          <AlertTriangle className="h-3 w-3 inline mr-1" />
          This order is awaiting review. {userRole === "ADMIN" ? "Please review and approve or request changes." : "Waiting for admin review."}
        </div>
      )}
    </div>
  );
};
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
} from "lucide-react";
import { OrderStatus } from "@/types/order";
import { CategorySelector } from "./CategorySelector";
import {
  orderNotesApi,
  OrderNote,
  CreateOrderNoteData,
} from "@/lib/orderNotesApi";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

type NoteCategory =
  | "COMPLETION_REQUEST"
  | "ADMIN_RESPONSE"
  | "GENERAL_UPDATE"
  | "ISSUE_REPORT";

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
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<NoteCategory>("GENERAL_UPDATE");
  const [isStatusAction, setIsStatusAction] = useState(false);

  const handleSubmit = async (triggersStatus?: OrderStatus) => {
    if (!content.trim()) return;

    setLoading(true);

    try {
      // Determine category: auto for status actions, manual for general notes
      const category = triggersStatus
        ? triggersStatus === OrderStatus.IN_REVIEW
          ? "COMPLETION_REQUEST"
          : triggersStatus === OrderStatus.IN_PROGRESS
            ? "GENERAL_UPDATE"
            : triggersStatus === OrderStatus.COMPLETED
              ? "ADMIN_RESPONSE"
              : "GENERAL_UPDATE"
        : selectedCategory;

      const noteData: CreateOrderNoteData = {
        content: content.trim(),
        triggersStatus,
        category,
        isInternal: false,
      };

      const newNote = await orderNotesApi.createOrderNote(orderId, noteData);

      if (newNote) {
        onNoteCreated(newNote);
        setContent("");
        setSelectedCategory("GENERAL_UPDATE");
        toast.success(t('orderNotes.noteAddedSuccess'));

        // Trigger status change after successful note creation
        if (triggersStatus) {
          onStatusChange(triggersStatus);
        }
      } else {
        toast.error(t('orderNotes.failedToCreateNote'));
      }

      setIsStatusAction(false);
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error(t('orderNotes.failedToCreateNote'));
    } finally {
      setLoading(false);
    }
  };

  const getActionButtons = () => {
    const buttons = [];

    // Employee actions
    if (userRole === "EMPLOYEE") {
      if (orderStatus === OrderStatus.ACTIVE) {
        buttons.push(
          <Button
            key="start"
            onClick={() => {
              setIsStatusAction(true);
              handleSubmit(OrderStatus.IN_PROGRESS);
            }}
            disabled={!content.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">{t('orderNotes.actions.startWork')}</span>
          </Button>
        );
      }

      if (orderStatus === OrderStatus.IN_PROGRESS) {
        buttons.push(
          <Button
            key="complete"
            onClick={() => {
              setIsStatusAction(true);
              handleSubmit(OrderStatus.IN_REVIEW); // Send IN_REVIEW directly
            }}
            disabled={!content.trim() || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">{t('orderNotes.actions.markComplete')}</span>
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
          <span className="text-xs sm:text-sm">{t('orderNotes.actions.addNote')}</span>
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
            <span className="text-xs sm:text-sm">{t('orderNotes.actions.approve')}</span>
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
            <span className="text-xs sm:text-sm">{t('orderNotes.actions.requestChanges')}</span>
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
            {t('orderNotes.actions.addNote')}
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
          placeholder={t(
            orderStatus === OrderStatus.IN_REVIEW && userRole === "ADMIN"
              ? 'orderNotes.placeholders.reviewWork'
              : orderStatus === OrderStatus.ACTIVE && userRole === "EMPLOYEE"
                ? 'orderNotes.placeholders.startWork'
                : orderStatus === OrderStatus.IN_PROGRESS &&
                    userRole === "EMPLOYEE"
                  ? 'orderNotes.placeholders.updateOrComplete'
                  : 'orderNotes.placeholders.addNote'
          )}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[60px] sm:min-h-20 resize-none text-sm"
          disabled={loading}
        />

        <div className="flex justify-end">
          <div className="flex flex-wrap items-center gap-2">
            {getActionButtons()}
          </div>
        </div>
      </div>

      {orderStatus === OrderStatus.IN_REVIEW && (
        <div className="text-xs text-muted-foreground bg-orange-50 p-2 rounded border border-orange-200">
          <AlertTriangle className="h-3 w-3 inline mr-1" />
          {t('orderNotes.status.awaitingReview')}{" "}
          {userRole === "ADMIN"
            ? t('orderNotes.status.pleaseReview')
            : t('orderNotes.status.waitingForReview')}
        </div>
      )}

      {orderStatus === OrderStatus.ACTIVE && userRole === "EMPLOYEE" && (
        <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border border-blue-200">
          <CheckCircle className="h-3 w-3 inline mr-1" />
          {t('orderNotes.status.orderAssigned')}
        </div>
      )}
    </div>
  );
};

"use client";
import React from "react";
import { ScrollArea } from "@/components/ui";
import { NoteItem } from "./NoteItem";
import { OrderNote } from "@/lib/orderNotesApi";

interface NotesThreadProps {
  orderId: string;
  notes: OrderNote[];
  loading: boolean;
  userRole: "ADMIN" | "EMPLOYEE" | "TEAM_LEADER";
}

export const NotesThread: React.FC<NotesThreadProps> = ({
  orderId,
  notes,
  loading,
  userRole,
}) => {
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 sm:h-4 bg-muted rounded w-1/4" />
                  <div className="h-12 sm:h-16 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4 sm:p-6">
        <div className="text-center text-muted-foreground">
          <div className="text-base sm:text-lg font-medium">No notes yet</div>
          <div className="text-xs sm:text-sm">Start the conversation by adding a note below</div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            userRole={userRole}
            canEdit={false} // Will be determined by backend
          />
        ))}
      </div>
    </ScrollArea>
  );
};
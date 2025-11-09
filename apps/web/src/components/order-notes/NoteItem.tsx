"use client";
import React from "react";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { 
  CheckCircle, 
  Shield, 
  MessageSquare, 
  AlertTriangle,
  Edit,
  Trash2,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { OrderNote } from "@/lib/orderNotesApi";

interface NoteItemProps {
  note: OrderNote;
  userRole: "ADMIN" | "EMPLOYEE" | "TEAM_LEADER";
  canEdit: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "COMPLETION_REQUEST":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "ADMIN_RESPONSE":
      return <Shield className="h-4 w-4 text-blue-600" />;
    case "ISSUE_REPORT":
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <MessageSquare className="h-4 w-4 text-gray-600" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "COMPLETION_REQUEST":
      return "bg-green-50 border-green-200";
    case "ADMIN_RESPONSE":
      return "bg-blue-50 border-blue-200";
    case "ISSUE_REPORT":
      return "bg-red-50 border-red-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "COMPLETION_REQUEST":
      return "Completion Request";
    case "ADMIN_RESPONSE":
      return "Admin Response";
    case "ISSUE_REPORT":
      return "Issue Report";
    case "GENERAL_UPDATE":
      return "Update";
    default:
      return category;
  }
};

export const NoteItem: React.FC<NoteItemProps> = ({
  note,
  userRole,
  canEdit,
}) => {
  const isOwnNote = false; // Will be determined by comparing authorId with current user

  return (
    <div className={`border rounded-lg p-4 ${getCategoryColor(note.category)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getCategoryIcon(note.category)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">{note.authorName}</span>
              <Badge variant="outline" className="text-xs">
                {getCategoryLabel(note.category)}
              </Badge>
              {note.isInternal && (
                <Badge variant="secondary" className="text-xs">
                  Internal
                </Badge>
              )}
              {note.triggersStatus && (
                <Badge variant="default" className="text-xs">
                  → {note.triggersStatus.replace("_", " ")}
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-foreground whitespace-pre-wrap break-words">
              {note.content}
            </div>
            
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        
        {canEdit && isOwnNote && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
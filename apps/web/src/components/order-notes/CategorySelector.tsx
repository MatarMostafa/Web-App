"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Label } from "@/components/ui";
import { 
  MessageSquare, 
  AlertTriangle, 
  Shield,
  CheckCircle
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type NoteCategory = "COMPLETION_REQUEST" | "ADMIN_RESPONSE" | "GENERAL_UPDATE" | "ISSUE_REPORT";

interface CategorySelectorProps {
  value: NoteCategory;
  onChange: (category: NoteCategory) => void;
  userRole: "ADMIN" | "EMPLOYEE" | "TEAM_LEADER";
}



export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  userRole,
}) => {
  const { t } = useTranslation();
  
  const categoryOptions = {
    GENERAL_UPDATE: {
      label: t('orderNotes.categories.generalUpdate.label'),
      icon: MessageSquare,
      description: t('orderNotes.categories.generalUpdate.description')
    },
    ISSUE_REPORT: {
      label: t('orderNotes.categories.issueReport.label'), 
      icon: AlertTriangle,
      description: t('orderNotes.categories.issueReport.description')
    },
    ADMIN_RESPONSE: {
      label: t('orderNotes.categories.adminResponse.label'),
      icon: Shield,
      description: t('orderNotes.categories.adminResponse.description')
    },
    COMPLETION_REQUEST: {
      label: t('orderNotes.categories.completionRequest.label'),
      icon: CheckCircle,
      description: t('orderNotes.categories.completionRequest.description')
    }
  };

  const availableCategories = userRole === "ADMIN" 
    ? ["GENERAL_UPDATE", "ISSUE_REPORT", "ADMIN_RESPONSE"] as NoteCategory[]
    : ["GENERAL_UPDATE", "ISSUE_REPORT"] as NoteCategory[];

  // Ensure the current value is valid for the user role
  React.useEffect(() => {
    if (!availableCategories.includes(value)) {
      onChange("GENERAL_UPDATE");
    }
  }, [value, availableCategories, onChange]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{t('orderNotes.noteType')}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              {(() => {
                const option = categoryOptions[value];
                const Icon = option.icon;
                return (
                  <>
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </>
                );
              })()}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableCategories.map((category) => {
            const option = categoryOptions[category];
            const Icon = option.icon;
            return (
              <SelectItem key={category} value={category}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, User, Play } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { AssignmentStatus } from "@/types/order";

interface TeamStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  assignments: any[];
}

export const TeamStartModal: React.FC<TeamStartModalProps> = ({
  isOpen,
  onClose,
  orderId,
  assignments = [],
}) => {
  const { t } = useTranslation();
  const { startWork, loading } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Filter those who are ASSIGNED or already ACTIVE
  const startableAssignments = assignments.filter(
    (a) => a.status === AssignmentStatus.ASSIGNED || a.status === AssignmentStatus.ACTIVE
  );

  const filteredAssignments = startableAssignments.filter((a) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${a.employee?.firstName || ""} ${a.employee?.lastName || ""}`.toLowerCase();
    const code = (a.employee?.employeeCode || "").toLowerCase();
    return fullName.includes(searchLower) || code.includes(searchLower);
  });

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      // By default, select all startable employees
      setSelectedEmployees(startableAssignments.map((a) => a.employeeId));
    }
  }, [isOpen, assignments]);

  const handleToggle = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleStart = async () => {
    if (selectedEmployees.length === 0) return;
    await startWork(orderId, selectedEmployees);
    onClose();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            {t("order.startWork")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col pt-2">
          <p className="text-sm text-muted-foreground">
            {t("order.selectTeammates")}
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("common.searchEmployees")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground text-sm">
                  {searchTerm ? t("admin.employees.noEmployeesFound") : t("messages.noDataFound")}
                </p>
              </div>
            ) : (
              filteredAssignments.map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 p-3 border rounded-xl transition-all cursor-pointer ${
                    selectedEmployees.includes(a.employeeId)
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "hover:bg-accent border-transparent"
                  }`}
                  onClick={() => handleToggle(a.employeeId)}
                >
                  <Checkbox
                    checked={selectedEmployees.includes(a.employeeId)}
                    onCheckedChange={() => handleToggle(a.employeeId)}
                  />
                  
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback className="bg-muted text-xs">
                      {getInitials(a.employee?.firstName, a.employee?.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {a.employee?.firstName} {a.employee?.lastName}
                      </span>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {a.employee?.employeeCode}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-auto">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleStart}
              disabled={selectedEmployees.length === 0 || loading}
              className="min-w-[120px]"
            >
              {loading ? t("common.loading") : t("order.startWork")}
              {!loading && selectedEmployees.length > 0 && ` (${selectedEmployees.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

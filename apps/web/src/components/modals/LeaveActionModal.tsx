"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface LeaveActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  action: "approve" | "reject";
  employeeName: string;
  leaveType: string;
  loading?: boolean;
}

const LeaveActionModal: React.FC<LeaveActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  employeeName,
  leaveType,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (action === "approve") {
      // For approval, just confirm without requiring reason
      onConfirm(reason.trim() || undefined);
      setReason("");
    } else {
      // For rejection, pass the reason
      onConfirm(reason.trim() || undefined);
      setReason("");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const isApprove = action === "approve";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            {isApprove ? t("admin.leaveManagement.modal.approveTitle") : t("admin.leaveManagement.modal.rejectTitle")}
          </DialogTitle>
          <DialogDescription>
            {isApprove 
              ? `Approve ${leaveType.toLowerCase().replace('_', ' ')} request for`
              : `Reject ${leaveType.toLowerCase().replace('_', ' ')} request for`
            }{" "}
            <span className="font-medium">{employeeName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">
              {isApprove ? t("admin.leaveManagement.modal.approvalNote") : t("admin.leaveManagement.modal.rejectionReason")}{" "}
              <span className="text-muted-foreground">{t("admin.leaveManagement.modal.optional")}</span>
            </Label>
            <Textarea
              id="reason"
              placeholder={
                isApprove
                  ? t("admin.leaveManagement.modal.approvalNotePlaceholder")
                  : t("admin.leaveManagement.modal.rejectionReasonPlaceholder")
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {t("admin.leaveManagement.modal.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={
              isApprove
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {loading ? t("admin.leaveManagement.modal.processing") : isApprove ? t("admin.leaveManagement.modal.approve") : t("admin.leaveManagement.modal.reject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveActionModal;
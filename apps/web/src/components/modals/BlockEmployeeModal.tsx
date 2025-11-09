"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, ShieldOff } from "lucide-react";
import { useTranslation } from '@/hooks/useTranslation';

interface BlockEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  action: "block" | "unblock";
  employeeName: string;
  loading?: boolean;
}

const BlockEmployeeModal: React.FC<BlockEmployeeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  employeeName,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (action === "block") {
      onConfirm(reason.trim() || undefined);
    } else {
      onConfirm();
    }
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const isBlock = action === "block";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBlock ? (
              <Shield className="h-5 w-5 text-red-600" />
            ) : (
              <ShieldOff className="h-5 w-5 text-green-600" />
            )}
            {isBlock ? t('admin.employees.blockModal.blockTitle') : t('admin.employees.blockModal.unblockTitle')}
          </DialogTitle>
          <DialogDescription>
            {isBlock ? (
              <>
                <span className="font-medium">{employeeName}</span> {t('admin.employees.blockModal.blockDescription')}
              </>
            ) : (
              <>
                <span className="font-medium">{employeeName}</span> {t('admin.employees.blockModal.unblockDescription')}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isBlock && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">
                {t('admin.employees.blockModal.blockReason')} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder={t('admin.employees.blockModal.blockReasonPlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {t('admin.employees.blockModal.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || (isBlock && !reason.trim())}
            className={
              isBlock
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }
          >
            {loading ? t('admin.employees.blockModal.processing') : isBlock ? t('admin.employees.blockModal.blockEmployee') : t('admin.employees.blockModal.unblockEmployee')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlockEmployeeModal;
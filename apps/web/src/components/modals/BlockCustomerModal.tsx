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

interface BlockCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  action: "block" | "unblock";
  customerName: string;
  loading?: boolean;
}

const BlockCustomerModal: React.FC<BlockCustomerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  customerName,
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
    onClose();
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
              <ShieldOff className="h-5 w-5 text-red-600" />
            ) : (
              <Shield className="h-5 w-5 text-green-600" />
            )}
            {isBlock ? t('admin.customers.blockModal.blockTitle') : t('admin.customers.blockModal.unblockTitle')}
          </DialogTitle>
          <DialogDescription>
            {isBlock ? (
              <>
                <span className="font-medium">{customerName}</span> {t('admin.customers.blockModal.blockDescription')}
              </>
            ) : (
              <>
                <span className="font-medium">{customerName}</span> {t('admin.customers.blockModal.unblockDescription')}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isBlock && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">
                {t('admin.customers.blockModal.blockReason')} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder={t('admin.customers.blockModal.blockReasonPlaceholder')}
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
            {t('admin.customers.blockModal.cancel')}
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
            {loading ? t('admin.customers.blockModal.processing') : isBlock ? t('admin.customers.blockModal.blockCustomer') : t('admin.customers.blockModal.unblockCustomer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlockCustomerModal;
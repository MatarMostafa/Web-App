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
            {isBlock ? "Block" : "Unblock"} Employee
          </DialogTitle>
          <DialogDescription>
            {isBlock ? (
              <>
                Block <span className="font-medium">{employeeName}</span>? This will prevent them from accessing the system.
              </>
            ) : (
              <>
                Unblocking <span className="font-medium">{employeeName}</span> will restore their system access and allow them to resume normal activities.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isBlock && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">
                Block Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Provide a reason for blocking this employee..."
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
            Cancel
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
            {loading ? "Processing..." : isBlock ? "Block Employee" : "Unblock Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlockEmployeeModal;
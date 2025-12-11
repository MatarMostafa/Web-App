import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Eye, EyeOff, RefreshCw, Copy, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { SubAccount } from "@/types/subAccount";

interface ResetSubAccountPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subAccount: SubAccount;
}

export default function ResetSubAccountPasswordDialog({
  open,
  onOpenChange,
  subAccount,
}: ResetSubAccountPasswordDialogProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success(t("customerPortal.subAccounts.resetPassword.passwordCopied"));
    } catch (error) {
      toast.error(t("customerPortal.subAccounts.resetPassword.copyFailed"));
    }
  };

  const handleResetPassword = async () => {
    if (!password.trim()) {
      toast.error(t("customerPortal.subAccounts.resetPassword.passwordRequired"));
      return;
    }

    if (password.length < 8) {
      toast.error(t("customerPortal.subAccounts.resetPassword.passwordTooShort"));
      return;
    }

    setLoading(true);
    try {
      await apiClient.put(`/api/sub-accounts/${subAccount.id}/reset-password`, {
        newPassword: password
      });
      
      toast.success(t("customerPortal.subAccounts.resetPassword.resetSuccess", { name: subAccount.name }));
      onOpenChange(false);
      setPassword("");
    } catch (error: any) {
      toast.error(error.message || t("customerPortal.subAccounts.resetPassword.resetFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setPassword("");
    setShowPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("customerPortal.subAccounts.resetPassword.title")}
          </DialogTitle>
          <div className="text-sm text-gray-600 mt-2">
            <div><strong>{t('common.name')}:</strong> {subAccount.name}</div>
            <div><strong>{t('common.username')}:</strong> {subAccount.user?.username}</div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("customerPortal.subAccounts.resetPassword.newPassword")}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("customerPortal.subAccounts.resetPassword.enterPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateRandomPassword}
                title={t("customerPortal.subAccounts.resetPassword.generateRandom")}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              {password && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  title={t("customerPortal.subAccounts.resetPassword.copyToClipboard")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={loading || !password.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("customerPortal.subAccounts.resetPassword.resetting")}
                </>
              ) : (
                t("customerPortal.subAccounts.resetPassword.resetPassword")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
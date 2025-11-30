import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Eye, EyeOff, RefreshCw, Copy, Loader2, UserPlus } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Customer } from "@/types/customer";

interface CreateCustomerAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  onAccountCreated: () => void;
}

export default function CreateCustomerAccountDialog({
  open,
  onOpenChange,
  customer,
  onAccountCreated,
}: CreateCustomerAccountDialogProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && customer) {
      // Auto-suggest username from company name
      const suggestedUsername = customer.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 20);
      
      setFormData({
        username: suggestedUsername,
        password: "",
      });
    }
  }, [open, customer]);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: result }));
  };

  const copyToClipboard = async () => {
    try {
      const credentials = `Username: ${formData.username}\nPassword: ${formData.password}`;
      await navigator.clipboard.writeText(credentials);
      toast.success(t("admin.createAccount.credentialsCopied"));
    } catch (error) {
      toast.error(t("admin.createAccount.copyFailed"));
    }
  };

  const handleCreateAccount = async () => {
    if (!formData.username.trim()) {
      toast.error(t("admin.createAccount.usernameRequired"));
      return;
    }

    if (!formData.password.trim()) {
      toast.error(t("admin.createAccount.passwordRequired"));
      return;
    }

    if (formData.password.length < 8) {
      toast.error(t("admin.createAccount.passwordTooShort"));
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/api/settings/create-customer-account", {
        customerId: customer.id,
        username: formData.username,
        password: formData.password,
      });
      
      toast.success(t("admin.createAccount.accountCreated", { 
        company: customer.companyName 
      }));
      
      onAccountCreated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || t("admin.createAccount.createFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({ username: "", password: "" });
    setShowPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {t("admin.createAccount.title")} - {customer?.companyName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("admin.createAccount.username")}</Label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder={t("admin.createAccount.enterUsername")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("admin.createAccount.password")}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={t("admin.createAccount.enterPassword")}
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
                title={t("admin.createAccount.generateRandom")}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              {formData.username && formData.password && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  title={t("admin.createAccount.copyCredentials")}
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
              onClick={handleCreateAccount} 
              disabled={loading || !formData.username.trim() || !formData.password.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("admin.createAccount.creating")}
                </>
              ) : (
                t("admin.createAccount.createAccount")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
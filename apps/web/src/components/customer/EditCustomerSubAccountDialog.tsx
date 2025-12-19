import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useCustomerSubAccountStore } from "@/store/customerSubAccountStore";
import { SubAccount, UpdateSubAccountData } from "@/types/subAccount";
import { useTranslation } from "@/hooks/useTranslation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Switch } from "@/components/ui";

import { User, Mail, Loader2 } from "lucide-react";

interface EditCustomerSubAccountDialogProps {
  subAccount: SubAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SubAccountFormData {
  name: string;
  email: string;
  isActive: boolean;
}

export default function EditCustomerSubAccountDialog({
  subAccount,
  open,
  onOpenChange,
}: EditCustomerSubAccountDialogProps) {
  const { t } = useTranslation();
  const { updateSubAccount } = useCustomerSubAccountStore();

  const [formData, setFormData] = useState<SubAccountFormData>({
    name: "",
    email: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subAccount) {
      setFormData({
        name: subAccount.name,
        email: subAccount.user?.email || "",
        isActive: subAccount.isActive,
      });
    }
  }, [subAccount]);

  const handleInputChange = (field: keyof SubAccountFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("customerPortal.subAccounts.form.nameRequired"));
      return;
    }



    try {
      setLoading(true);

      const updateData: UpdateSubAccountData = {
        name: formData.name,
        email: formData.email || undefined,
        isActive: formData.isActive,
      };

      await updateSubAccount(subAccount.id, updateData);
      onOpenChange(false);
    } catch (error) {
      console.error("Sub-account update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {t("customerPortal.subAccounts.form.editSubAccount")}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">
                {t("customerPortal.subAccounts.form.basicInformation")}
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t("customerPortal.subAccounts.form.name")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={t("customerPortal.subAccounts.form.namePlaceholder")}
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("customerPortal.subAccounts.form.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t("customerPortal.subAccounts.form.emailPlaceholder")}
                  className="pl-10 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">
                  {t("customerPortal.subAccounts.form.activeAccount")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("customerPortal.subAccounts.form.activeAccountDesc")}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
              />
            </div>
          </div>



          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("customerPortal.subAccounts.form.cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("customerPortal.subAccounts.form.updating")}
                </>
              ) : (
                t("customerPortal.subAccounts.form.updateSubAccount")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useCustomerSubAccountStore } from "@/store/customerSubAccountStore";
import { CreateSubAccountData } from "@/types/subAccount";
import { useTranslation } from "@/hooks/useTranslation";
import CustomerSubAccountCredentialsModal from "./CustomerSubAccountCredentialsModal";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Switch } from "@/components/ui";

import { User, Mail, Loader2 } from "lucide-react";

interface AddCustomerSubAccountDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SubAccountFormData {
  name: string;
  email: string;
  canCreateOrders: boolean;
  canEditOrders: boolean;
  canViewReports: boolean;
}

export default function AddCustomerSubAccountDialog({
  trigger,
  open,
  onOpenChange,
}: AddCustomerSubAccountDialogProps) {
  const { t } = useTranslation();
  const { createSubAccount } = useCustomerSubAccountStore();

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState<SubAccountFormData>({
    name: "",
    email: "",
    canCreateOrders: true,
    canEditOrders: true,
    canViewReports: false,
  });
  const [loading, setLoading] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    tempPassword: string;
  } | null>(null);

  const handleInputChange = (field: keyof SubAccountFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      canCreateOrders: true,
      canEditOrders: true,
      canViewReports: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("customerPortal.subAccounts.form.nameRequired"));
      return;
    }

    if (!formData.email.trim()) {
      toast.error(t("customerPortal.subAccounts.form.emailRequired"));
      return;
    }

    try {
      setLoading(true);

      const subAccountData: CreateSubAccountData = {
        name: formData.name,
        email: formData.email,
        canCreateOrders: formData.canCreateOrders,
        canEditOrders: formData.canEditOrders,
        canViewReports: formData.canViewReports,
      };

      const result = await createSubAccount(subAccountData);
      
      // Show credentials modal
      setCreatedCredentials({
        name: formData.name,
        email: formData.email,
        tempPassword: result.tempPassword,
      });
      setShowCredentialsModal(true);
      
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Sub-account creation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button onClick={() => setIsOpen(true)}>
              {t("customerPortal.subAccounts.addSubAccount")}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              {t("customerPortal.subAccounts.form.addNewSubAccount")}
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
                <Label htmlFor="email">{t("customerPortal.subAccounts.form.email")} *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder={t("customerPortal.subAccounts.form.emailPlaceholder")}
                    required
                    className="pl-10 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                {t("customerPortal.subAccounts.form.permissions")}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="canCreateOrders">
                      {t("customerPortal.subAccounts.form.canCreateOrders")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("customerPortal.subAccounts.form.canCreateOrdersDesc")}
                    </p>
                  </div>
                  <Switch
                    id="canCreateOrders"
                    checked={formData.canCreateOrders}
                    onCheckedChange={(checked) =>
                      handleInputChange("canCreateOrders", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="canEditOrders">
                      {t("customerPortal.subAccounts.form.canEditOrders")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("customerPortal.subAccounts.form.canEditOrdersDesc")}
                    </p>
                  </div>
                  <Switch
                    id="canEditOrders"
                    checked={formData.canEditOrders}
                    onCheckedChange={(checked) =>
                      handleInputChange("canEditOrders", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="canViewReports">
                      {t("customerPortal.subAccounts.form.canViewReports")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("customerPortal.subAccounts.form.canViewReportsDesc")}
                    </p>
                  </div>
                  <Switch
                    id="canViewReports"
                    checked={formData.canViewReports}
                    onCheckedChange={(checked) =>
                      handleInputChange("canViewReports", checked)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-lg"
                onClick={() => setIsOpen(false)}
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
                    {t("customerPortal.subAccounts.form.creating")}
                  </>
                ) : (
                  t("customerPortal.subAccounts.form.addSubAccount")
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      {createdCredentials && (
        <CustomerSubAccountCredentialsModal
          open={showCredentialsModal}
          onOpenChange={setShowCredentialsModal}
          name={createdCredentials.name}
          email={createdCredentials.email}
          tempPassword={createdCredentials.tempPassword}
        />
      )}
    </>
  );
}
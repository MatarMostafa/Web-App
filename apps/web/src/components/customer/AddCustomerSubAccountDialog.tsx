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

import { User, Mail, Key, Loader2 } from "lucide-react";

interface AddCustomerSubAccountDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SubAccountFormData {
  name: string;
  username: string;
  password: string;
  email: string;
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
    username: "",
    password: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    username: string;
    password: string;
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
      username: "",
      password: "",
      email: "",
    });
  };

  const getErrorMessage = (error: string) => {
    const errorMap: Record<string, string> = {
      USERNAME_EXISTS: t("customerPortal.subAccounts.errors.usernameExists"),
      EMAIL_EXISTS: t("customerPortal.subAccounts.errors.emailExists"),
      CUSTOMER_NOT_FOUND: t("customerPortal.subAccounts.errors.customerNotFound"),
      SUB_ACCOUNT_NOT_FOUND: t("customerPortal.subAccounts.errors.subAccountNotFound"),
      FAILED_TO_CREATE: t("customerPortal.subAccounts.createError"),
    };
    return errorMap[error] || error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("customerPortal.subAccounts.form.nameRequired"));
      return;
    }

    if (!formData.username.trim()) {
      toast.error(t("customerPortal.subAccounts.form.usernameRequired"));
      return;
    }

    if (!formData.password.trim()) {
      toast.error(t("customerPortal.subAccounts.form.passwordRequired"));
      return;
    }

    try {
      setLoading(true);

      const subAccountData: CreateSubAccountData = {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        email: formData.email || undefined,
      };

      await createSubAccount(subAccountData);
      
      toast.success(t("customerPortal.subAccounts.createSuccess"));
      
      // Show credentials modal
      setCreatedCredentials({
        name: formData.name,
        username: formData.username,
        password: formData.password,
      });
      setShowCredentialsModal(true);
      
      setIsOpen(false);
      resetForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? getErrorMessage(error.message) : t("customerPortal.subAccounts.createError");
      toast.error(errorMessage);
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t("customerPortal.subAccounts.form.username")} *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder={t("customerPortal.subAccounts.form.usernamePlaceholder")}
                      required
                      className="pl-10 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("customerPortal.subAccounts.form.password")} *</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder={t("customerPortal.subAccounts.form.passwordPlaceholder")}
                      required
                      className="pl-10 rounded-lg"
                    />
                  </div>
                </div>
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
                className="flex-1 bg-primary hover:bg-primary/90 rounded-lg"
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
          username={createdCredentials.username}
          password={createdCredentials.password}
        />
      )}
    </>
  );
}
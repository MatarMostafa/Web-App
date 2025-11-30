import React, { useState } from "react";
import toast from "react-hot-toast";
import { useCustomerStore } from "@/store/customerStore";
import { CreateCustomerData } from "@/types/customer";
import { useTranslation } from "@/hooks/useTranslation";
import CustomerCredentialsModal from "./CustomerCredentialsModal";

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
import { Textarea } from "@/components/ui";
import { Switch } from "@/components/ui";

import { Building, Mail, Phone, MapPin, Loader2 } from "lucide-react";

interface AddCustomerDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CustomerFormData {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  industry: string;
  taxNumber: string;
  isActive: boolean;
  // Login credentials
  username: string;
  password: string;
  createLoginAccount: boolean;
}

export default function AddCustomerDialog({
  trigger,
  open,
  onOpenChange,
}: AddCustomerDialogProps) {
  const { t } = useTranslation();
  const { createCustomer } = useCustomerStore();

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState<CustomerFormData>({
    companyName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    industry: "",
    taxNumber: "",
    isActive: true,
    username: "",
    password: "",
    createLoginAccount: false,
  });
  const [loading, setLoading] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const handleInputChange = (field: keyof CustomerFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      industry: "",
      taxNumber: "",
      isActive: true,
      username: "",
      password: "",
      createLoginAccount: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      toast.error(t("admin.customers.form.companyNameRequired"));
      return;
    }

    if (formData.createLoginAccount) {
      if (!formData.username.trim() || !formData.password.trim()) {
        toast.error("Username and password are required for login account");
        return;
      }
    }

    try {
      setLoading(true);

      const customerData: CreateCustomerData = {
        companyName: formData.companyName,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        address: formData.address ? {
          street: formData.address,
          city: "",
          state: "",
          zip: ""
        } : undefined,
        industry: formData.industry || undefined,
        taxNumber: formData.taxNumber || undefined,
        isActive: formData.isActive,
        // Login credentials if creating account
        ...(formData.createLoginAccount && {
          username: formData.username,
          password: formData.password,
        }),
      };

      await createCustomer(customerData);
      
      // Show credentials modal if login account was created
      if (formData.createLoginAccount) {
        setCreatedCredentials({
          username: formData.username,
          password: formData.password,
        });
        setShowCredentialsModal(true);
      }
      
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Customer creation failed:", error);
      toast.error(
        error instanceof Error ? error.message : t("admin.customers.form.createError")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button onClick={() => setIsOpen(true)}>{t("admin.customers.addCustomer")}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {t("admin.customers.form.addNewCustomer")}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Building className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">
                {t("admin.customers.form.companyInformation")}
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">{t("admin.customers.form.companyName")} *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
                placeholder={t("admin.customers.form.companyNamePlaceholder")}
                required
                className="rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">{t("admin.customers.form.contactEmail")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      handleInputChange("contactEmail", e.target.value)
                    }
                    placeholder={t("admin.customers.form.contactEmailPlaceholder")}
                    className="pl-10 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">{t("admin.customers.form.contactPhone")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      handleInputChange("contactPhone", e.target.value)
                    }
                    placeholder={t("admin.customers.form.contactPhonePlaceholder")}
                    className="pl-10 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t("admin.customers.form.address")}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder={t("admin.customers.form.addressPlaceholder")}
                  className="pl-10 rounded-lg"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">{t("admin.customers.form.industry")}</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) =>
                    handleInputChange("industry", e.target.value)
                  }
                  placeholder={t("admin.customers.form.industryPlaceholder")}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxNumber">{t("admin.customers.form.taxNumber")}</Label>
                <Input
                  id="taxNumber"
                  value={formData.taxNumber}
                  onChange={(e) =>
                    handleInputChange("taxNumber", e.target.value)
                  }
                  placeholder={t("admin.customers.form.taxNumberPlaceholder")}
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="createLoginAccount"
                  checked={formData.createLoginAccount}
                  onCheckedChange={(checked) =>
                    handleInputChange("createLoginAccount", checked)
                  }
                />
                <Label htmlFor="createLoginAccount">Create Customer Portal Account</Label>
              </div>

              {formData.createLoginAccount && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium">Login Credentials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        placeholder="Enter username"
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        placeholder="Enter password"
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">{t("admin.customers.form.activeCustomer")}</Label>
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
              {t("admin.customers.form.cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-pforeground rounded-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("admin.customers.form.creating")}
                </>
              ) : (
                t("admin.customers.form.addCustomer")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    
    {/* Credentials Modal */}
    {createdCredentials && (
      <CustomerCredentialsModal
        open={showCredentialsModal}
        onOpenChange={setShowCredentialsModal}
        username={createdCredentials.username}
        password={createdCredentials.password}
      />
    )}
    </>
  );
}

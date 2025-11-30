"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Mail, Edit2, Check, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface ContactSectionProps {
  userType: "admin" | "employee" | "customer";
}

export function ContactSection({ userType }: ContactSectionProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState({ phone: false, email: false });
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
  });
  const [editValues, setEditValues] = useState({
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      let endpoint = "";
      switch (userType) {
        case "employee":
        case "admin": // Admin uses same endpoint as employee
          endpoint = "/api/employees/me";
          break;
        case "customer":
          endpoint = "/api/customers/me";
          break;
      }
      
      const response = await apiClient.get(endpoint) as any;
      const data = response.data || response;
      
      setContactInfo({
        phone: data.phoneNumber || data.contactPhone || "",
        email: data.email || data.user?.email || data.contactEmail || "",
      });
      setEditValues({
        phone: data.phoneNumber || data.contactPhone || "",
        email: data.email || data.user?.email || data.contactEmail || "",
      });
    } catch (error) {
      console.error("Failed to fetch contact info:", error);
    }
  };

  const handlePhoneEdit = () => {
    setEditing(prev => ({ ...prev, phone: true }));
    setEditValues(prev => ({ ...prev, phone: contactInfo.phone }));
  };

  const handlePhoneSave = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let payload = {};
      
      switch (userType) {
        case "employee":
        case "admin": // Admin uses same endpoint as employee
          endpoint = "/api/settings/employee/phone";
          payload = { phoneNumber: editValues.phone };
          break;
        case "customer":
          endpoint = "/api/settings/customer/phone";
          payload = { contactPhone: editValues.phone };
          break;
      }
      
      await apiClient.post(endpoint, payload);
      setContactInfo(prev => ({ ...prev, phone: editValues.phone }));
      setEditing(prev => ({ ...prev, phone: false }));
      toast.success(t('settings.contact.phoneUpdatedSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('settings.contact.phoneUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneCancel = () => {
    setEditing(prev => ({ ...prev, phone: false }));
    setEditValues(prev => ({ ...prev, phone: contactInfo.phone }));
  };

  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [emailChangeForm, setEmailChangeForm] = useState({
    email: "",
    reason: "",
  });
  const [submittingEmail, setSubmittingEmail] = useState(false);

  const handleEmailChangeRequest = () => {
    setEmailChangeForm({
      email: "",
      reason: "",
    });
    setShowEmailChangeModal(true);
  };

  const submitEmailChangeRequest = async () => {
    if (!emailChangeForm.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailChangeForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmittingEmail(true);
    try {
      if (userType === "admin") {
        // Admin gets instant update
        await apiClient.post("/api/settings/admin/email", {
          email: emailChangeForm.email,
        });
        
        // Update local state
        setContactInfo(prev => ({ ...prev, email: emailChangeForm.email }));
        setEditValues(prev => ({ ...prev, email: emailChangeForm.email }));
        
        toast.success("Email updated successfully");
      } else {
        // Employee/Customer needs approval
        await apiClient.post("/api/settings/request-email-change", emailChangeForm);
        toast.success(t('settings.requests.requestSubmittedMessage'));
      }
      
      setShowEmailChangeModal(false);
    } catch (error: any) {
      toast.error(error.message || t('settings.changeRequests.requestFailed'));
    } finally {
      setSubmittingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Phone Number */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label>{t('settings.contact.phoneNumber')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.contact.phoneDescription')}
              </p>
            </div>
          </div>
          {!editing.phone && (
            <Button variant="ghost" size="sm" onClick={handlePhoneEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {editing.phone ? (
          <div className="flex gap-2">
            <Input
              value={editValues.phone}
              onChange={(e) => setEditValues(prev => ({ ...prev, phone: e.target.value }))}
              placeholder={t('settings.contact.enterPhoneNumber')}
              className="flex-1"
            />
            <Button size="sm" onClick={handlePhoneSave} disabled={loading}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handlePhoneCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="pl-8">
            <p className="font-medium">
              {contactInfo.phone || t('settings.contact.noPhoneSet')}
            </p>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label>{t('settings.contact.emailAddress')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.contact.emailDescription')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userType !== "admin" && (
              <Badge variant="secondary">{t('settings.contact.requiresApproval')}</Badge>
            )}
            <Button variant="ghost" size="sm" onClick={handleEmailChangeRequest}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="pl-8">
          <p className="font-medium">
            {contactInfo.email || t('settings.contact.noEmailSet')}
          </p>
        </div>
      </div>

      {/* Email Change Request Modal */}
      <Dialog open={showEmailChangeModal} onOpenChange={setShowEmailChangeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('settings.requests.requestChange')} - {t('settings.contact.emailAddress')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.contact.emailAddress')}</Label>
              <Input
                type="email"
                value={emailChangeForm.email}
                onChange={(e) => setEmailChangeForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter new email address"
              />
            </div>
            {userType !== "admin" && (
              <div className="space-y-2">
                <Label>{t('settings.requests.requestReason')}</Label>
                <Textarea
                  value={emailChangeForm.reason}
                  onChange={(e) => setEmailChangeForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder={t('settings.requests.reasonPlaceholder')}
                  className="min-h-[80px]"
                />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEmailChangeModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={submitEmailChangeRequest} disabled={submittingEmail}>
                {submittingEmail 
                  ? (userType === "admin" ? "Updating..." : t('settings.requests.submitting'))
                  : (userType === "admin" ? "Update Email" : t('settings.requests.submitRequest'))
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
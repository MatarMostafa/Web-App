"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Edit2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface PersonalSectionProps {
  userType: "admin" | "employee";
}

export function PersonalSection({ userType }: PersonalSectionProps) {
  const { t } = useTranslation();
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });

  useEffect(() => {
    fetchPersonalInfo();
  }, []);

  const fetchPersonalInfo = async () => {
    try {
      let endpoint = "";
      switch (userType) {
        case "employee":
          endpoint = "/api/employees/me";
          break;
        case "admin":
          endpoint = "/api/auth/me";
          break;
      }
      
      const response = await apiClient.get(endpoint);
      const data = response.data || response;
      
      setPersonalInfo({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        username: data.username || data.user?.username || "",
      });
    } catch (error) {
      console.error("Failed to fetch personal info:", error);
    }
  };

  const [showNameChangeModal, setShowNameChangeModal] = useState(false);
  const [nameChangeForm, setNameChangeForm] = useState({
    firstName: "",
    lastName: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleNameChangeRequest = () => {
    setNameChangeForm({
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      reason: "",
    });
    setShowNameChangeModal(true);
  };

  const submitNameChangeRequest = async () => {
    if (!nameChangeForm.firstName.trim() || !nameChangeForm.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/api/settings/request-name-change", nameChangeForm);
      toast.success(t('settings.requests.requestSubmittedMessage'));
      setShowNameChangeModal(false);
    } catch (error: any) {
      toast.error(error.message || t('settings.changeRequests.requestFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* First Name */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label>{t('settings.personal.firstName')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.personal.firstNameDescription')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{t('settings.personal.requiresApproval')}</Badge>
            <Button variant="ghost" size="sm" onClick={handleNameChangeRequest}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="pl-8">
          <p className="font-medium">
            {personalInfo.firstName || t('settings.personal.notSet')}
          </p>
        </div>
      </div>

      {/* Last Name */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label>{t('settings.personal.lastName')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.personal.lastNameDescription')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{t('settings.personal.requiresApproval')}</Badge>
            <Button variant="ghost" size="sm" onClick={handleNameChangeRequest}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="pl-8">
          <p className="font-medium">
            {personalInfo.lastName || t('settings.personal.notSet')}
          </p>
        </div>
      </div>

      {/* Username */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label>{t('settings.personal.username')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.personal.usernameDescription')}
            </p>
          </div>
        </div>

        <div className="pl-8">
          <p className="font-medium text-muted-foreground">
            {personalInfo.username || t('settings.personal.notSet')}
          </p>
        </div>
      </div>

      {/* Name Change Request Modal */}
      <Dialog open={showNameChangeModal} onOpenChange={setShowNameChangeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('settings.requests.requestChange')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.personal.firstName')}</Label>
              <Input
                value={nameChangeForm.firstName}
                onChange={(e) => setNameChangeForm(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder={t('settings.personal.firstNameDescription')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('settings.personal.lastName')}</Label>
              <Input
                value={nameChangeForm.lastName}
                onChange={(e) => setNameChangeForm(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder={t('settings.personal.lastNameDescription')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('settings.requests.requestReason')}</Label>
              <Textarea
                value={nameChangeForm.reason}
                onChange={(e) => setNameChangeForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder={t('settings.requests.reasonPlaceholder')}
                className="min-h-[80px]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNameChangeModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={submitNameChangeRequest} disabled={submitting}>
                {submitting ? t('settings.requests.submitting') : t('settings.requests.submitRequest')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
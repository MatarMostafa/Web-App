"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building, MapPin, Edit2, Check, X, Hash, Briefcase } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export function BusinessSection() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState({ 
    address: false, 
    industry: false 
  });
  const [businessInfo, setBusinessInfo] = useState({
    companyName: "",
    address: "",
    industry: "",
    taxNumber: "",
  });
  const [editValues, setEditValues] = useState({
    address: "",
    industry: "",
  });

  useEffect(() => {
    fetchBusinessInfo();
  }, []);

  const fetchBusinessInfo = async () => {
    try {
      const response = await apiClient.get<any>("/api/customers/me");
      const data = response.data || response;
      
      setBusinessInfo({
        companyName: data.companyName || "",
        address: typeof data.address === 'string' ? data.address : (data.address?.street || ""),
        industry: data.industry || "",
        taxNumber: data.taxNumber || "",
      });
      setEditValues({
        address: typeof data.address === 'string' ? data.address : (data.address?.street || ""),
        industry: data.industry || "",
      });
    } catch (error) {
      console.error("Failed to fetch business info:", error);
    }
  };

  const handleAddressEdit = () => {
    setEditing(prev => ({ ...prev, address: true }));
    setEditValues(prev => ({ ...prev, address: businessInfo.address }));
  };

  const handleAddressSave = async () => {
    setLoading(true);
    try {
      await apiClient.post("/api/settings/customer/address", {
        address: editValues.address ? { street: editValues.address } : null
      });
      setBusinessInfo(prev => ({ ...prev, address: editValues.address }));
      setEditing(prev => ({ ...prev, address: false }));
      toast.success(t('settings.business.addressUpdatedSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('settings.business.addressUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddressCancel = () => {
    setEditing(prev => ({ ...prev, address: false }));
    setEditValues(prev => ({ ...prev, address: businessInfo.address }));
  };

  const handleIndustryEdit = () => {
    setEditing(prev => ({ ...prev, industry: true }));
    setEditValues(prev => ({ ...prev, industry: businessInfo.industry }));
  };

  const handleIndustrySave = async () => {
    setLoading(true);
    try {
      await apiClient.post("/api/settings/customer/industry", {
        industry: editValues.industry
      });
      setBusinessInfo(prev => ({ ...prev, industry: editValues.industry }));
      setEditing(prev => ({ ...prev, industry: false }));
      toast.success(t('settings.business.industryUpdatedSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('settings.business.industryUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleIndustryCancel = () => {
    setEditing(prev => ({ ...prev, industry: false }));
    setEditValues(prev => ({ ...prev, industry: businessInfo.industry }));
  };

  const [showCompanyChangeModal, setShowCompanyChangeModal] = useState(false);
  const [companyChangeForm, setCompanyChangeForm] = useState({
    companyName: "",
    taxNumber: "",
    reason: "",
  });
  const [submittingCompany, setSubmittingCompany] = useState(false);

  const handleCompanyNameChangeRequest = () => {
    setCompanyChangeForm({
      companyName: businessInfo.companyName,
      taxNumber: businessInfo.taxNumber,
      reason: "",
    });
    setShowCompanyChangeModal(true);
  };

  const handleTaxNumberChangeRequest = () => {
    setCompanyChangeForm({
      companyName: businessInfo.companyName,
      taxNumber: businessInfo.taxNumber,
      reason: "",
    });
    setShowCompanyChangeModal(true);
  };

  const submitCompanyChangeRequest = async () => {
    if (!companyChangeForm.companyName.trim() && !companyChangeForm.taxNumber.trim()) {
      toast.error("At least one field must be changed");
      return;
    }

    setSubmittingCompany(true);
    try {
      await apiClient.post("/api/settings/request-company-change", companyChangeForm);
      toast.success(t('settings.requests.requestSubmittedMessage'));
      setShowCompanyChangeModal(false);
    } catch (error: any) {
      toast.error(error.message || t('settings.changeRequests.requestFailed'));
    } finally {
      setSubmittingCompany(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Name */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label>{t('settings.business.companyName')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.business.companyNameDescription')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{t('settings.business.requiresApproval')}</Badge>
            <Button variant="ghost" size="sm" onClick={handleCompanyNameChangeRequest}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="pl-8">
          <p className="font-medium">
            {businessInfo.companyName || t('settings.business.notSet')}
          </p>
        </div>
      </div>

      {/* Business Address */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label>{t('settings.business.businessAddress')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.business.addressDescription')}
              </p>
            </div>
          </div>
          {!editing.address && (
            <Button variant="ghost" size="sm" onClick={handleAddressEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {editing.address ? (
          <div className="space-y-2">
            <Textarea
              value={editValues.address}
              onChange={(e) => setEditValues(prev => ({ ...prev, address: e.target.value }))}
              placeholder={t('settings.business.enterBusinessAddress')}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddressSave} disabled={loading}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleAddressCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="pl-8">
            <p className="font-medium whitespace-pre-wrap">
              {businessInfo.address || t('settings.business.noAddressSet')}
            </p>
          </div>
        )}
      </div>

      {/* Industry */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label>{t('settings.business.industry')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.business.industryDescription')}
              </p>
            </div>
          </div>
          {!editing.industry && (
            <Button variant="ghost" size="sm" onClick={handleIndustryEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {editing.industry ? (
          <div className="flex gap-2">
            <Input
              value={editValues.industry}
              onChange={(e) => setEditValues(prev => ({ ...prev, industry: e.target.value }))}
              placeholder={t('settings.business.industryPlaceholder')}
              className="flex-1"
            />
            <Button size="sm" onClick={handleIndustrySave} disabled={loading}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleIndustryCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="pl-8">
            <p className="font-medium">
              {businessInfo.industry || t('settings.business.notSpecified')}
            </p>
          </div>
        )}
      </div>

      {/* Tax Number */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label>{t('settings.business.taxNumber')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.business.taxNumberDescription')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{t('settings.business.requiresApproval')}</Badge>
            <Button variant="ghost" size="sm" onClick={handleTaxNumberChangeRequest}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="pl-8">
          <p className="font-medium">
            {businessInfo.taxNumber || t('settings.business.notSet')}
          </p>
        </div>
      </div>

      {/* Company Change Request Modal */}
      <Dialog open={showCompanyChangeModal} onOpenChange={setShowCompanyChangeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('settings.requests.requestChange')} - {t('settings.business.companyName')} / {t('settings.business.taxNumber')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.business.companyName')}</Label>
              <Input
                value={companyChangeForm.companyName}
                onChange={(e) => setCompanyChangeForm(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder={t('settings.business.companyNameDescription')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('settings.business.taxNumber')}</Label>
              <Input
                value={companyChangeForm.taxNumber}
                onChange={(e) => setCompanyChangeForm(prev => ({ ...prev, taxNumber: e.target.value }))}
                placeholder={t('settings.business.taxNumberDescription')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('settings.requests.requestReason')}</Label>
              <Textarea
                value={companyChangeForm.reason}
                onChange={(e) => setCompanyChangeForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder={t('settings.requests.reasonPlaceholder')}
                className="min-h-[80px]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCompanyChangeModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={submitCompanyChangeRequest} disabled={submittingCompany}>
                {submittingCompany ? t('settings.requests.submitting') : t('settings.requests.submitRequest')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
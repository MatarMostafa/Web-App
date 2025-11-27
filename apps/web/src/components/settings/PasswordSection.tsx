"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Lock } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

export function PasswordSection() {
  const { t } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast.error(t('settings.password.passwordsDoNotMatch'));
      return;
    }

    if (passwords.new.length < 8) {
      toast.error(t('settings.password.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/api/settings/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      
      toast.success(t('settings.password.passwordChangedSuccess'));
      setPasswords({ current: "", new: "", confirm: "" });
      setIsChanging(false);
    } catch (error: any) {
      toast.error(error.message || t('settings.password.passwordChangeFailed'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPasswords({ current: "", new: "", confirm: "" });
    setIsChanging(false);
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  if (!isChanging) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">{t('settings.password.title')}</p>
            <p className="text-sm text-muted-foreground">
              {t('settings.password.lastChanged')}: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsChanging(true)} variant="outline">
          {t('settings.password.changePassword')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handlePasswordChange} className="space-y-4">
      <div className="space-y-4">
        {/* Current Password */}
        <div className="space-y-2">
          <Label htmlFor="current-password">{t('settings.password.currentPassword')}</Label>
          <div className="relative">
            <Input
              id="current-password"
              type={showPasswords.current ? "text" : "password"}
              value={passwords.current}
              onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
              placeholder={t('settings.password.enterCurrentPassword')}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility("current")}
            >
              {showPasswords.current ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="new-password">{t('settings.password.newPassword')}</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPasswords.new ? "text" : "password"}
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              placeholder={t('settings.password.enterNewPassword')}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility("new")}
            >
              {showPasswords.new ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirm-password">{t('settings.password.confirmNewPassword')}</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showPasswords.confirm ? "text" : "password"}
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              placeholder={t('settings.password.confirmNewPassword')}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility("confirm")}
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Password Requirements */}
      <div className="text-sm text-muted-foreground">
        <p>{t('settings.password.requirements')}</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>{t('settings.password.atLeast8Characters')}</li>
          <li>{t('settings.password.containsNumber')}</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? t('settings.password.changing') : t('settings.password.changePassword')}
        </Button>
        <Button type="button" variant="outline" onClick={resetForm}>
          {t('settings.password.cancel')}
        </Button>
      </div>
    </form>
  );
}
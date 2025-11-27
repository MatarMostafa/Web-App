"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { ContactSection } from "@/components/settings/ContactSection";
import { PersonalSection } from "@/components/settings/PersonalSection";

export default function EmployeeSettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.accountSecurity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordSection />
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.personalInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonalSection userType="employee" />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.contactInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactSection userType="employee" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
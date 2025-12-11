"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useSession } from "next-auth/react";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { ContactSection } from "@/components/settings/ContactSection";
import { BusinessSection } from "@/components/settings/BusinessSection";

export default function CustomerSettingsPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  
  const isSubUser = session?.user?.role === "CUSTOMER_SUB_USER";

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

        {/* Business Information - Only for main customers */}
        {!isSubUser && (
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.businessInformation')}</CardTitle>
            </CardHeader>
            <CardContent>
              <BusinessSection />
            </CardContent>
          </Card>
        )}

        {/* Contact Information - Only for main customers */}
        {!isSubUser && (
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.contactInformation')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactSection userType="customer" />
            </CardContent>
          </Card>
        )}

        {/* Sub-user notice */}
        {isSubUser && (
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.subUserLimitations.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('settings.subUserLimitations.description')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
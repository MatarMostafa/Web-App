"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import CustomerSummary from "@/components/admin/CustomerSummary";
import CustomerProfile from "@/components/admin/CustomerProfile";
import { useCustomerStore } from "@/store/customerStore";
import { LoadingSpinnerWithText } from "@/components/ui";
import { useTranslation } from '@/hooks/useTranslation';

const CustomerDetailsPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const initialTab = searchParams?.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { currentCustomer, loading, fetchCustomerById } = useCustomerStore();

  useEffect(() => {
    if (id) {
      fetchCustomerById(id);
    }
  }, [id, fetchCustomerById]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[calc(100vh-130px)] flex items-center justify-center">
        <LoadingSpinnerWithText text={t('admin.customerDetails.loading')} />
      </div>
    );
  }

  if (!currentCustomer) {
    return <div className="p-8">{t('admin.customerDetails.notFound')}</div>;
  }

  return (
    <div className="py-6 px-4 md:px-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="grid grid-cols-1 gap-8 w-full">
          <CustomerSummary customer={currentCustomer} />
          <CustomerProfile
            customer={currentCustomer}
            initialTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
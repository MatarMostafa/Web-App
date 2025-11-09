"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import EmployeeSummary from "@/components/admin/EmployeeSummary";
import EmployeeProfile from "@/components/admin/EmployeeProfile";
import { useEmployeeStore } from "@/store/employeeStore";
import { LoadingSpinnerWithText } from "@/components/ui";
import { useTranslation } from '@/hooks/useTranslation';

const EmployeeDetailPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const id = params?.id as string;
  const { currentEmployee, isLoadingEmployee, fetchEmployee } =
    useEmployeeStore();

  useEffect(() => {
    if (id) {
      fetchEmployee(id);
    }
  }, [id, fetchEmployee]);

  if (isLoadingEmployee) {
    return (
      <div className="w-full h-full min-h-[calc(100vh-130px)] flex items-center justify-center">
        <LoadingSpinnerWithText text={t('admin.employeeDetails.loading')} />
      </div>
    );
  }

  if (!currentEmployee) {
    return <div className="p-8">{t('admin.employeeDetails.notFound')}</div>;
  }

  return (
    <div className="py-6 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 w-full">
          {/* Employee Summary Card */}
          <EmployeeSummary employee={currentEmployee} />

          {/* Employee Profile Tabs */}
          <EmployeeProfile
            employee={{
              ...currentEmployee,
              name: currentEmployee.firstName + " " + currentEmployee.lastName,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailPage;

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CustomerSubAccountsPage from "@/components/pages/customer/CustomerSubAccountsPage";
import { useTranslation } from "@/hooks/useTranslation";
import toast from "react-hot-toast";

export default function SubAccountsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // Restrict access for sub-users
    if (session.user.role === "CUSTOMER_SUB_USER") {
      toast.error(t("customerPortal.subAccounts.accessDenied"));
      router.push("/dashboard-customer");
      return;
    }
  }, [session, status, router, t]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "CUSTOMER") {
    return null;
  }

  return <CustomerSubAccountsPage />;
}
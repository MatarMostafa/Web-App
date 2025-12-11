import React from "react";
import { Card, CardContent } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Avatar, AvatarFallback } from "@/components/ui";
import { Building, Mail, Phone, MapPin, Calendar, Hash } from "lucide-react";
import { Customer } from "@/types/customer";
import { format } from "date-fns";
import { useTranslation } from '@/hooks/useTranslation';

interface CustomerSummaryProps {
  customer: Customer;
}

const CustomerSummary: React.FC<CustomerSummaryProps> = ({ customer }) => {
  const { t } = useTranslation();

  const getInitials = (companyName: string) => {
    return companyName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(customer.companyName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {customer.companyName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={customer.isActive !== false ? "default" : "destructive"}
                  className="text-xs"
                >
                  {customer.isActive !== false ? t("admin.customers.table.active") : t("admin.customers.table.blocked")}
                </Badge>
                {customer.user && (
                  <Badge variant="outline" className="text-xs">
                    {t("admin.customerDetails.hasAccount")}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {customer.contactEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.contactEmail}</span>
                </div>
              )}
              {customer.contactPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.contactPhone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="whitespace-pre-wrap">
                    {typeof customer.address === 'string' 
                      ? customer.address 
                      : (customer.address?.street || customer.address?.full || JSON.stringify(customer.address))}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {customer.industry && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.industry}</span>
                </div>
              )}
              {customer.taxNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.taxNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{t("admin.customerDetails.memberSince")} {format(new Date(customer.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerSummary;
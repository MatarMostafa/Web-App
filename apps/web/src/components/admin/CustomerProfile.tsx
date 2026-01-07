import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Building, ShoppingCart, Users, Activity } from "lucide-react";
import { Customer } from "@/types/customer";
import AdminCustomerSubAccountsTab from "@/components/admin/AdminCustomerSubAccountsTab";
import CustomerTemplateTab from "@/components/admin/CustomerTemplateTab";
import CustomerActivitiesTab from "@/components/admin/CustomerActivitiesTab";
import { useTranslation } from '@/hooks/useTranslation';

interface CustomerProfileProps {
  customer: Customer;
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customer,
  initialTab = "overview",
  onTabChange
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex flex-col sm:grid sm:grid-cols-5 w-full h-auto p-1 bg-muted/50">
          <TabsTrigger value="overview" className="w-full justify-start sm:justify-center py-2 px-4">{t('admin.customerDetails.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="orders" className="w-full justify-start sm:justify-center py-2 px-4">{t('admin.customerDetails.tabs.orders')}</TabsTrigger>
          <TabsTrigger value="activities" className="w-full justify-start sm:justify-center py-2 px-4">{t('activities.title')}</TabsTrigger>
          <TabsTrigger value="subaccounts" className="w-full justify-start sm:justify-center py-2 px-4">{t('admin.customerDetails.tabs.subAccounts')}</TabsTrigger>
          <TabsTrigger value="template" className="w-full justify-start sm:justify-center py-2 px-4">{t('admin.customerDetails.template.title')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {t('admin.customerDetails.overview.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{customer._count?.orders || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('admin.customerDetails.overview.totalOrders')}</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{customer._count?.subAccounts || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('admin.customerDetails.overview.subAccounts')}</div>
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {t('admin.customerDetails.orders.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.orders && customer.orders.length > 0 ? (
                <div className="space-y-4">
                  {customer.orders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">{order.title || order.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.scheduledDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin.customerDetails.orders.noOrders')}</p>
                  <p className="text-sm">{t('admin.customerDetails.orders.noOrdersDesc')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <CustomerActivitiesTab customerId={customer.id} />
        </TabsContent>

        <TabsContent value="subaccounts" className="space-y-6">
          <AdminCustomerSubAccountsTab customerId={customer.id} />
        </TabsContent>

        <TabsContent value="template" className="space-y-6">
          <CustomerTemplateTab customerId={customer.id} />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default CustomerProfile;
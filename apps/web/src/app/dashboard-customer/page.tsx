"use client";

import { useEffect, useState } from "react";
import { useCustomerStore } from "@/store/customerStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, Clock, Building } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { useSession } from "next-auth/react";

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { orders, profile, loading, fetchOrders, fetchProfile } = useCustomerStore();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  
  const isSubUser = session?.user?.role === "CUSTOMER_SUB_USER";
  const displayName = isSubUser 
    ? session?.user?.subAccount?.name || session?.user?.name
    : profile?.companyName;

  useEffect(() => {
    fetchOrders();
    fetchProfile();
  }, [fetchOrders, fetchProfile]);

  useEffect(() => {
    // Get 5 most recent orders
    const recent = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    setRecentOrders(recent);
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTranslatedStatus = (status: string) => {
    const statusKey = status.toLowerCase().replace(' ', '');
    return t(`customerPortal.orders.status.${statusKey}`) || status;
  };

  const orderStats = {
    total: orders.length,
    completed: orders.filter(o => o.status.toLowerCase() === 'completed').length,
    inProgress: orders.filter(o => o.status.toLowerCase() === 'in progress').length,
    planned: orders.filter(o => o.status.toLowerCase() === 'planned').length,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t('customerPortal.dashboard.welcome')}{displayName ? `, ${displayName}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {isSubUser 
            ? t('customerPortal.dashboard.subUserOverview')
            : t('customerPortal.dashboard.overview')
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('customerPortal.dashboard.totalOrders')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('customerPortal.dashboard.completed')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('customerPortal.dashboard.inProgress')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{orderStats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('customerPortal.dashboard.planned')}</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{orderStats.planned}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{t('customerPortal.dashboard.recentOrders')}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('customerPortal.dashboard.noOrders')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{order.orderNumber}</h4>
                      <Badge className={getStatusColor(order.status)}>
                        {getTranslatedStatus(order.status)}
                      </Badge>
                    </div>
                    {order.title && (
                      <p className="text-sm text-muted-foreground mb-1">{order.title}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.scheduledDate).toLocaleDateString()}
                      </span>
                      {order.location && (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {order.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
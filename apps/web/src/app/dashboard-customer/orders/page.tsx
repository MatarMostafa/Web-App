"use client";

import { useEffect, useState } from "react";
import { useCustomerStore } from "@/store/customerStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Search, Calendar, MapPin, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

export default function CustomerOrdersPage() {
  const { t } = useTranslation();
  const { orders, loading, fetchOrders } = useCustomerStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const filtered = orders.filter(order =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.title && order.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.description && order.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredOrders(filtered);
  }, [orders, searchQuery]);

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

  const handleViewOrder = (orderId: string) => {
    router.push(`/dashboard-customer/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('customerPortal.orders.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('customerPortal.orders.subtitle')}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={t('customerPortal.orders.searchPlaceholder')}
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? t('customerPortal.orders.noOrdersFound') : t('customerPortal.orders.noOrdersFound')}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchQuery 
                ? t('customerPortal.orders.tryAdjustingSearch')
                : t('customerPortal.orders.noOrdersMessage')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  {/* Header with order number and status */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold truncate">{order.orderNumber}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {getTranslatedStatus(order.status)}
                    </Badge>
                  </div>
                  
                  {/* Title */}
                  {order.title && (
                    <h4 className="text-md font-medium text-muted-foreground">
                      {order.title}
                    </h4>
                  )}
                  
                  {/* Description */}
                  {order.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {order.description}
                    </p>
                  )}
                  
                  {/* Details - responsive layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {t('customerPortal.orders.scheduled')}: {new Date(order.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {order.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{order.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions and created date - mobile friendly */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
                    <div className="text-xs text-muted-foreground order-2 sm:order-1">
                      {t('customerPortal.orders.created')}: {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order.id)}
                      className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2"
                    >
                      <Eye className="h-4 w-4" />
                      {t('customerPortal.orders.viewDetails')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
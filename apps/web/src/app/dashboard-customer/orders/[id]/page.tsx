"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCustomerStore } from "@/store/customerStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Clock, Package, Box } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api-client";

interface Container {
  id: string;
  serialNumber: string;
  cartonQuantity: number;
  articleQuantity: number;
  cartonPrice: number;
  articlePrice: number;
  articles: Array<{
    articleName: string;
    quantity: number;
    price: number;
  }>;
}

export default function CustomerOrderDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { fetchOrderById, loading } = useCustomerStore();
  const [order, setOrder] = useState<any>(null);
  const [containers, setContainers] = useState<Container[]>([]);

  const orderId = params.id as string;

  useEffect(() => {
    const loadOrder = async () => {
      if (orderId) {
        const orderData = await fetchOrderById(orderId);
        console.log('Order data received:', orderData); // Debug log
        console.log('Containers in order data:', orderData?.containers); // Debug log
        setOrder(orderData);
        
        // Set containers from order data if available
        if (orderData?.containers) {
          console.log('Setting containers:', orderData.containers); // Debug log
          setContainers(orderData.containers);
        } else {
          console.log('No containers found, setting empty array'); // Debug log
          setContainers([]);
        }
      }
    };
    loadOrder();
  }, [orderId, fetchOrderById]);

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

  const getStatusDescription = (status: string) => {
    const statusKey = status.toLowerCase().replace(' ', '');
    return t(`customerPortal.orderDetail.statusDescription.${statusKey}`) || 'Order status information.';
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/4"></div>
          <div className="h-48 sm:h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-3 sm:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Package className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2 text-center">{t('customerPortal.orderDetail.orderNotFound')}</h3>
            <p className="text-muted-foreground text-center mb-4 text-sm sm:text-base px-4">
              {t('customerPortal.orderDetail.orderNotFoundMessage')}
            </p>
            <Button onClick={() => router.push('/dashboard-customer/orders')} className="text-sm">
              {t('customerPortal.orderDetail.backToOrders')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard-customer/orders')}
          className="flex items-center gap-1 sm:gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t('customerPortal.orderDetail.backToOrders')}</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{order.orderNumber}</h1>
          <Badge className={getStatusColor(order.status)} variant="secondary">
            {getTranslatedStatus(order.status)}
          </Badge>
        </div>
        {order.title && (
          <h2 className="text-lg sm:text-xl text-muted-foreground">{order.title}</h2>
        )}
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{t('customerPortal.orderDetail.orderInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-start sm:items-center gap-3">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">{t('customerPortal.orderDetail.scheduledDate')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground break-words">
                  {new Date(order.scheduledDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {order.location && (
              <div className="flex items-start sm:items-center gap-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base">{t('customerPortal.orderDetail.location')}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">{order.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-start sm:items-center gap-3">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">{t('customerPortal.orderDetail.created')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{t('customerPortal.orderDetail.statusInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-3 h-3 rounded-full mt-0.5 sm:mt-0 ${
                  order.status.toLowerCase() === 'completed' ? 'bg-green-500' :
                  order.status.toLowerCase() === 'in progress' ? 'bg-blue-500' :
                  order.status.toLowerCase() === 'planned' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base">{getTranslatedStatus(order.status)}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {getStatusDescription(order.status)}
                  </p>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('customerPortal.orderDetail.lastUpdated')}: {new Date(order.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Containers Detail */}
      {containers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Box className="h-4 w-4 sm:h-5 sm:w-5" />
              {t('customerPortal.orderDetail.containersDetail')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              
              {containers.map((container, index) => (
                  <div key={container.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="font-medium text-sm sm:text-base">
                        {t('customerPortal.orderDetail.container')} {index + 1}
                      </h4>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {t('customerPortal.orderDetail.serialNumber')}: {container.serialNumber}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-3 rounded">
                        <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                          {t('customerPortal.orderDetail.cartonQuantity')}
                        </div>
                        <div className="text-lg sm:text-xl font-semibold">
                          {container.cartonQuantity}
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded">
                        <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                          {t('customerPortal.orderDetail.articleQuantity')}
                        </div>
                        <div className="text-lg sm:text-xl font-semibold">
                          {container.articleQuantity}
                        </div>
                      </div>
                    </div>
                    
                    {container.articles && container.articles.length > 0 && (
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                          {t('customerPortal.orderDetail.articles')}:
                        </div>
                        <div className="space-y-1">
                          {container.articles.map((article, articleIndex) => (
                            <div key={articleIndex} className="flex justify-between items-center text-xs sm:text-sm bg-muted/30 px-2 py-1 rounded">
                              <span>{article.articleName}</span>
                              <span className="text-muted-foreground">
                                {t('customerPortal.orderDetail.quantity')}: {article.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">{t('common.total')}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>{t('customerPortal.orderDetail.cartonQuantity')}:</span>
                      <span className="font-medium">{containers.reduce((sum, c) => sum + c.cartonQuantity, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('customerPortal.orderDetail.articleQuantity')}:</span>
                      <span className="font-medium">{containers.reduce((sum, c) => sum + c.articleQuantity, 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
      )}
      
      {containers.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Box className="h-4 w-4 sm:h-5 sm:w-5" />
              {t('customerPortal.orderDetail.containersDetail')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">{t('customerPortal.orderDetail.noContainers')}</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {t('customerPortal.orderDetail.noContainersMessage')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description and Help Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Template Description Card */}
        {order.descriptionData?.descriptionData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">{t("customerPortal.orderDetail.description")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                {Object.entries(order.descriptionData.descriptionData).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 bg-muted rounded-md p-3 text-xs sm:text-sm"
                    >
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground break-words">{String(value)}</span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {order.description && !order.descriptionData?.descriptionData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">{t('customerPortal.orderDetail.description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">
                {order.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{t('customerPortal.orderDetail.needHelp')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              {t('customerPortal.orderDetail.needHelpMessage')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button variant="outline" className="text-sm">
                {t('customerPortal.orderDetail.contactSupport')}
              </Button>
              <Button variant="outline" className="text-sm">
                {t('customerPortal.orderDetail.viewFaq')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
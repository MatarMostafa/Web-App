"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCustomerStore } from "@/store/customerStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Clock, Package } from "lucide-react";

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchOrderById, loading } = useCustomerStore();
  const [order, setOrder] = useState<any>(null);

  const orderId = params.id as string;

  useEffect(() => {
    const loadOrder = async () => {
      if (orderId) {
        const orderData = await fetchOrderById(orderId);
        setOrder(orderData);
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

  const getStatusDescription = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planned':
        return 'Your order has been scheduled and is awaiting execution.';
      case 'in progress':
        return 'Your order is currently being worked on by our team.';
      case 'completed':
        return 'Your order has been successfully completed.';
      case 'cancelled':
        return 'This order has been cancelled.';
      default:
        return 'Order status information.';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Order not found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The order you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push('/dashboard-customer/orders')}>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard-customer/orders')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-foreground">{order.orderNumber}</h1>
          <Badge className={getStatusColor(order.status)} variant="secondary">
            {order.status}
          </Badge>
        </div>
        {order.title && (
          <h2 className="text-xl text-muted-foreground">{order.title}</h2>
        )}
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Scheduled Date</p>
                <p className="text-sm text-muted-foreground">
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
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{order.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
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
            <CardTitle>Status Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  order.status.toLowerCase() === 'completed' ? 'bg-green-500' :
                  order.status.toLowerCase() === 'in progress' ? 'bg-blue-500' :
                  order.status.toLowerCase() === 'planned' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></div>
                <div>
                  <p className="font-medium">{order.status}</p>
                  <p className="text-sm text-muted-foreground">
                    {getStatusDescription(order.status)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(order.updatedAt).toLocaleDateString('en-US', {
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

      {/* Description */}
      {order.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {order.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            If you have any questions about this order, please contact our support team.
          </p>
          <div className="flex gap-4">
            <Button variant="outline">
              Contact Support
            </Button>
            <Button variant="outline">
              View FAQ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
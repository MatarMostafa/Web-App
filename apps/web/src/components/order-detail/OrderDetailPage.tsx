"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, User, Users, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinnerWithText } from "@/components/ui";
import { Order, OrderStatus } from "@/types/order";
import { useOrderStore } from "@/store/orderStore";
import { useEmployeeOrderStore } from "@/store/employee/employeeOrderStore";
import { OrderTimeline } from "./OrderTimeline";
import { OrderActions } from "./OrderActions";
import { OrderAssignments } from "./OrderAssignments";
import { OrderDetailSkeleton } from "./OrderDetailSkeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { format } from "date-fns";

interface OrderDetailPageProps {
  orderId: string;
  userRole: "ADMIN" | "EMPLOYEE";
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DRAFT:
      return "bg-gray-100 text-gray-800";
    case OrderStatus.OPEN:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.ACTIVE:
      return "bg-green-100 text-green-800";
    case OrderStatus.IN_PROGRESS:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.IN_REVIEW:
      return "bg-orange-100 text-orange-800";
    case OrderStatus.COMPLETED:
      return "bg-emerald-100 text-emerald-800";
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    case OrderStatus.EXPIRED:
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({
  orderId,
  userRole,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignedStaffCount, setAssignedStaffCount] = useState<number>(0);
  const [dataFetched, setDataFetched] = useState(false);
  const [orderActivities, setOrderActivities] = useState<any[]>([]);

  const { orders, fetchOrders, getOrderEmployeeNames } = useOrderStore();
  const { employeeAssignments, fetchEmployeeAssignments } = useEmployeeOrderStore();

  useEffect(() => {
    if (userRole === "ADMIN") {
      fetchOrders();
    } else {
      // For employees, get their assignments
      import("next-auth/react").then(m => m.getSession()).then(session => {
        if (session?.user?.id) {
          fetchEmployeeAssignments(session.user.id);
        }
      });
    }
  }, [orderId, userRole, fetchOrders, fetchEmployeeAssignments]);

  // Set activities from order data
  useEffect(() => {
    if (order && (order as any).customerActivities) {
      setOrderActivities((order as any).customerActivities);
    }
  }, [order]);

  // Update order when stores change
  useEffect(() => {
    if (userRole === "ADMIN") {
      if (orders.length > 0) {
        setDataFetched(true);
        const foundOrder = orders.find(o => o.id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
          setError(null);
        } else {
          setError("Order not found");
        }
        setLoading(false);
      }
    } else {
      if (employeeAssignments.length > 0) {
        setDataFetched(true);
        const assignment = employeeAssignments.find(a => a.order.id === orderId);
        if (assignment) {
          const orderData = assignment.order as any;
          // Use the order data from assignment, even if customer data is missing
          setOrder(orderData);
          setError(null);
          setLoading(false);
        } else {
          setError("Order not found or not assigned to you");
          setLoading(false);
        }
      }
    }
  }, [orders, employeeAssignments, orderId, userRole]);

  const handleBack = () => {
    const basePath = userRole === "ADMIN" ? "/dashboard-admin" : "/dashboard-employee";
    router.push(`${basePath}/orders`);
  };

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>

      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Order #{order.orderNumber}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {order.description || "No description provided"}
              </p>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-sm w-fit`}>
              {order.status === "IN_PROGRESS"
                ? "In Progress"
                : order.status === "IN_REVIEW"
                  ? "In Review"
                  : order.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Scheduled Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.scheduledDate), "MMM dd, yyyy")}
                </p>
                {order.startTime && (
                  <p className="text-xs text-muted-foreground">
                    Start: {format(new Date(order.startTime), "HH:mm")}
                  </p>
                )}
              </div>
            </div>
            
            {(order as any)?.customer?.companyName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm text-muted-foreground">{(order as any).customer.companyName}</p>
                </div>
              </div>
            )}
            
            {order.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{order.location}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Assigned Staff</p>
                <p className="text-sm text-muted-foreground">
                  {assignedStaffCount === 0 ? 'No staff assigned' : 
                   assignedStaffCount === 1 ? '1 person assigned' : 
                   `${assignedStaffCount} people assigned`}
                </p>
              </div>
            </div>
            
            {order.duration ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {order.duration} {order.duration === 1 ? 'hour' : 'hours'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <Badge variant="outline">P{order.priority}</Badge>
                </div>
              </div>
            )}
          </div>
          
          {order.specialInstructions && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Special Instructions</p>
              <p className="text-sm text-muted-foreground">{order.specialInstructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities */}
      {orderActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activities & Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderActivities.map((customerActivity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">
                      {customerActivity.activity?.name || 'Unknown Activity'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {customerActivity.quantity || 1}
                    </p>
                  </div>
                  <div className="text-right">
                    {customerActivity.unitPrice && (
                      <>
                        <p className="font-medium">€{Number(customerActivity.unitPrice).toFixed(2)}</p>
                        {customerActivity.lineTotal && (
                          <p className="text-sm text-muted-foreground">
                            Total: €{Number(customerActivity.lineTotal).toFixed(2)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              {orderActivities.some(ca => ca.lineTotal) && (
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Order Value:</span>
                    <span>€{orderActivities.reduce((sum, ca) => sum + (Number(ca.lineTotal) || 0), 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {orderActivities.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No activities assigned to this order
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <OrderTimeline orderId={orderId} order={order} userRole={userRole} />
        </div>

        {/* Right Column - Assignments */}
        <div>
          <OrderAssignments 
            orderId={orderId} 
            order={order} 
            userRole={userRole} 
            onAssignmentCountChange={setAssignedStaffCount}
          />
        </div>
      </div>
    </div>
  );
};
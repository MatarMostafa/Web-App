"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Clock, AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Order, OrderStatus } from "@/types/order";
import { useEmployeeOrderStore } from "@/store/employee/employeeOrderStore";
import { OrderTimeline } from "../order-detail/OrderTimeline";
import { OrderDetailSkeleton } from "../order-detail/OrderDetailSkeleton";
import { OrderActivities } from "../order-detail/OrderActivities";
import { orderNotesApi } from "@/lib/orderNotesApi";
import { useOrderStore } from "@/store/orderStore";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface EmployeeOrderDetailPageProps {
  orderId: string;
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

const getAvailableActions = (status: OrderStatus, t: any) => {
  const actions = [];
  
  switch (status) {
    case OrderStatus.ACTIVE:
      actions.push({ key: "start", label: t("employee.orderDetail.startWork"), variant: "default" as const });
      break;
    case OrderStatus.IN_PROGRESS:
      actions.push({ key: "review", label: t("employee.orderDetail.requestReview"), variant: "default" as const });
      actions.push({ key: "pause", label: t("employee.orderDetail.pauseWork"), variant: "outline" as const });
      break;
  }
  
  return actions;
};

export const EmployeeOrderDetailPage: React.FC<EmployeeOrderDetailPageProps> = ({
  orderId,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshActivities, setRefreshActivities] = useState(0);

  const { employeeAssignments, fetchEmployeeAssignments } = useEmployeeOrderStore();
  const { updateOrderStatus } = useOrderStore();

  useEffect(() => {
    import("next-auth/react").then(m => m.getSession()).then(session => {
      if (session?.user?.id) {
        fetchEmployeeAssignments(session.user.id);
      }
    });
  }, [orderId, fetchEmployeeAssignments]);

  useEffect(() => {
    if (employeeAssignments.length > 0) {
      const assignment = employeeAssignments.find(a => a.order.id === orderId);
      if (assignment) {
        setOrder(assignment.order as any);
        setError(null);
      } else {
        setError(t("employee.orderDetail.orderNotFoundDesc"));
      }
      setLoading(false);
    }
  }, [employeeAssignments, orderId]);

  const handleBack = () => {
    router.push("/dashboard-employee/orders");
  };

  const handleStatusChange = async (newStatus: OrderStatus, note: string) => {
    setIsSubmitting(true);
    try {
      await orderNotesApi.createOrderNote(orderId, {
        content: note,
        triggersStatus: newStatus,
        category: 'GENERAL_UPDATE',
        isInternal: false
      });

      updateOrderStatus(orderId, newStatus);
      
      const updatedAssignments = employeeAssignments.map(assignment => {
        if (assignment.order.id === orderId) {
          return {
            ...assignment,
            order: { ...assignment.order, status: newStatus }
          };
        }
        return assignment;
      });
      useEmployeeOrderStore.setState({ employeeAssignments: updatedAssignments });

      setRefreshActivities(prev => prev + 1);
      toast.success(`${t("employee.orderDetail.orderStatusUpdated")} ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(t("employee.orderDetail.failedToUpdateStatus"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionClick = (actionKey: string) => {
    switch (actionKey) {
      case "start":
        handleStatusChange(OrderStatus.IN_PROGRESS, t("employee.orderDetail.workStartedNote"));
        break;
      case "pause":
        handleStatusChange(OrderStatus.ACTIVE, t("employee.orderDetail.workPausedNote"));
        break;
      case "review":
        handleStatusChange(OrderStatus.IN_REVIEW, t("employee.orderDetail.reviewRequestedNote"));
        break;
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    setIsSubmitting(true);
    try {
      await orderNotesApi.createOrderNote(orderId, {
        content: noteContent.trim(),
        category: 'GENERAL_UPDATE',
        isInternal: false
      });

      setNoteContent("");
      setRefreshActivities(prev => prev + 1);
      toast.success(t("employee.orderDetail.noteAddedSuccess"));
    } catch (error) {
      console.error("Failed to add note:", error);
      toast.error(t("employee.orderDetail.failedToAddNote"));
    } finally {
      setIsSubmitting(false);
    }
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
            {t("employee.orderDetail.backToOrders")}
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("employee.orderDetail.orderNotFound")}</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableActions = getAvailableActions(order.status, t);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("employee.orderDetail.backToOrders")}
        </Button>
      </div>

      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Order #{order.orderNumber}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {order.description || t("employee.orderDetail.noDescription")}
              </p>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-sm w-fit`}>
              {(() => {
                switch (order.status) {
                  case OrderStatus.IN_PROGRESS:
                    return t("admin.orders.status.inProgress");
                  case OrderStatus.IN_REVIEW:
                    return t("admin.orders.status.inProgress");
                  case OrderStatus.ACTIVE:
                    return t("admin.orders.status.active");
                  case OrderStatus.COMPLETED:
                    return t("admin.orders.status.completed");
                  case OrderStatus.CANCELLED:
                    return t("admin.orders.status.cancelled");
                  case OrderStatus.DRAFT:
                    return t("admin.orders.status.draft");
                  case OrderStatus.OPEN:
                    return t("admin.orders.status.open");
                  case OrderStatus.EXPIRED:
                    return t("admin.orders.status.expired");
                  default:
                    return String(order.status).replace("_", " ");
                }
              })()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t("employee.orderDetail.scheduledDate")}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.scheduledDate), "MMM dd, yyyy")}
                </p>
                {order.startTime && (
                  <p className="text-xs text-muted-foreground">
                    {t("employee.orderDetail.start")}: {format(new Date(order.startTime), "HH:mm")}
                  </p>
                )}
              </div>
            </div>
            
            {order.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("employee.orderDetail.location")}</p>
                  <p className="text-sm text-muted-foreground">{order.location}</p>
                </div>
              </div>
            )}
            
            {order.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("employee.orderDetail.duration")}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.duration} {order.duration === 1 ? t("employee.orderDetail.hour") : t("employee.orderDetail.hours")}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {order.specialInstructions && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">{t("employee.orderDetail.specialInstructions")}</p>
              <p className="text-sm text-muted-foreground">{order.specialInstructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities */}
      {(order as any)?.customerActivities?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("employee.orderDetail.activitiesPricing")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(order as any).customerActivities.map((customerActivity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">
                      {customerActivity.activity?.name || t("employee.orderDetail.unknownActivity")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("employee.orderDetail.quantity")}: {customerActivity.quantity || 1}
                    </p>
                  </div>
                  <div className="text-right">
                    {customerActivity.unitPrice && (
                      <>
                        <p className="font-medium">€{Number(customerActivity.unitPrice).toFixed(2)}</p>
                        {customerActivity.lineTotal && (
                          <p className="text-sm text-muted-foreground">
                            {t("employee.orderDetail.total")}: €{Number(customerActivity.lineTotal).toFixed(2)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              {(order as any).customerActivities.some((ca: any) => ca.lineTotal) && (
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center font-semibold">
                    <span>{t("employee.orderDetail.totalOrderValue")}:</span>
                    <span>€{(order as any).customerActivities.reduce((sum: number, ca: any) => sum + (Number(ca.lineTotal) || 0), 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Timeline & Activities */}
        <div className="lg:col-span-2 space-y-6">
          <OrderTimeline orderId={orderId} order={order} userRole="EMPLOYEE" />
          <OrderActivities orderId={orderId} key={refreshActivities} />
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {availableActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("employee.orderDetail.quickActions")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {availableActions.map((action) => (
                    <Button
                      key={action.key}
                      variant={action.variant}
                      onClick={() => handleActionClick(action.key)}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Note */}
          <Card>
            <CardHeader>
              <CardTitle>{t("employee.orderDetail.addNote")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={t("employee.orderDetail.addNotePlaceholder")}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleAddNote}
                disabled={!noteContent.trim() || isSubmitting}
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {t("employee.orderDetail.addNote")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
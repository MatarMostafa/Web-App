"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Users, Clock, AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { TeamLeaderOrderNotesDialog } from "@/components/team-leader/OrderNotesDialog";

interface Order {
  id: string;
  orderNumber: string;
  description?: string;
  status: string;
  scheduledDate: string;
  startTime?: string;
  location?: string;
  duration?: number;
  priority: number;
  specialInstructions?: string;
  descriptionData?: {
    descriptionData: Record<string, any>;
  };
  customer: {
    companyName: string;
  };
  team?: {
    name: string;
  };
  employeeAssignments: Array<{
    employee: {
      firstName?: string;
      lastName?: string;
      employeeCode: string;
    };
  }>;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'active':
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TeamLeaderOrderDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const { id } = React.use(params);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-leader/orders`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        
        if (response.ok) {
          const orders = await response.json();
          const foundOrder = orders.find((o: Order) => o.id === id);
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError(t('teamLeader.orders.orderNotFoundDesc'));
          }
        } else {
          setError(t('teamLeader.orders.failedToFetch'));
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setError(t('teamLeader.orders.errorFetching'));
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchOrder();
    }
  }, [id, session, t]);



  const handleBack = () => {
    router.push("/dashboard-team-leader/orders");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('teamLeader.orders.backToOrders')}
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('teamLeader.orders.orderNotFound')}</h3>
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
          {t('teamLeader.orders.backToOrders')}
        </Button>
      </div>

      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Order #{order.orderNumber}</CardTitle>
              {!order.descriptionData?.descriptionData && (
                <p className="text-muted-foreground mt-1">
                  {order.description || t('teamLeader.orders.noDescription')}
                </p>
              )}
            </div>
            <Badge className={`${getStatusColor(order.status)} text-sm w-fit`}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('teamLeader.orders.scheduledDate')}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.scheduledDate), "MMM dd, yyyy")}
                </p>
                {order.startTime && (
                  <p className="text-xs text-muted-foreground">
                    {t('teamLeader.orders.start')}: {format(new Date(order.startTime), "HH:mm")}
                  </p>
                )}
              </div>
            </div>
            
            {order.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('teamLeader.orders.location')}</p>
                  <p className="text-sm text-muted-foreground">{order.location}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('teamLeader.orders.assignedStaff')}</p>
                <p className="text-sm text-muted-foreground">
                  {order.employeeAssignments.length === 0 ? t('teamLeader.orders.noStaffAssigned') : 
                   order.employeeAssignments.length === 1 ? `1 ${t('teamLeader.orders.personAssigned')}` : 
                   `${order.employeeAssignments.length} ${t('teamLeader.orders.peopleAssigned')}`}
                </p>
              </div>
            </div>
            
            {order.duration ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('teamLeader.orders.duration')}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.duration} {t('teamLeader.orders.minutes')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('common.priority')}</p>
                  <Badge variant="outline">P{order.priority}</Badge>
                </div>
              </div>
            )}
          </div>
          
          {order.specialInstructions && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">{t('teamLeader.orders.specialInstructions')}</p>
              <p className="text-sm text-muted-foreground">{order.specialInstructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer & Team Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('teamLeader.orders.customerInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{order.customer.companyName}</p>
              
            </div>
          </CardContent>
        </Card>

        {/* Template Description Card */}
        {order.descriptionData?.descriptionData ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('order.description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(order.descriptionData.descriptionData).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between gap-4 bg-muted rounded-md p-3 text-sm"
                    >
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground">{String(value)}</span>
                    </div>
                  )
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                ℹ️ {t('order.templateBasedDescription')}
              </p>
            </CardContent>
          </Card>
        ) : (
          order.team && (
            <Card>
              <CardHeader>
                <CardTitle>{t('teamLeader.orders.teamAssignment')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.team.name}</p>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Assigned Employees */}
      {order.employeeAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('teamLeader.orders.assignedEmployees')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {order.employeeAssignments.map((assignment, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {assignment.employee.firstName?.[0] || assignment.employee.employeeCode[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {assignment.employee.firstName && assignment.employee.lastName
                        ? `${assignment.employee.firstName} ${assignment.employee.lastName}`
                        : assignment.employee.employeeCode}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {assignment.employee.employeeCode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Order Communication Button */}
      {order && (
        <Card>
          <CardHeader>
            <CardTitle>{t('teamLeader.orders.orderCommunication')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setNotesDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('teamLeader.orders.viewNotesAndCommunication')}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Order Notes Dialog */}
      {order && (
        <TeamLeaderOrderNotesDialog
          orderId={order.id}
          orderNumber={order.orderNumber}
          customerName={order.customer.companyName}
          orderStatus={order.status}
          orderDetails={{
            scheduledDate: order.scheduledDate,
            location: order.location,
            assignedEmployee: order.employeeAssignments
              .map(a => a.employee.firstName && a.employee.lastName 
                ? `${a.employee.firstName} ${a.employee.lastName}` 
                : a.employee.employeeCode)
              .join(', ')
          }}
          open={notesDialogOpen}
          onOpenChange={setNotesDialogOpen}
          onStatusChange={(orderId, newStatus) => {
            setOrder(prev => prev ? { ...prev, status: newStatus } : null);
          }}
        />
      )}
    </div>
  );
};

export default TeamLeaderOrderDetail;
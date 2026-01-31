"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Plus, Eye, Edit, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AddOrderDialog from "@/components/team-leader/AddOrderDialog";
import EditOrderDialog from "@/components/team-leader/EditOrderDialog";
import { TeamLeaderOrderNotesDialog } from "@/components/team-leader/OrderNotesDialog";
import { useTranslation } from "@/hooks/useTranslation";

interface Order {
  id: string;
  orderNumber: string;
  title?: string;
  description?: string;
  status: string;
  scheduledDate: string;
  requiredEmployees: number;
  priority: number;
  customerId: string;
  customer: {
    companyName: string;
  };
  team?: {
    name: string;
  };
  employeeAssignments: Array<{
    employeeId?: string;
    employee: {
      id: string;
      firstName?: string;
      lastName?: string;
      employeeCode: string;
    };
  }>;
}

const TeamLeaderOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [notesOrder, setNotesOrder] = useState<Order | null>(null);
  const { data: session } = useSession();
  const { t } = useTranslation();

  // Listen for notification-triggered order notes opening
  useEffect(() => {
    const handleOpenOrderNotes = (event: CustomEvent) => {
      const { orderId, orderNumber } = event.detail;
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setNotesOrder(order);
      }
    };

    const handleSessionStorageOrderNotes = () => {
      const storedData = sessionStorage.getItem('openOrderNotes');
      if (storedData) {
        try {
          const { orderId } = JSON.parse(storedData);
          const order = orders.find(o => o.id === orderId);
          if (order) {
            setNotesOrder(order);
            sessionStorage.removeItem('openOrderNotes');
          }
        } catch (error) {
          console.error('Error parsing stored order notes data:', error);
        }
      }
    };

    window.addEventListener('openOrderNotes', handleOpenOrderNotes as EventListener);
    
    // Check for stored data on component mount and when orders change
    if (orders.length > 0) {
      handleSessionStorageOrderNotes();
    }

    return () => {
      window.removeEventListener('openOrderNotes', handleOpenOrderNotes as EventListener);
    };
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-leader/orders`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      if (session?.accessToken) {
        await fetchOrders();
      }
    };
    loadOrders();
  }, [session]);

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

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-100 text-red-800';
    if (priority >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('teamLeader.orders.title')}</h1>
          <p className="text-gray-600 mt-2">{t('teamLeader.orders.subtitle')}</p>
        </div>
        <AddOrderDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('teamLeader.orders.createOrder')}
            </Button>
          }
          onOrderCreated={() => {
            if (session?.accessToken) {
              fetchOrders();
            }
          }}
        />
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">{t('teamLeader.orders.noOrdersFound')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    {order.title && (
                      <p className="text-sm text-gray-600 mt-1">{order.title}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(order.priority)}>
                      {t('common.priority')} {order.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('order.customer')}</p>
                    <p className="text-sm">{order.customer.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('order.scheduledDate')}</p>
                    <p className="text-sm">{new Date(order.scheduledDate).toLocaleDateString()}</p>
                  </div>
                  {order.team && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">{t('teamLeader.orders.team')}</p>
                      <p className="text-sm">{order.team.name}</p>
                    </div>
                  )}
                </div>
                
                {order.employeeAssignments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">{t('teamLeader.orders.assignedEmployees')}</p>
                    <div className="flex flex-wrap gap-2">
                      {order.employeeAssignments.map((assignment, index) => (
                        <Badge key={index} variant="outline">
                          {assignment.employee.firstName && assignment.employee.lastName
                            ? `${assignment.employee.firstName} ${assignment.employee.lastName}`
                            : assignment.employee.employeeCode}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard-team-leader/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      {t('common.view')}
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setNotesOrder(order)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Notes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditingOrder(order)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('common.edit')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {editingOrder && (
        <EditOrderDialog
          order={editingOrder}
          open={!!editingOrder}
          onOpenChange={(open) => !open && setEditingOrder(null)}
          onOrderUpdated={() => {
            if (session?.accessToken) {
              fetchOrders();
            }
          }}
        />
      )}
      
      {notesOrder && (
        <TeamLeaderOrderNotesDialog
          orderId={notesOrder.id}
          orderNumber={notesOrder.orderNumber}
          customerName={notesOrder.customer.companyName}
          orderStatus={notesOrder.status}
          orderDetails={{
            scheduledDate: notesOrder.scheduledDate,
            assignedEmployee: notesOrder.employeeAssignments
              .map(a => a.employee.firstName && a.employee.lastName 
                ? `${a.employee.firstName} ${a.employee.lastName}` 
                : a.employee.employeeCode)
              .join(', ')
          }}
          open={!!notesOrder}
          onOpenChange={(open) => !open && setNotesOrder(null)}
          onStatusChange={(orderId, newStatus) => {
            setOrders(prev => prev.map(order => 
              order.id === orderId ? { ...order, status: newStatus } : order
            ));
          }}
        />
      )}
    </div>
  );
};

export default TeamLeaderOrders;
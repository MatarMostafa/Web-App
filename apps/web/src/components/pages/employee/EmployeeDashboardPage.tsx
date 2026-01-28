"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  CalendarDays,
  Target,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import { useEmployeeDashboardStore } from "@/store/employeeDashboardStore";
import { useEmployeeLeaveStore } from "@/store/employeeLeaveStore";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

const EmployeeDashboardPage = () => {
  const { t, ready } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const {
    currentWeekOrders,
    archivedOrders,
    dashboardStats,
    loading,
    fetchCurrentWeekOrders,
    fetchArchivedOrders,
    fetchDashboardStats,
    updateOrderStatus,
  } = useEmployeeDashboardStore();

  const {
    stats: leaveStats,
    fetchLeaveStats,
  } = useEmployeeLeaveStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && ready) {
      fetchCurrentWeekOrders();
      fetchArchivedOrders();
      fetchDashboardStats();
      fetchLeaveStats();
    }
  }, [
    mounted,
    ready,
    fetchCurrentWeekOrders,
    fetchArchivedOrders,
    fetchDashboardStats,
    fetchLeaveStats,
  ]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-100 text-red-800";
    if (priority >= 5) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return t("employee.dashboard.dateLabels.today");
    if (isTomorrow(date)) return t("employee.dashboard.dateLabels.tomorrow");
    return format(date, "MMM d");
  };

  if (!mounted || !ready) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={`mounted-${i}`} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }



  if (loading && !dashboardStats) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={`loading-${i}`} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">{t("employee.dashboard.title", "My Dashboard")}</h1>
        <p className="text-muted-foreground">
          {t("employee.dashboard.subtitle", "Overview of your current assignments and performance")}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("employee.dashboard.metrics.thisWeekOrders")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.currentWeekOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("employee.dashboard.metrics.ordersAssignedThisWeek")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("employee.dashboard.metrics.completedOrders")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardStats?.completedOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t("employee.dashboard.metrics.totalCompleted")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("employee.dashboard.metrics.pendingOrders")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardStats?.pendingOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t("employee.dashboard.metrics.awaitingCompletion")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("employee.dashboard.metrics.hoursWorked")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.totalHoursWorked?.toFixed(1) || 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              {t("employee.dashboard.metrics.totalHoursLogged")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("employee.dashboard.metrics.avgHoursPerOrder")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.averageHoursPerOrder?.toFixed(1) || 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              {t("employee.dashboard.metrics.averagePerOrder")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("employee.dashboard.metrics.upcomingDeadlines")}</CardTitle>
            <Target className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardStats?.upcomingDeadlines || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("employee.dashboard.metrics.dueInNext7Days")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Statistics */}
      {leaveStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {t("employee.dashboard.leaveStats.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{leaveStats.totalDays}</div>
                <div className="text-sm text-muted-foreground">{t("employee.dashboard.leaveStats.totalDays")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{leaveStats.approvedDays}</div>
                <div className="text-sm text-muted-foreground">{t("employee.dashboard.leaveStats.approved")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{leaveStats.pendingDays}</div>
                <div className="text-sm text-muted-foreground">{t("employee.dashboard.leaveStats.pending")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{leaveStats.rejectedDays}</div>
                <div className="text-sm text-muted-foreground">{t("employee.dashboard.leaveStats.rejected")}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Week Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("employee.dashboard.currentWeekOrders.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">{t("employee.dashboard.currentWeekOrders.loadingOrders")}</p>
            </div>
          ) : currentWeekOrders.length > 0 ? (
            <div className="space-y-4">
              {currentWeekOrders.map((order, index) => (
                <div
                  key={`current-${order.id}-${index}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium">{order.title}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {t(`employee.dashboard.status.${order.status.toLowerCase().replace('_', '')}`) || order.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {t("employee.dashboard.currentWeekOrders.priority")} {order.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {t("employee.dashboard.currentWeekOrders.orderNumber")}{order.orderNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("employee.dashboard.currentWeekOrders.scheduled")}: {getDateLabel(order.scheduledDate)} ({format(parseISO(order.scheduledDate), 'MMM d, yyyy')})
                    </div>
                    {order.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {order.description}
                      </div>
                    )}
                    {(order.estimatedHours || order.actualHours) && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {order.estimatedHours && `${t("employee.dashboard.currentWeekOrders.estimated")}: ${order.estimatedHours}h`}
                        {order.estimatedHours && order.actualHours && ' | '}
                        {order.actualHours && `${t("employee.dashboard.currentWeekOrders.actual")}: ${order.actualHours}h`}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {order.status !== 'COMPLETED' && (
                      <>
                        {order.status === 'ASSIGNED' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'IN_PROGRESS')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            {t("employee.dashboard.actions.start")}
                          </Button>
                        )}
                        {order.status === 'IN_PROGRESS' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order.id, 'PENDING')}
                            >
                              <PauseCircle className="h-4 w-4 mr-1" />
                              {t("employee.dashboard.actions.pause")}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {t("employee.dashboard.actions.complete")}
                            </Button>
                          </>
                        )}
                        {order.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'IN_PROGRESS')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            {t("employee.dashboard.actions.resume")}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t("employee.dashboard.currentWeekOrders.noOrders")}</p>
              <p className="text-sm">{t("employee.dashboard.currentWeekOrders.newOrdersMonday")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Archived Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("employee.dashboard.archivedOrders.title")}
            <Badge variant="outline">{archivedOrders.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {archivedOrders.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {archivedOrders.slice(0, 10).map((order, index) => (
                <div
                  key={`archived-${order.id}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-medium text-sm">{order.title}</div>
                      <Badge className={getStatusColor(order.status)} variant="outline">
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)} variant="outline">
                        P{order.priority}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      #{order.orderNumber} • {t("employee.dashboard.archivedOrders.completed")}: {format(parseISO(order.scheduledDate), 'MMM d, yyyy')}
                    </div>
                    {(order.estimatedHours || order.actualHours) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {order.estimatedHours && `${t("employee.dashboard.currentWeekOrders.estimated")}: ${order.estimatedHours}h`}
                        {order.estimatedHours && order.actualHours && ' | '}
                        {order.actualHours && `${t("employee.dashboard.currentWeekOrders.actual")}: ${order.actualHours}h`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {archivedOrders.length > 10 && (
                <div className="text-center text-sm text-muted-foreground pt-2">
                  {t("employee.dashboard.archivedOrders.showingCount", { showing: 10, total: archivedOrders.length })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("employee.dashboard.archivedOrders.noArchivedOrders")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboardPage;

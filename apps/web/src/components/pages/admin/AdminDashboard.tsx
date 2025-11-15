"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShoppingCart,
  UserPlus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Building,
} from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { useTranslation } from '@/hooks/useTranslation';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const {
    dashboardStats,
    customerStats,
    averageValues,
    employeeHours,
    loading,
    fetchDashboardStats,
    fetchCustomerStats,
    fetchAverageValues,
    fetchEmployeeHours,
  } = useAdminStore();

  useEffect(() => {
    setMounted(true);
    fetchDashboardStats();
    fetchCustomerStats();
    fetchAverageValues();
    fetchEmployeeHours();
  }, [
    fetchDashboardStats,
    fetchCustomerStats,
    fetchAverageValues,
    fetchEmployeeHours,
  ]);

  if (!mounted || (loading && !dashboardStats)) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
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
        <h1 className="text-3xl font-bold text-foreground mb-1">{t('admin.dashboard.title', 'Dashboard')}</h1>
        <p className="text-muted-foreground">
          {t('admin.dashboard.subtitle', 'Overview of your organization\'s performance')}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.dashboard.metrics.orders30Days')}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.ordersLast30Days || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.metrics.newOrders')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.dashboard.metrics.newCustomers')}</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.newCustomersLast30Days || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t('admin.dashboard.metrics.addedThisMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.dashboard.metrics.newEmployees')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.newEmployeesLast30Days || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t('admin.dashboard.metrics.hiredThisMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.dashboard.metrics.onLeave')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.employeesOnLeave || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.metrics.employeesOnLeave')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.dashboard.metrics.unassignedOrders')}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardStats?.unassignedOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.metrics.ordersNeedingAssignment')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.dashboard.metrics.completedOrders')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardStats?.completedOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.metrics.totalCompletedOrders')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer & Average Values */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {t('admin.dashboard.customerStats.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t('admin.dashboard.customerStats.totalCustomers')}
              </span>
              <Badge variant="outline">
                {customerStats?.totalCustomers || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t('admin.dashboard.customerStats.activeCustomers')}
              </span>
              <Badge variant="outline">
                {customerStats?.activeCustomers || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t('admin.dashboard.customerStats.avgOrdersPerCustomer')}
              </span>
              <Badge variant="outline">
                {customerStats?.avgOrdersPerCustomer || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('admin.dashboard.averageValues.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t('admin.dashboard.averageValues.orderDuration')}
              </span>
              <Badge variant="outline">
                {averageValues?.avgOrderDuration || 0}h
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('admin.dashboard.averageValues.hourlyRate')}</span>
              <Badge variant="outline">
                ${averageValues?.avgEmployeeHourlyRate || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t('admin.dashboard.averageValues.estimatedHours')}
              </span>
              <Badge variant="outline">
                {Number(averageValues?.avgEstimatedHours).toFixed(2) || 0}h
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t('admin.dashboard.averageValues.actualHours')}
              </span>
              <Badge variant="outline">
                {averageValues?.avgActualHours || 0}h
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Employees by Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('admin.dashboard.topEmployees.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employeeHours.length > 0 ? (
            <div className="space-y-4">
              {employeeHours.slice(0, 5).map((employee) => (
                <div
                  key={employee.employeeId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{employee.employeeName}</div>
                    <div className="text-sm text-muted-foreground">
                      #{employee.employeeCode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {employee.totalActualHours}h {t('admin.dashboard.topEmployees.actual')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {employee.assignmentCount} {t('admin.dashboard.topEmployees.assignments')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t('admin.dashboard.topEmployees.noData')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;

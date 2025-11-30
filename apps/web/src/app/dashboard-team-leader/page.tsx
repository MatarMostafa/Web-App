"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Users, FileBox, CheckCircle, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardData {
  team: any;
  orders: any[];
  statistics: {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    totalTeamMembers: number;
  };
}

const TeamLeaderDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-leader/dashboard`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchDashboard();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t('teamLeader.dashboard.failedToLoad')}</p>
      </div>
    );
  }

  const { statistics } = dashboardData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('teamLeader.dashboard.title')}</h1>
        <p className="text-gray-600 mt-2">{t('teamLeader.dashboard.subtitle')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('teamLeader.dashboard.totalOrders')}</CardTitle>
            <FileBox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('teamLeader.dashboard.activeOrders')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.activeOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('teamLeader.dashboard.completedOrders')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.completedOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('teamLeader.dashboard.teamMembers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalTeamMembers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t('teamLeader.dashboard.myTeams')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!dashboardData.team ? (
            <p className="text-gray-500">{t('teamLeader.dashboard.noTeamsAssigned')}</p>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{dashboardData.team.name}</h3>
                  {dashboardData.team.description && (
                    <p className="text-sm text-gray-600 mt-1">{dashboardData.team.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {dashboardData.team.members?.length || 0} {t('teamLeader.dashboard.members')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{t('teamLeader.dashboard.recentOrders')}</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.orders.length === 0 ? (
            <p className="text-gray-500">{t('teamLeader.orders.noOrdersFound')}</p>
          ) : (
            <div className="space-y-4">
              {dashboardData.orders.slice(0, 5).map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{order.orderNumber}</h3>
                      {order.title && (
                        <p className="text-sm text-gray-600 mt-1">{order.title}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {t('teamLeader.dashboard.status')}: <span className="capitalize">{order.status.toLowerCase()}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(order.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamLeaderDashboard;
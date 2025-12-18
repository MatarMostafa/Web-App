import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, MessageSquare, RefreshCw, UserPlus, Calendar, Package } from "lucide-react";
import { OrderActivity, orderActivitiesApi } from "@/lib/orderActivitiesApi";
import { format } from "date-fns";

interface OrderActivitiesProps {
  orderId: string;
}

const getActivityIcon = (type: OrderActivity['type']) => {
  switch (type) {
    case 'STATUS_CHANGE':
      return <RefreshCw className="h-4 w-4" />;
    case 'NOTE_ADDED':
      return <MessageSquare className="h-4 w-4" />;
    case 'ASSIGNMENT_CHANGED':
      return <UserPlus className="h-4 w-4" />;
    case 'ORDER_CREATED':
      return <Calendar className="h-4 w-4" />;
    case 'ACTIVITY_ASSIGNED':
      return <Package className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActivityColor = (type: OrderActivity['type']) => {
  switch (type) {
    case 'STATUS_CHANGE':
      return "bg-blue-100 text-blue-800";
    case 'NOTE_ADDED':
      return "bg-green-100 text-green-800";
    case 'ASSIGNMENT_CHANGED':
      return "bg-purple-100 text-purple-800";
    case 'ORDER_CREATED':
      return "bg-gray-100 text-gray-800";
    case 'ACTIVITY_ASSIGNED':
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const OrderActivities: React.FC<OrderActivitiesProps> = ({ orderId }) => {
  const [activities, setActivities] = useState<OrderActivity[]>([]);
  const [loading, setLoading] = useState(true);
  console.log("order id = ", orderId)
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const data = await orderActivitiesApi.getOrderActivities(orderId);
        setActivities(data);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [orderId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Order Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Order Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No activities found for this order.
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace('_', ' ').toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activity.authorName}</span>
                    <span>•</span>
                    <span>{format(new Date(activity.timestamp), "MMM dd, yyyy 'at' HH:mm")}</span>
                  </div>
                  {activity.metadata?.noteContent && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      {activity.metadata.noteContent}
                    </div>
                  )}
                  {activity.metadata?.oldStatus && activity.metadata?.newStatus && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Badge variant="outline">{activity.metadata.oldStatus}</Badge>
                      <span>→</span>
                      <Badge variant="outline">{activity.metadata.newStatus}</Badge>
                    </div>
                  )}
                  {activity.type === 'ACTIVITY_ASSIGNED' && activity.metadata && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm space-y-1">
                      {activity.metadata.activityCode && (
                        <div className="text-xs text-muted-foreground">Code: {activity.metadata.activityCode}</div>
                      )}
                      <div className="flex justify-between items-center">
                        <span>Quantity: {activity.metadata.quantity}</span>
                        {activity.metadata.unitPrice && (
                          <span>€{Number(activity.metadata.unitPrice).toFixed(2)}/{activity.metadata.unit}</span>
                        )}
                      </div>
                      {activity.metadata.lineTotal && (
                        <div className="font-medium">Total: €{Number(activity.metadata.lineTotal).toFixed(2)}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
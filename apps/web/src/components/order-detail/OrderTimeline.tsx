"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  FileText,
  UserPlus,
  UserMinus,
  AlertCircle
} from "lucide-react";
import { orderNotesApi, OrderNote } from "@/lib/orderNotesApi";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface TimelineEvent {
  id: string;
  type: "note" | "status_change" | "assignment" | "system";
  timestamp: string;
  actor?: string;
  title: string;
  description?: string;
  status?: string;
  noteContent?: string;
}

interface OrderTimelineProps {
  orderId: string;
  order: any;
  userRole: "ADMIN" | "EMPLOYEE";
}

const getEventIcon = (type: string, status?: string) => {
  switch (type) {
    case "note":
      return <MessageSquare className="h-4 w-4" />;
    case "status_change":
      switch (status) {
        case "COMPLETED":
          return <CheckCircle className="h-4 w-4 text-green-600" />;
        case "CANCELLED":
          return <XCircle className="h-4 w-4 text-red-600" />;
        case "IN_PROGRESS":
          return <Play className="h-4 w-4 text-blue-600" />;
        case "IN_REVIEW":
          return <AlertCircle className="h-4 w-4 text-orange-600" />;
        default:
          return <Clock className="h-4 w-4" />;
      }
    case "assignment":
      return <UserPlus className="h-4 w-4 text-blue-600" />;
    case "system":
      return <FileText className="h-4 w-4 text-gray-600" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getEventColor = (type: string, status?: string) => {
  switch (type) {
    case "note":
      return "border-blue-200 bg-blue-50";
    case "status_change":
      switch (status) {
        case "COMPLETED":
          return "border-green-200 bg-green-50";
        case "CANCELLED":
          return "border-red-200 bg-red-50";
        case "IN_PROGRESS":
          return "border-blue-200 bg-blue-50";
        case "IN_REVIEW":
          return "border-orange-200 bg-orange-50";
        default:
          return "border-gray-200 bg-gray-50";
      }
    case "assignment":
      return "border-purple-200 bg-purple-50";
    case "system":
      return "border-gray-200 bg-gray-50";
    default:
      return "border-gray-200 bg-gray-50";
  }
};

const createTimelineEvent = (event: Omit<TimelineEvent, 'timestamp'> & { timestamp: string | null | undefined }): TimelineEvent | null => {
  if (!event.timestamp || isNaN(new Date(event.timestamp).getTime())) {
    return null;
  }
  return event as TimelineEvent;
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  orderId,
  order,
  userRole,
}) => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order) {
      setLoading(false);
      return;
    }

    // Create timeline events based on order data
    const timelineEvents: TimelineEvent[] = [];
    
    // Order created event
    const createdEvent = createTimelineEvent({
      id: "created",
      type: "system",
      timestamp: order.createdAt,
      actor: t("employee.orderDetail.system"),
      title: t("employee.orderDetail.orderCreated"),
      description: `${t("order.order")} #${order.orderNumber} ${t("employee.orderDetail.orderCreated").toLowerCase()}`,
    });
    if (createdEvent) timelineEvents.push(createdEvent);
    
    // Status-based events
    if (order.status === "ACTIVE") {
      const activeEvent = createTimelineEvent({
        id: "activated",
        type: "status_change",
        timestamp: order.updatedAt,
        actor: t("employee.orderDetail.system"),
        title: t("employee.orderDetail.orderActivated"),
        description: t("employee.orderDetail.orderActiveReady"),
        status: "ACTIVE",
      });
      if (activeEvent) timelineEvents.push(activeEvent);
    }
    
    if (order.status === "IN_PROGRESS") {
      const progressEvent = createTimelineEvent({
        id: "started",
        type: "status_change",
        timestamp: order.updatedAt,
        actor: t("employee.orderDetail.system"),
        title: t("employee.orderDetail.workStarted"),
        description: t("employee.orderDetail.workBegun"),
        status: "IN_PROGRESS",
      });
      if (progressEvent) timelineEvents.push(progressEvent);
    }
    
    if (order.status === "IN_REVIEW") {
      const reviewEvent = createTimelineEvent({
        id: "review",
        type: "status_change",
        timestamp: order.updatedAt,
        actor: t("employee.orderDetail.system"),
        title: t("employee.orderDetail.reviewRequested"),
        description: t("employee.orderDetail.orderSubmittedReview"),
        status: "IN_REVIEW",
      });
      if (reviewEvent) timelineEvents.push(reviewEvent);
    }
    
    if (order.status === "COMPLETED") {
      const completedEvent = createTimelineEvent({
        id: "completed",
        type: "status_change",
        timestamp: order.updatedAt,
        actor: t("employee.orderDetail.system"),
        title: t("employee.orderDetail.orderCompleted"),
        description: t("employee.orderDetail.orderCompletedSuccess"),
        status: "COMPLETED",
      });
      if (completedEvent) timelineEvents.push(completedEvent);
    }
    
    if (order.status === "CANCELLED") {
      const cancelledEvent = createTimelineEvent({
        id: "cancelled",
        type: "status_change",
        timestamp: order.updatedAt,
        actor: t("employee.orderDetail.system"),
        title: t("employee.orderDetail.orderCancelled"),
        description: t("employee.orderDetail.orderCancelledDesc"),
        status: "CANCELLED",
      });
      if (cancelledEvent) timelineEvents.push(cancelledEvent);
    }
    
    // Sort events by timestamp (newest first), handling invalid dates
    const sortedEvents = timelineEvents.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateB.getTime() - dateA.getTime();
    });
    
    setEvents(sortedEvents);
    setLoading(false);
  }, [order]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("employee.orderDetail.timeline")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
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
        <CardTitle>{t("employee.orderDetail.timeline")}</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("employee.orderDetail.noTimelineEvents")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline line */}
                {index < events.length - 1 && (
                  <div className="absolute left-4 top-8 w-px h-6 bg-border"></div>
                )}
                
                <div className="flex gap-3">
                  {/* Event icon */}
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getEventColor(event.type, event.status)}`}>
                    {getEventIcon(event.type, event.status)}
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {event.type.replace("_", " ")}
                      </Badge>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {event.actor && (
                        <>
                          <User className="h-3 w-3" />
                          <span>{event.actor}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>
                        {event.timestamp && !isNaN(new Date(event.timestamp).getTime()) 
                          ? format(new Date(event.timestamp), "MMM dd, yyyy 'at' HH:mm")
                          : t("employee.orderDetail.invalidDate")
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
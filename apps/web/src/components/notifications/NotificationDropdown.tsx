"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/hooks/useTranslation";
import { translateNotification } from "@/utils/notificationTranslator";

interface Notification {
  id: string;
  readAt: string | null;
  createdAt: string;
  notification: {
    id: string;
    title: string;
    body: string;
    templateKey?: string | null;
    data?: any;
  };
}

export function NotificationDropdown() {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  // Get current locale for date formatting
  const currentLocale = i18n.language === 'de' ? de : enUS;



  const fetchNotifications = async () => {
    try {
      const data = await apiClient.get<{ success: boolean; data: { items: Notification[] } }>("/api/notifications");
      if (data.success && data.data?.items) {
        setNotifications(data.data.items);
      } else {
        setNotifications([]);
      }
    } catch (error: any) {
      // Handle blocked user silently - don't spam console
      if (error.message && error.message.includes('gesperrt')) {
        return false; // Signal that user is blocked
      }
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    }
    return true; // Signal success or non-blocking error
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await apiClient.get<{ success: boolean; data: number }>("/api/notifications/unread-count");
      if (data.success) {
        setUnreadCount(data.data);
      } else {
        setUnreadCount(0);
      }
    } catch (error: any) {
      // Handle blocked user silently - don't spam console
      if (error.message && error.message.includes('gesperrt')) {
        return false; // Signal that user is blocked
      }
      console.error("Failed to fetch unread count:", error);
      setUnreadCount(0);
    }
    return true; // Signal success or non-blocking error
  };

  const handleMarkAllAsRead = async () => {
    if (markingAllRead) return;
    
    setMarkingAllRead(true);
    try {
      await apiClient.post('/api/notifications/mark-all-read', {});
      // Refresh notifications and unread count
      await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Close dropdown
    setOpen(false);
    
    // Mark as read (non-blocking)
    apiClient.post(`/api/notifications/${notification.id}/read`, {})
      .then(() => {
        fetchNotifications();
        fetchUnreadCount();
      })
      .catch((error) => {
        console.error("Failed to mark as read:", error);
      });

    // Handle order-related notifications
    const data = notification.notification.data;
    const templateKey = notification.notification.templateKey;
    
    if (data?.category === "order" && data?.orderId && data?.orderNumber) {
      // Determine which orders page to navigate to based on user role or notification type
      let targetPath = "";
      
      // Check if it's an assignment notification (employee should go to employee orders)
      if (templateKey === "ASSIGNMENT_CREATED" || templateKey === "ASSIGNMENT_UPDATED") {
        targetPath = "/dashboard-employee/orders";
      } else {
        // For other order notifications, check current path to determine target
        const currentPath = window.location.pathname;
        if (currentPath.includes("/dashboard-employee")) {
          targetPath = "/dashboard-employee/orders";
        } else {
          targetPath = "/dashboard-admin/orders";
        }
      }
      
      // Navigate to orders page
      router.push(targetPath);
      
      // Handle order notifications that should open notes dialog
      const orderNotesTemplates = [
        "ORDER_NOTE_ADDED",
        "ORDER_APPROVED", 
        "ORDER_REJECTED",
        "ORDER_STATUS_CHANGED",
        "ORDER_COMPLETED",
        "ORDER_WORK_STARTED",
        "ORDER_REVIEW_REQUESTED"
      ];
      
      if (templateKey && orderNotesTemplates.includes(templateKey) && data?.orderId) {
        // Store for cross-page navigation
        sessionStorage.setItem('openOrderNotes', JSON.stringify({
          orderId: data.orderId,
          orderNumber: data.orderNumber
        }));
        
        // Also dispatch event for same-page (with delay)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('openOrderNotes', { 
            detail: { 
              orderId: data.orderId, 
              orderNumber: data.orderNumber 
            } 
          }));
        }, 100);
      }
    } else if (data?.category === "assignment") {
      // For assignment notifications, navigate to employee orders page
      router.push("/dashboard-employee/orders");
    } else if (data?.category === "leave") {
      // Handle leave notifications
      const templateKey = notification.notification.templateKey;
      if (templateKey === "LEAVE_REQUESTED") {
        // Admin received leave request - go to admin leave management and refresh data
        router.push("/dashboard-admin/leave-management");
        // Trigger a custom event to refresh leave data
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refreshLeaveData', { detail: { type: 'admin' } }));
        }, 100);
      } else if (templateKey === "LEAVE_APPROVED" || templateKey === "LEAVE_REJECTED") {
        // Employee received approval/rejection - go to employee leaves page and refresh data
        router.push("/dashboard-employee/leaves");
        // Trigger a custom event to refresh leave data
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refreshLeaveData', { detail: { type: 'employee' } }));
        }, 100);
      }
    }
  };

  useEffect(() => {
    const pollNotifications = async () => {
      const [notificationsResult, unreadResult] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount()
      ]);
      
      // If either request indicates user is blocked, stop polling
      if (notificationsResult === false || unreadResult === false) {
        return false;
      }
      return true;
    };
    
    // Initial fetch
    pollNotifications();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(async () => {
      const shouldContinue = await pollNotifications();
      if (!shouldContinue) {
        clearInterval(interval);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center min-w-[20px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{t('notificationUI.title')}</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markingAllRead}
                className="text-xs text-foreground
                bg-muted
                hover:text-foreground"
              >
                {markingAllRead ? t('notificationUI.marking') : t('notificationUI.markAllRead')}
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {t('notificationUI.noNotifications')}
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-muted/50 cursor-pointer border-b border-border transition-colors ${
                    !notification.readAt ? "bg-accent/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      {(() => {
                        const translated = translateNotification(
                          notification.notification.templateKey || null,
                          notification.notification.title,
                          notification.notification.body,
                          notification.notification.data,
                          t
                        );
                        
                        return (
                          <>
                            <h4 className="font-semibold text-sm text-foreground">
                              {translated.title}
                            </h4>
                            <p className="text-sm text-foreground/60 mt-1 break-words">
                              {translated.body}
                            </p>
                          </>
                        );
                      })()}
                      <p className="text-xs text-foreground/50 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: currentLocale,
                        })}
                      </p>
                    </div>
                    {!notification.readAt && (
                      <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
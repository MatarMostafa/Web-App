import { useEffect } from 'react';

// Global event system for order notifications
const orderNotificationEvents = new EventTarget();

export const useOrderNotifications = (onOrderNotificationClick: (orderId: string, orderNumber: string) => void) => {
  useEffect(() => {
    const handleOrderNotification = (event: CustomEvent) => {
      const { orderId, orderNumber } = event.detail;
      onOrderNotificationClick(orderId, orderNumber);
    };

    orderNotificationEvents.addEventListener('orderNotification', handleOrderNotification as EventListener);

    return () => {
      orderNotificationEvents.removeEventListener('orderNotification', handleOrderNotification as EventListener);
    };
  }, [onOrderNotificationClick]);
};

export const triggerOrderNotification = (orderId: string, orderNumber: string) => {
  const event = new CustomEvent('orderNotification', {
    detail: { orderId, orderNumber }
  });
  orderNotificationEvents.dispatchEvent(event);
};
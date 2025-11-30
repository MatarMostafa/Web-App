import { TFunction } from 'i18next';

interface NotificationData {
  orderNumber?: string;
  customerName?: string;
  employeeName?: string;
  statusMessage?: string;
  notePreview?: string;
  reason?: string;
  departmentName?: string;
  positionTitle?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  scheduledDate?: string;
  status?: string;
  newDate?: string;
}

export const translateNotification = (
  templateKey: string | null,
  title: string,
  body: string,
  data: NotificationData | null,
  t: TFunction
): { title: string; body: string } => {
  // If no template key, return original (for backwards compatibility)
  if (!templateKey) {
    return { title, body };
  }

  try {
    

    // Map template keys to translation keys
    const translationKey = getTranslationKey(templateKey);
    if (!translationKey) {
      return { title, body };
    }

    // For existing notifications that don't have employeeName/notePreview in data,
    // but the original body already contains the complete information, just return original
    if ((templateKey === 'ORDER_REVIEW_REQUESTED' && !data?.employeeName) ||
        (templateKey === 'ORDER_NOTE_ADDED' && !data?.notePreview) ||
        (templateKey === 'ORDER_WORK_STARTED' && !data?.employeeName)) {
      return { title, body };
    }

    // For customer notifications, extract data from the backend body if not in data object
    if (templateKey?.startsWith('CUSTOMER_')) {
      // Extract values from the backend-generated body text if data fields are missing
      if (!data?.scheduledDate && templateKey === 'CUSTOMER_ORDER_CREATED') {
        const dateMatch = body.match(/scheduled for ([^.]+)/);
        if (dateMatch) {
          (data as any) = { ...data, scheduledDate: dateMatch[1] };
        }
      }
      
      if (!data?.status && templateKey === 'CUSTOMER_ORDER_STATUS_CHANGED') {
        const statusMatch = body.match(/updated to (.+)\.$/);
        if (statusMatch) {
          (data as any) = { ...data, status: statusMatch[1] };
        }
      }
    }

    // Prepare translation data with proper fallbacks
    // Handle both direct data and nested data structures
    const extractValue = (key: string) => {
      return data?.[key as keyof NotificationData] || 
             (data as any)?.[key] || 
             '';
    };

    const translationData = {
      orderNumber: extractValue('orderNumber'),
      customerName: extractValue('customerName'),
      employeeName: extractValue('employeeName'),
      statusMessage: extractValue('statusMessage'),
      notePreview: extractValue('notePreview'),
      reason: extractValue('reason'),
      departmentName: extractValue('departmentName'),
      positionTitle: extractValue('positionTitle'),
      leaveType: extractValue('leaveType'),
      startDate: extractValue('startDate'),
      endDate: extractValue('endDate'),
      scheduledDate: extractValue('scheduledDate'),
      status: extractValue('status'),
      newDate: extractValue('newDate'),
      changeType: extractValue('changeType'),
      currentValue: extractValue('currentValue'),
      requestedValue: extractValue('requestedValue')
    };

    // Get translated title and body with interpolation
    const translatedTitle = t(`${translationKey}.title`, translationData);
    const translatedBody = t(`${translationKey}.body`, translationData);

    return {
      title: translatedTitle,
      body: translatedBody
    };
  } catch (error) {
    console.warn('Failed to translate notification:', error);
    return { title, body };
  }
};

const getTranslationKey = (templateKey: string): string | null => {
  const keyMap: Record<string, string> = {
    'ASSIGNMENT_CREATED': 'notifications.assignment.created',
    'ASSIGNMENT_UPDATED': 'notifications.assignment.updated',
    'ASSIGNMENT_CANCELLED': 'notifications.assignment.cancelled',
    'ORDER_STATUS_CHANGED': 'notifications.order.statusChanged',
    'ORDER_COMPLETED': 'notifications.order.completed',
    'ORDER_WORK_STARTED': 'notifications.order.workStarted',
    'ORDER_REVIEW_REQUESTED': 'notifications.order.reviewRequested',
    'ORDER_NOTE_ADDED': 'notifications.order.noteAdded',
    'ORDER_APPROVED': 'notifications.order.approved',
    'ORDER_REJECTED': 'notifications.order.rejected',
    'LEAVE_REQUESTED': 'notifications.leave.requested',
    'LEAVE_APPROVED': 'notifications.leave.approved',
    'LEAVE_REJECTED': 'notifications.leave.rejected',
    'WELCOME_NEW_EMPLOYEE': 'notifications.system.welcome',
    'PROFILE_UPDATED': 'notifications.system.profileUpdated',
    'EMPLOYEE_BLOCKED': 'notifications.system.employeeBlocked',
    'EMPLOYEE_UNBLOCKED': 'notifications.system.employeeUnblocked',
    'CUSTOMER_BLOCKED': 'notifications.system.customerBlocked',
    'CUSTOMER_UNBLOCKED': 'notifications.system.customerUnblocked',
    'CUSTOMER_ORDER_CREATED': 'notifications.customer.created',
    'CUSTOMER_ORDER_STATUS_CHANGED': 'notifications.customer.orderStatusChanged',
    'CUSTOMER_ORDER_COMPLETED': 'notifications.customer.orderCompleted',
    'CUSTOMER_ORDER_CANCELLED': 'notifications.customer.orderCancelled',
    'CUSTOMER_ORDER_SCHEDULE_CHANGED': 'notifications.customer.orderScheduleChanged',
    'SETTINGS_CHANGE_REQUESTED': 'notifications.settings.changeRequested',
    'SETTINGS_CHANGE_APPROVED': 'notifications.settings.changeApproved',
    'SETTINGS_CHANGE_REJECTED': 'notifications.settings.changeRejected'
  };

  return keyMap[templateKey] || null;
};
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

    // Prepare translation data with proper fallbacks
    const translationData = {
      orderNumber: data?.orderNumber || '',
      customerName: data?.customerName || '',
      employeeName: data?.employeeName || '',
      statusMessage: data?.statusMessage || '',
      notePreview: data?.notePreview || '',
      reason: data?.reason || '',
      departmentName: data?.departmentName || '',
      positionTitle: data?.positionTitle || '',
      leaveType: data?.leaveType || '',
      startDate: data?.startDate || '',
      endDate: data?.endDate || ''
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
    'EMPLOYEE_UNBLOCKED': 'notifications.system.employeeUnblocked'
  };

  return keyMap[templateKey] || null;
};
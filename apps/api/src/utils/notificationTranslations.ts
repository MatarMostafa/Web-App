// src/utils/notificationTranslations.ts
import { prisma } from "@repo/db";

// Translation mappings for notifications
const translations = {
  en: {
    assignment: {
      created: {
        title: "New Order Assignment",
        body: "You have been assigned to order \"{{orderNumber}}\". Customer: {{customerName}}"
      },
      updated: {
        title: "Assignment Updated", 
        body: "Your assignment for order \"{{orderNumber}}\" has been updated."
      },
      cancelled: {
        title: "Assignment Cancelled",
        body: "Your assignment for order \"{{orderNumber}}\" has been cancelled."
      }
    },
    order: {
      statusChanged: {
        title: "Order Status Changed",
        body: "Order \"{{orderNumber}}\" {{statusMessage}}."
      },
      completed: {
        title: "Order Completed",
        body: "Order \"{{orderNumber}}\" has been successfully completed. Customer: {{customerName}}"
      },
      workStarted: {
        title: "Work Started",
        body: "{{employeeName}} has started work on order \"{{orderNumber}}\"."
      },
      reviewRequested: {
        title: "Order Completion Review Requested",
        body: "{{employeeName}} has completed order \"{{orderNumber}}\" and is requesting your review for final approval."
      },
      noteAdded: {
        title: "New Order Note",
        body: "New note added to order \"{{orderNumber}}\": {{notePreview}}"
      },
      approved: {
        title: "Order Approved",
        body: "Order \"{{orderNumber}}\" has been approved and completed."
      },
      rejected: {
        title: "Order Rejected",
        body: "Order \"{{orderNumber}}\" has been rejected and needs revision.{{reason}}"
      }
    },
    leave: {
      requested: {
        title: "Leave Request Submitted",
        body: "{{employeeName}} has submitted a {{leaveType}} request from {{startDate}} to {{endDate}}:{{reason}}"
      },
      approved: {
        title: "Leave Request Approved",
        body: "Your leave request has been approved."
      },
      rejected: {
        title: "Leave Request Rejected",
        body: "Your leave request has been rejected.{{reason}}"
      }
    },
    system: {
      welcome: {
        title: "Welcome to the Team!",
        body: "Welcome to our ERP system. Your account has been successfully created."
      },
      profileUpdated: {
        title: "Profile Updated",
        body: "Your profile has been successfully updated."
      },
      employeeBlocked: {
        title: "Account Blocked",
        body: "Your account has been blocked.{{reason}}"
      },
      employeeUnblocked: {
        title: "Account Unblocked",
        body: "Your account has been unblocked. You can now access the system normally."
      },
      departmentCreated: {
        title: "New Department Created",
        body: "New department \"{{departmentName}}\" has been created."
      },
      positionCreated: {
        title: "New Position Created",
        body: "New position \"{{positionTitle}}\" has been created."
      }
    },
    customer: {
      created: {
        title: "New Customer Added",
        body: "New customer \"{{customerName}}\" has been added to the system."
      }
    },
    statusMessages: {
      ACTIVE: "has been activated",
      IN_PROGRESS: "is in progress", 
      IN_REVIEW: "is under review",
      COMPLETED: "has been completed",
      CANCELLED: "has been cancelled"
    }
  },
  de: {
    assignment: {
      created: {
        title: "Neue Auftragszuweisung",
        body: "Sie wurden dem Auftrag \"{{orderNumber}}\" zugewiesen. Kunde: {{customerName}}"
      },
      updated: {
        title: "Zuweisung aktualisiert",
        body: "Ihre Zuweisung für Auftrag \"{{orderNumber}}\" wurde aktualisiert."
      },
      cancelled: {
        title: "Zuweisung storniert", 
        body: "Ihre Zuweisung für Auftrag \"{{orderNumber}}\" wurde storniert."
      }
    },
    order: {
      statusChanged: {
        title: "Auftragsstatus geändert",
        body: "Auftrag \"{{orderNumber}}\" {{statusMessage}}."
      },
      completed: {
        title: "Auftrag abgeschlossen",
        body: "Auftrag \"{{orderNumber}}\" wurde erfolgreich abgeschlossen. Kunde: {{customerName}}"
      },
      workStarted: {
        title: "Arbeit begonnen",
        body: "{{employeeName}} hat die Arbeit an Auftrag \"{{orderNumber}}\" begonnen."
      },
      reviewRequested: {
        title: "Auftragsabschluss-Überprüfung angefordert",
        body: "{{employeeName}} hat Auftrag \"{{orderNumber}}\" abgeschlossen und bittet um Ihre Überprüfung für die finale Genehmigung."
      },
      noteAdded: {
        title: "Neue Auftragsnotiz",
        body: "Neue Notiz zu Auftrag \"{{orderNumber}}\" hinzugefügt: {{notePreview}}"
      },
      approved: {
        title: "Auftrag genehmigt",
        body: "Auftrag \"{{orderNumber}}\" wurde genehmigt und abgeschlossen."
      },
      rejected: {
        title: "Auftrag abgelehnt",
        body: "Auftrag \"{{orderNumber}}\" wurde abgelehnt und muss überarbeitet werden.{{reason}}"
      }
    },
    leave: {
      requested: {
        title: "Urlaubsantrag eingereicht",
        body: "{{employeeName}} hat einen {{leaveType}} Antrag vom {{startDate}} bis {{endDate}} eingereicht:{{reason}}"
      },
      approved: {
        title: "Urlaubsantrag genehmigt",
        body: "Ihr Urlaubsantrag wurde genehmigt."
      },
      rejected: {
        title: "Urlaubsantrag abgelehnt",
        body: "Ihr Urlaubsantrag wurde abgelehnt.{{reason}}"
      }
    },
    system: {
      welcome: {
        title: "Willkommen im Team!",
        body: "Herzlich willkommen in unserem ERP-System. Ihr Konto wurde erfolgreich erstellt."
      },
      profileUpdated: {
        title: "Profil aktualisiert",
        body: "Ihr Profil wurde erfolgreich aktualisiert."
      },
      employeeBlocked: {
        title: "Konto gesperrt",
        body: "Ihr Konto wurde gesperrt.{{reason}}"
      },
      employeeUnblocked: {
        title: "Konto entsperrt",
        body: "Ihr Konto wurde entsperrt. Sie können das System nun normal nutzen."
      },
      departmentCreated: {
        title: "Neue Abteilung erstellt",
        body: "Neue Abteilung \"{{departmentName}}\" wurde erstellt."
      },
      positionCreated: {
        title: "Neue Position erstellt",
        body: "Neue Position \"{{positionTitle}}\" wurde erstellt."
      }
    },
    customer: {
      created: {
        title: "Neuer Kunde hinzugefügt",
        body: "Neuer Kunde \"{{customerName}}\" wurde zum System hinzugefügt."
      }
    },
    statusMessages: {
      ACTIVE: "wurde aktiviert",
      IN_PROGRESS: "ist in Bearbeitung",
      IN_REVIEW: "ist in Überprüfung", 
      COMPLETED: "wurde abgeschlossen",
      CANCELLED: "wurde storniert"
    }
  }
};

// Get user's preferred language (default to English)
export const getUserLanguage = async (userId: string): Promise<'en' | 'de'> => {
  try {
    // Try to get user's language preference from database or settings
    // For now, default to English - can be enhanced later
    return 'en';
  } catch (error) {
    return 'en';
  }
};

// Template replacement function
const replaceTemplate = (template: string, variables: Record<string, string>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
};

// Get translated notification content
export const getNotificationTranslation = async (
  userId: string,
  category: keyof typeof translations.en,
  type: string,
  variables: Record<string, string> = {}
): Promise<{ title: string; body: string }> => {
  const language = await getUserLanguage(userId);
  const categoryTranslations = translations[language][category] as any;
  
  if (!categoryTranslations || !categoryTranslations[type]) {
    // Fallback to English if translation not found
    const fallbackTranslations = translations.en[category] as any;
    if (!fallbackTranslations || !fallbackTranslations[type]) {
      return {
        title: "Notification",
        body: "You have a new notification."
      };
    }
    
    return {
      title: replaceTemplate(fallbackTranslations[type].title, variables),
      body: replaceTemplate(fallbackTranslations[type].body, variables)
    };
  }
  
  return {
    title: replaceTemplate(categoryTranslations[type].title, variables),
    body: replaceTemplate(categoryTranslations[type].body, variables)
  };
};

// Get status message translation
export const getStatusMessageTranslation = async (userId: string, status: string): Promise<string> => {
  const language = await getUserLanguage(userId);
  const statusMessages = translations[language].statusMessages as any;
  return statusMessages[status] || status;
};
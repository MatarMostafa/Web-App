import { prisma } from "@repo/db";
import * as XLSX from 'xlsx';
import { generateCSV } from "../utils/csvUtils";

interface ExportFilters {
  customerId?: string;
  startDate: Date;
  endDate: Date;
  format?: 'csv' | 'xlsx';
}

export const exportCustomerData = async (filters: ExportFilters): Promise<string | Buffer> => {
  try {
    const { customerId, startDate, endDate, format = 'xlsx' } = filters;

    const whereClause: any = {
      scheduledDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (customerId) {
      whereClause.customerId = customerId;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            companyName: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        qualifications: {
          include: {
            qualification: true,
            activity: true,
          },
        },
        customerActivities: {
          include: {
            activity: true,
          },
        },
        orderAssignments: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                hourlyRate: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledDate: 'desc',
      },
    });

    const csvData = orders.map(order => {
      const activities = order.customerActivities.map(ca => ca.activity.name).join('; ');
      const qualifications = order.qualifications.map(q => q.qualification.name).join('; ');
      
      const totalHours = Number(order.actualHours) || Number(order.estimatedHours) || 0;
      const totalPrice = order.qualifications.reduce((sum, q) => sum + (Number(q.lineTotal) || 0), 0);
      const activityTotal = order.customerActivities.reduce((sum, ca) => sum + (Number(ca.lineTotal) || 0), 0);
      const grandTotal = totalPrice + activityTotal;

      return {
        customerName: order.customer.companyName,
        customerEmail: order.customer.contactEmail || 'N/A',
        customerPhone: order.customer.contactPhone || 'N/A',
        orderNumber: order.orderNumber,
        orderTitle: order.title || 'N/A',
        orderStatus: order.status,
        scheduledDate: order.scheduledDate.toISOString().split('T')[0],
        startTime: order.startTime?.toISOString() || 'N/A',
        endTime: order.endTime?.toISOString() || 'N/A',
        location: order.location || 'N/A',
        activities: activities || 'N/A',
        qualifications: qualifications || 'N/A',
        estimatedHours: Number(order.estimatedHours) || 0,
        actualHours: Number(order.actualHours) || 0,
        totalHours: totalHours,
        qualificationTotal: totalPrice,
        activityTotal: activityTotal,
        grandTotal: grandTotal,
        assignedEmployees: order.orderAssignments.length,
      };
    });

    if (format === 'csv') {
      return generateCSV(csvData);
    } else {
      const ws = XLSX.utils.json_to_sheet(csvData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Customer Data');
      return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }
  } catch (error) {
    console.error('Error exporting customer data:', error);
    throw new Error('Failed to export customer data');
  }
};
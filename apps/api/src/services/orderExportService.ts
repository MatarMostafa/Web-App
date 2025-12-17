import { prisma } from '@repo/db';
import { Decimal } from 'decimal.js';

interface OrderExportLine {
  orderNumber: string;
  customerName: string;
  scheduledDate: Date;
  activityName: string;
  unit: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  currency: string;
}

export async function exportOrdersToCSV(startDate: Date, endDate: Date): Promise<string> {
  const orders = await prisma.order.findMany({
    where: {
      scheduledDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      customer: true,
      qualifications: {
        include: {
          activity: true,
          qualification: true
        }
      }
    },
    orderBy: { scheduledDate: 'asc' }
  });

  const lines: OrderExportLine[] = [];

  for (const order of orders) {
    for (const qual of order.qualifications) {
      // ALWAYS use snapshot fields from OrderQualification
      if (qual.unitPrice && qual.unit) {
        lines.push({
          orderNumber: order.orderNumber,
          customerName: order.customer.companyName,
          scheduledDate: order.scheduledDate,
          activityName: qual.activity?.name || qual.qualification.name,
          unit: qual.unit,
          quantity: qual.quantity,
          unitPrice: new Decimal(qual.unitPrice.toString()).toFixed(2),
          lineTotal: new Decimal(qual.lineTotal?.toString() || '0').toFixed(2),
          currency: 'EUR'
        });
      }
    }
  }

  // Generate CSV
  const headers = ['Order Number', 'Customer', 'Date', 'Activity', 'Unit', 'Quantity', 'Unit Price', 'Line Total', 'Currency'];
  const rows = lines.map(line => [
    line.orderNumber,
    line.customerName,
    line.scheduledDate.toISOString().split('T')[0],
    line.activityName,
    line.unit,
    line.quantity.toString(),
    line.unitPrice,
    line.lineTotal,
    line.currency
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export async function getOrderRevenue(orderId: string): Promise<{ total: Decimal; currency: string; breakdown: Array<{ activity: string; amount: Decimal }> }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      qualifications: {
        include: { activity: true, qualification: true }
      }
    }
  });

  if (!order) throw new Error('Order not found');

  let total = new Decimal(0);
  const breakdown: Array<{ activity: string; amount: Decimal }> = [];

  for (const qual of order.qualifications) {
    if (qual.lineTotal) {
      const amount = new Decimal(qual.lineTotal.toString());
      total = total.add(amount);
      breakdown.push({
        activity: qual.activity?.name || qual.qualification.name,
        amount
      });
    }
  }

  return { total, currency: 'EUR', breakdown };
}

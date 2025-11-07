"use client";
import React from "react";
import { Badge, Button } from "@/components/ui";
import { Calendar, MapPin, Users, MessageSquare } from "lucide-react";
import { OrderStatus } from "@/types/order";
import { format } from "date-fns";


interface Assignment {
  id: string;
  employeeId: string;
  orderId: string;
  assignedDate: string;
  order: {
    id: string;
    orderNumber: string;
    description?: string;
    scheduledDate: string;
    status: string;
    priority: number;
  };
}

interface EmployeeOrderTableViewProps {
  assignments: Assignment[];
  loading: boolean;
  onViewNotes: (order: any) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case OrderStatus.DRAFT:
      return "bg-gray-100 text-gray-800";
    case OrderStatus.OPEN:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.ACTIVE:
      return "bg-green-100 text-green-800";
    case OrderStatus.IN_PROGRESS:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.IN_REVIEW:
      return "bg-orange-100 text-orange-800";
    case OrderStatus.COMPLETED:
      return "bg-emerald-100 text-emerald-800";
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    case OrderStatus.EXPIRED:
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const EmployeeOrderTableView: React.FC<EmployeeOrderTableViewProps> = ({
  assignments,
  loading,
  onViewNotes,
}) => {

  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Auftrag</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Geplantes Datum</th>
              <th className="text-left p-4 font-medium">Priorität</th>
              <th className="text-left p-4 font-medium">Zuweisungsdatum</th>
              <th className="text-right p-4 font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr 
                key={assignment.id} 
                className="border-t hover:bg-muted/25"
              >
                <td className="p-4">
                  <div>
                    <div className="font-medium">{assignment.order.description || 'No description'}</div>
                    <button
                      onClick={() => window.location.href = `/dashboard-employee/orders/${assignment.order.id}`}
                      className="text-sm text-primary hover:underline cursor-pointer"
                    >
                      #{assignment.order.orderNumber}
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(assignment.order.status)}>
                      {(() => {
                      const status = assignment.order.status.toLowerCase();
                      switch(status) {
                        case 'active': return 'Aktiv';
                        case 'assigned': return 'Zugewiesen';
                        case 'in_progress': return 'In Bearbeitung';
                        case 'pending': return 'Ausstehend';
                        case 'completed': return 'Abgeschlossen';
                        case 'draft': return 'Entwurf';
                        case 'open': return 'Offen';
                        case 'cancelled': return 'Storniert';
                        case 'expired': return 'Abgelaufen';
                        default: return assignment.order.status.replace('_', ' ');
                      }
                    })()}
                    </Badge>
                    {assignment.order.status === "IN_REVIEW" && (
                      <div className="h-2 w-2 bg-orange-500 rounded-full" />
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(assignment.order.scheduledDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline">P{assignment.order.priority}</Badge>
                </td>
                <td className="p-4">
                  <span className="text-sm">
                    {format(new Date(assignment.assignedDate), "MMM dd, yyyy")}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewNotes(assignment.order)}
                      className="relative"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {assignment.order.status === "IN_REVIEW" && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-orange-500 rounded-full" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeOrderTableView;
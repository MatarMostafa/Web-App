"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui";
import { Search, Package } from "lucide-react";
import EmployeeOrderTableView from "@/components/employee/EmployeeOrderTableView";
import { OrderNotesDialog } from "@/components/order-notes";
import { useEmployeeOrderStore } from "@/store/employee/employeeOrderStore";
import { useSession } from "next-auth/react";


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

const EmployeeOrdersPage = () => {

  const {
    employeeAssignments,
    isLoadingAssignments,
    fetchEmployeeAssignments,
  } = useEmployeeOrderStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [notesOrder, setNotesOrder] = useState<any>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchEmployeeAssignments(session.user.id);
    }
  }, [fetchEmployeeAssignments, session?.user?.id]);

  const handleViewNotes = (order: any) => {
    setNotesOrder(order);
    setNotesDialogOpen(true);
  };

  const filteredAssignments = employeeAssignments.filter(
    (assignment: Assignment) =>
      (assignment.order.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      assignment.order.orderNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Meine Aufträge</h1>
          <p className="text-muted-foreground">Ihre zugewiesenen Aufträge anzeigen</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Aufträge nach Beschreibung oder Nummer suchen..."
            className="pl-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <EmployeeOrderTableView
        assignments={filteredAssignments}
        loading={isLoadingAssignments}
        onViewNotes={handleViewNotes}
      />

      {!isLoadingAssignments && employeeAssignments.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-12 border rounded-lg">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">Keine Aufträge zugewiesen</h3>
          <p className="text-muted-foreground">
            Sie haben noch keine Aufträge zugewiesen bekommen
          </p>
        </div>
      )}

      {notesOrder && (
        <OrderNotesDialog
          orderId={notesOrder.id}
          orderNumber={notesOrder.orderNumber}
          orderStatus={notesOrder.status}
          orderDetails={{
            scheduledDate: notesOrder.scheduledDate,
            location: notesOrder.location,
            assignedEmployee: session?.user?.name || "You"
          }}
          open={notesDialogOpen}
          onOpenChange={(open) => {
            setNotesDialogOpen(open);
            if (!open) setNotesOrder(null);
          }}
          userRole="EMPLOYEE"
        />
      )}
    </div>
  );
};

export default EmployeeOrdersPage;

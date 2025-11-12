"use client";
import React, { useState, useEffect } from "react";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Search, Package } from "lucide-react";
import EmployeeOrderTableView from "@/components/employee/EmployeeOrderTableView";
import { OrderNotesDialog } from "@/components/order-notes";
import { useEmployeeOrderStore } from "@/store/employee/employeeOrderStore";
import { useSession } from "next-auth/react";

import toast from "react-hot-toast";


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
    updatedAt: string;
  };
}

const EmployeeOrdersPage = () => {

  const {
    employeeAssignments,
    isLoadingAssignments,
    fetchEmployeeAssignments,
  } = useEmployeeOrderStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [notesOrder, setNotesOrder] = useState<any>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchEmployeeAssignments(session.user.id);
    }
  }, [fetchEmployeeAssignments, session?.user?.id]);

  useEffect(() => {
    // Check for stored notification data
    const storedData = sessionStorage.getItem('openOrderNotes');
    if (storedData && employeeAssignments.length > 0) {
      try {
        const { orderId } = JSON.parse(storedData);
        const order = employeeAssignments.find(a => a.order.id === orderId)?.order;
        if (order) {
          handleViewNotes(order);
          sessionStorage.removeItem('openOrderNotes');
        }
      } catch (error) {
        console.error('Error parsing stored notification data:', error);
        sessionStorage.removeItem('openOrderNotes');
      }
    }

    // Event listener for same-page notifications
    const handleOpenOrderNotes = (event: CustomEvent) => {
      const { orderId } = event.detail;
      const order = employeeAssignments.find(a => a.order.id === orderId)?.order;
      if (order) {
        handleViewNotes(order);
      }
    };

    window.addEventListener('openOrderNotes', handleOpenOrderNotes as EventListener);
    return () => window.removeEventListener('openOrderNotes', handleOpenOrderNotes as EventListener);
  }, [employeeAssignments]);

  const handleViewNotes = (order: any) => {
    setNotesOrder(order);
    setNotesDialogOpen(true);
  };

  const filteredAssignments = employeeAssignments
    .filter(
      (assignment: Assignment) =>
        (assignment.order.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        assignment.order.orderNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.order.orderNumber.localeCompare(b.order.orderNumber);
      } else {
        const dateA = new Date(a.order.updatedAt);
        const dateB = new Date(b.order.updatedAt);
        return dateB.getTime() - dateA.getTime();
      }
    });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Meine Aufträge</h1>
          <p className="text-muted-foreground">Ihre zugewiesenen Aufträge anzeigen</p>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Aufträge nach Beschreibung oder Nummer suchen..."
              className="pl-10 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Nach Datum sortieren</SelectItem>
              <SelectItem value="name">Nach Name sortieren</SelectItem>
            </SelectContent>
          </Select>
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

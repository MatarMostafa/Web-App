"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Textarea } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Checkbox } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { useOrderStore } from "@/store/orderStore";
import { useEmployeeStore } from "@/store/employeeStore";
import { Order, UpdateOrderData, OrderStatus } from "@/types/order";
import toast from "react-hot-toast";

interface EditOrderDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditOrderDialog: React.FC<EditOrderDialogProps> = ({
  order,
  open,
  onOpenChange,
}) => {
  const { updateOrder, getOrderAssignments } = useOrderStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateOrderData>({});

  useEffect(() => {
    if (order && open) {
      fetchEmployees();
      getOrderAssignments(order.id).then(assignedEmployeeIds => {
        setFormData({
          orderNumber: order.orderNumber,
          title: order.title,
          description: order.description || "",
          scheduledDate: order.scheduledDate.split('T')[0],
          startTime: order.startTime ? order.startTime.split('T')[1]?.substring(0, 5) : "",
          endTime: order.endTime ? order.endTime.split('T')[1]?.substring(0, 5) : "",
          duration: order.duration,
          location: order.location || "",
          requiredEmployees: order.requiredEmployees,
          priority: order.priority,
          specialInstructions: order.specialInstructions || "",
          status: order.status,
          assignedEmployeeIds,
        });
      });
    }
  }, [order, open, fetchEmployees, getOrderAssignments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = { ...formData };
      
      // Convert time inputs to ISO datetime format
      if (submitData.startTime && submitData.scheduledDate) {
        submitData.startTime = `${submitData.scheduledDate}T${submitData.startTime}:00Z`;
      }
      if (submitData.endTime && submitData.scheduledDate) {
        submitData.endTime = `${submitData.scheduledDate}T${submitData.endTime}:00Z`;
      }
      
      await updateOrder(order.id, submitData);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateOrderData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assignedEmployeeIds: checked
        ? [...(prev.assignedEmployeeIds || []), employeeId]
        : (prev.assignedEmployeeIds || []).filter(id => id !== employeeId)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orderNumber">Order Number *</Label>
              <Input
                id="orderNumber"
                value={formData.orderNumber || ""}
                onChange={(e) => handleInputChange("orderNumber", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OrderStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledDate">Scheduled Date *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate || ""}
                onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime || ""}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime || ""}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                step="0.5"
                value={formData.duration || ""}
                onChange={(e) => handleInputChange("duration", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requiredEmployees">Required Employees *</Label>
              <Input
                id="requiredEmployees"
                type="number"
                min="1"
                value={formData.requiredEmployees || 1}
                onChange={(e) => handleInputChange("requiredEmployees", Number(e.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                value={formData.priority || 1}
                onChange={(e) => handleInputChange("priority", Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions || ""}
              onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label>Assign Employees</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`employee-${employee.id}`}
                    checked={(formData.assignedEmployeeIds || []).includes(employee.id)}
                    onCheckedChange={(checked) => handleEmployeeToggle(employee.id, checked as boolean)}
                  />
                  <Label htmlFor={`employee-${employee.id}`} className="text-sm">
                    {employee.firstName} {employee.lastName} ({employee.employeeCode})
                  </Label>
                </div>
              ))}
              {employees.length === 0 && (
                <p className="text-sm text-gray-500">No employees available</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;
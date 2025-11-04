"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Textarea } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Checkbox } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { useOrderStore } from "@/store/orderStore";
import { useEmployeeStore } from "@/store/employeeStore";
import { useCustomerStore } from "@/store/customerStore";
import { CreateOrderData, OrderStatus } from "@/types/order";
import toast from "react-hot-toast";

interface AddOrderDialogProps {
  trigger: React.ReactNode;
}

const AddOrderDialog: React.FC<AddOrderDialogProps> = ({ trigger }) => {
  const { createOrder } = useOrderStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateOrderData>({
    description: "",
    scheduledDate: "",
    startTime: "",
    endTime: "",
    duration: null,
    location: "",
    requiredEmployees: 1,
    priority: 1,
    specialInstructions: "",
    status: OrderStatus.DRAFT,
    customerId: "",
    assignedEmployeeIds: [],
  });

  useEffect(() => {
    if (open) {
      fetchEmployees();
      fetchCustomers();
    }
  }, [open, fetchEmployees, fetchCustomers]);

  // Auto-fill location when customer is selected
  useEffect(() => {
    if (formData.customerId) {
      const selectedCustomer = customers.find(
        (c) => c.id === formData.customerId
      );
      if (selectedCustomer?.address) {
        const addressStr =
          typeof selectedCustomer.address === "string"
            ? selectedCustomer.address
            : Object.values(selectedCustomer.address)
                .filter(Boolean)
                .join(", ");
        setFormData((prev) => ({ ...prev, location: addressStr }));
      }
    }
  }, [formData.customerId, customers]);

  const resetFormData = () => {
    setFormData({
      description: "",
      scheduledDate: "",
      startTime: "",
      endTime: "",
      duration: null,
      location: "",
      requiredEmployees: 1,
      priority: 1,
      specialInstructions: "",
      status: OrderStatus.DRAFT,
      customerId: "",
      assignedEmployeeIds: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = "Customer is required";
    if (!formData.scheduledDate) newErrors.scheduledDate = "Scheduled date is required";
    if (!formData.requiredEmployees || formData.requiredEmployees < 1) newErrors.requiredEmployees = "Required employees must be at least 1";
    if (!formData.priority || formData.priority < 1) newErrors.priority = "Priority must be at least 1";
    
    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the validation errors");
      return;
    }

    console.log("Starting order creation...");
    setLoading(true);

    try {
      const submitData = { ...formData };

      // Convert date and datetime-local to ISO format
      if (submitData.scheduledDate) {
        // For date input, append time and convert to ISO
        const dateStr = submitData.scheduledDate.includes("T")
          ? submitData.scheduledDate
          : submitData.scheduledDate + "T00:00:00.000Z";
        submitData.scheduledDate = new Date(dateStr).toISOString();
      }
      if (submitData.startTime) {
        submitData.startTime = new Date(submitData.startTime).toISOString();
      }
      if (submitData.endTime) {
        submitData.endTime = new Date(submitData.endTime).toISOString();
      }

      console.log("Calling createOrder with:", submitData);
      const newOrder = await createOrder(submitData);
      console.log("Order created successfully:", newOrder);
      setOpen(false);
      resetFormData();
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateOrderData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    setFormData((prev) => {
      const currentAssigned = prev.assignedEmployeeIds || [];
      const requiredCount = prev.requiredEmployees || 1;
      
      if (checked) {
        // Check if we can add more employees
        if (currentAssigned.length >= requiredCount) {
          toast.error(`Maximum ${requiredCount} employee(s) can be assigned`);
          return prev;
        }
        return {
          ...prev,
          assignedEmployeeIds: [...currentAssigned, employeeId]
        };
      } else {
        return {
          ...prev,
          assignedEmployeeIds: currentAssigned.filter((id) => id !== employeeId)
        };
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerId">Customer *</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => {
                handleInputChange("customerId", value);
                if (errors.customerId) setErrors(prev => ({ ...prev, customerId: "" }));
              }}
            >
              <SelectTrigger className={errors.customerId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
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
                value={formData.scheduledDate}
                onChange={(e) => {
                  handleInputChange("scheduledDate", e.target.value);
                  if (errors.scheduledDate) setErrors(prev => ({ ...prev, scheduledDate: "" }));
                }}
                className={errors.scheduledDate ? "border-red-500" : ""}
              />
              {errors.scheduledDate && <p className="text-sm text-red-500 mt-1">{errors.scheduledDate}</p>}
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Auto-filled from customer address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Date & Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Date & Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* <div>
              <Label htmlFor="requiredEmployees">Required Employees *</Label>
              <Input
                id="requiredEmployees"
                type="number"
                min="1"
                value={formData.requiredEmployees}
                onChange={(e) => {
                  handleInputChange("requiredEmployees", Number(e.target.value));
                  if (errors.requiredEmployees) setErrors(prev => ({ ...prev, requiredEmployees: "" }));
                }}
                className={errors.requiredEmployees ? "border-red-500" : ""}
              />
              {errors.requiredEmployees && <p className="text-sm text-red-500 mt-1">{errors.requiredEmployees}</p>}
            </div> */}
            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="1"
                value={formData.priority}
                onChange={(e) => {
                  handleInputChange("priority", Number(e.target.value));
                  if (errors.priority) setErrors(prev => ({ ...prev, priority: "" }));
                }}
                className={errors.priority ? "border-red-500" : ""}
              />
              {errors.priority && <p className="text-sm text-red-500 mt-1">{errors.priority}</p>}
            </div>
            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                step="0.5"
                value={formData.duration || ""}
                onChange={(e) =>
                  handleInputChange(
                    "duration",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) =>
                handleInputChange("specialInstructions", e.target.value)
              }
              rows={3}
            />
          </div>

          <div>
            <Label>Assign Employees (Optional)</Label>
            <div className="text-sm text-muted-foreground mb-2">
              {(formData.assignedEmployeeIds || []).length} of {formData.requiredEmployees || 1} employees selected
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`employee-${employee.id}`}
                    checked={(formData.assignedEmployeeIds || []).includes(
                      employee.id
                    )}
                    disabled={
                      !(formData.assignedEmployeeIds || []).includes(employee.id) &&
                      (formData.assignedEmployeeIds || []).length >= (formData.requiredEmployees || 1)
                    }
                    onCheckedChange={(checked) =>
                      handleEmployeeToggle(employee.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`employee-${employee.id}`}
                    className="text-sm"
                  >
                    {employee.firstName} {employee.lastName} (
                    {employee.employeeCode})
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
              onClick={() => {
                resetFormData();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrderDialog;

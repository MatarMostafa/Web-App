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
} from "@/components/ui";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface Order {
  id: string;
  orderNumber: string;
  description?: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  location?: string;
  priority: number;
  specialInstructions?: string;
  status: string;
  customerId: string;
  customer: {
    companyName: string;
  };
}

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  employeeCode: string;
}

interface Customer {
  id: string;
  companyName: string;
  address?: string;
}

interface EditOrderDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: () => void;
}

const EditOrderDialog: React.FC<EditOrderDialogProps> = ({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    description: "",
    scheduledDate: "",
    startTime: "",
    endTime: "",
    duration: 0,
    location: "",
    priority: 1,
    specialInstructions: "",
    customerId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (order && open) {
      fetchEmployees();
      fetchCustomers();
      fetchOrderAssignments();
      
      setFormData({
        description: order.description || "",
        scheduledDate: order.scheduledDate.split("T")[0],
        startTime: order.startTime ? order.startTime.substring(0, 16) : "",
        endTime: order.endTime ? order.endTime.substring(0, 16) : "",
        duration: order.duration || 0,
        location: order.location || "",
        priority: order.priority,
        specialInstructions: order.specialInstructions || "",
        customerId: order.customerId,
      });
    }
  }, [order, open]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-leader/employees`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchOrderAssignments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-leader/orders`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (response.ok) {
        const orders = await response.json();
        const currentOrder = orders.find((o: any) => o.id === order.id);
        if (currentOrder?.employeeAssignments) {
          setAssignedEmployeeIds(currentOrder.employeeAssignments.map((assignment: any) => assignment.employee.id));
        }
      }
    } catch (error) {
      console.error("Error fetching order assignments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = t("admin.orders.form.customerRequired");
    if (!formData.scheduledDate) newErrors.scheduledDate = t("admin.orders.form.scheduledDateRequired");
    if (!formData.priority || formData.priority < 1) newErrors.priority = t("admin.orders.form.priorityRequired");
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error(t("admin.orders.form.validationError"));
      return;
    }
    
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        scheduledDate: new Date(formData.scheduledDate + 'T00:00:00').toISOString(),
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : undefined,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
        assignedEmployeeIds,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-leader/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success("Order updated successfully");
        onOrderUpdated();
        onOpenChange(false);
      } else {
        toast.error("Failed to update order");
      }
    } catch (error) {
      toast.error("Error updating order");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    if (checked) {
      setAssignedEmployeeIds(prev => [...prev, employeeId]);
    } else {
      setAssignedEmployeeIds(prev => prev.filter(id => id !== employeeId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("admin.orders.form.editOrder")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t("admin.orders.form.orderNumber")}</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {order.orderNumber}
              </div>
            </div>
            <div>
              <Label>{t("admin.orders.form.status")}</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {order.status.replace("_", " ")}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="customerId">{t("admin.orders.form.customer")} *</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => {
                handleInputChange("customerId", value);
                if (errors.customerId) setErrors(prev => ({ ...prev, customerId: "" }));
              }}
            >
              <SelectTrigger className={errors.customerId ? "border-red-500" : ""}>
                <SelectValue placeholder={t("admin.orders.form.selectCustomer")} />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(customers) && customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>}
          </div>

          <div>
            <Label htmlFor="description">{t("admin.orders.form.description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledDate">{t("admin.orders.form.scheduledDate")} *</Label>
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
              <Label htmlFor="location">{t("admin.orders.form.location")}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">{t("admin.orders.form.startDateTime")}</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">{t("admin.orders.form.endDateTime")}</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">{t("admin.orders.form.priority")} *</Label>
              <Input
                id="priority"
                type="number"
                min="1"
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
              <Label htmlFor="duration">{t("admin.orders.form.duration")}</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                step="0.5"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specialInstructions">Activities</Label>
            <Select
              value={formData.specialInstructions}
              onValueChange={(value) => handleInputChange("specialInstructions", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Container entladen">Container Unloading</SelectItem>
                <SelectItem value="Kommissionieren">Picking</SelectItem>
                <SelectItem value="Paletten sortieren">Pallet Sorting</SelectItem>
                <SelectItem value="Qualitätskontrolle">Quality Control</SelectItem>
                <SelectItem value="Verpacken">Packaging</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("admin.orders.form.assignEmployeesEdit")}</Label>
            <div className="text-sm text-muted-foreground mb-2">
              {assignedEmployeeIds.length} employees selected
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`employee-${employee.id}`}
                    checked={assignedEmployeeIds.includes(employee.id)}
                    onCheckedChange={(checked) =>
                      handleEmployeeToggle(employee.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`employee-${employee.id}`}
                    className="text-sm"
                  >
                    {employee.firstName} {employee.lastName} ({employee.employeeCode})
                  </Label>
                </div>
              ))}
              {employees.length === 0 && (
                <p className="text-sm text-gray-500">{t("admin.orders.form.noEmployeesAvailable")}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("admin.orders.form.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("admin.orders.form.updating") : t("admin.orders.form.updateOrder")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;
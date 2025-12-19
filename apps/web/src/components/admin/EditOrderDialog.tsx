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
import { useOrderStore } from "@/store/orderStore";
import { useEmployeeStore } from "@/store/employeeStore";
import { useCustomerStore } from "@/store/customerStore";
import { Order, UpdateOrderData, OrderStatus } from "@/types/order";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import TimeOnlyInput from "@/components/ui/TimeOnlyInput";
import { useSession } from "next-auth/react";

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
  const { t, ready } = useTranslation();
  const { data: session } = useSession();
  
  if (!ready) {
    return null;
  }
  const { updateOrder, getOrderAssignments } = useOrderStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateOrderData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [startTimeOnly, setStartTimeOnly] = useState("");
  const [endTimeOnly, setEndTimeOnly] = useState("");
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const [dataLoading, setDataLoading] = useState(true);

  const fetchActivities = async (customerId: string) => {
    if (!customerId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pricing/customers/${customerId}/activities`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
    return [];
  };

  const fetchExistingActivityIds = async (orderId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/activity-ids`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
    } catch (error) {
      console.error("Error fetching existing activity IDs:", error);
    }
    return [];
  };

  useEffect(() => {
    if (order && open) {
      setDataLoading(true);
      Promise.all([
        fetchEmployees(),
        fetchCustomers(),
        getOrderAssignments(order.id)
      ]).then(([, , assignedEmployeeIds]) => {
        const startTime = order.startTime ? new Date(order.startTime) : null;
        const endTime = order.endTime ? new Date(order.endTime) : null;

        setFormData({
          orderNumber: order.orderNumber,
          description: order.description || "",
          scheduledDate: order.scheduledDate.split("T")[0],
          startTime: order.startTime ? order.startTime.substring(0, 16) : "",
          endTime: order.endTime ? order.endTime.substring(0, 16) : "",
          duration: order.duration,
          location: order.location || "",
          requiredEmployees: order.requiredEmployees,
          priority: order.priority,
          specialInstructions: order.specialInstructions || "",
          status: order.status,
          customerId: order.customerId,
          assignedEmployeeIds,
        });

        setStartTimeOnly(
          startTime
            ? `${startTime.getHours().toString().padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`
            : "09:00"
        );
        setEndTimeOnly(
          endTime
            ? `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`
            : ""
        );
      });
      setDataLoading(false); // ✅ Add this

    }
  }, [order, open, fetchEmployees, fetchCustomers, getOrderAssignments]);

  // Auto-fill location and fetch activities when customer is selected
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
      fetchActivities(formData.customerId);
    }
  }, [formData.customerId, customers]);

  // Combine date and time when either changes
  useEffect(() => {
    if (formData.scheduledDate && startTimeOnly) {
      setFormData((prev) => ({
        ...prev,
        startTime: `${formData.scheduledDate}T${startTimeOnly}`,
      }));
    }
  }, [formData.scheduledDate, startTimeOnly]);

  useEffect(() => {
    if (formData.scheduledDate && endTimeOnly) {
      setFormData((prev) => ({
        ...prev,
        endTime: `${formData.scheduledDate}T${endTimeOnly}`,
      }));
    } else if (!endTimeOnly) {
      setFormData((prev) => ({ ...prev, endTime: "" }));
    }
  }, [formData.scheduledDate, endTimeOnly]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.customerId)
      newErrors.customerId = t("admin.orders.form.customerRequired");
    if (!formData.scheduledDate)
      newErrors.scheduledDate = t("admin.orders.form.scheduledDateRequired");
    if (!formData.requiredEmployees || formData.requiredEmployees < 1)
      newErrors.requiredEmployees = t(
        "admin.orders.form.requiredEmployeesRequired"
      );
    if (!formData.priority || formData.priority < 1)
      newErrors.priority = t("admin.orders.form.priorityRequired");

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(t("admin.orders.form.validationError"));
      return;
    }

    setLoading(true);

    try {
      const submitData = { 
        ...formData,
        activities: selectedActivities.map(activityId => ({
          activityId,
          quantity: 1
        }))
      };

      // Convert date and datetime-local to ISO format
      if (submitData.scheduledDate) {
        const dateStr = submitData.scheduledDate.includes("T")
          ? submitData.scheduledDate
          : submitData.scheduledDate + "T00:00:00";
        submitData.scheduledDate = new Date(dateStr).toISOString();
      }
      if (submitData.startTime) {
        submitData.startTime = new Date(submitData.startTime).toISOString();
      }
      if (submitData.endTime && submitData.endTime.trim()) {
        submitData.endTime = new Date(submitData.endTime).toISOString();
      } else {
        submitData.endTime = undefined;
      }

      await updateOrder(order.id, submitData);
      onOpenChange(false);
    } catch (error) {
      toast.error(t("admin.orders.form.updateError"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateOrderData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    setFormData((prev) => {
      const currentAssigned = prev.assignedEmployeeIds || [];

      if (checked) {
        // Check if employee still exists
        const employeeExists = employees.some((emp) => emp.id === employeeId);
        if (!employeeExists) {
          toast.error("Mitarbeiter nicht mehr verfügbar");
          return prev;
        }
        return {
          ...prev,
          assignedEmployeeIds: [...currentAssigned, employeeId],
        };
      } else {
        return {
          ...prev,
          assignedEmployeeIds: currentAssigned.filter(
            (id) => id !== employeeId
          ),
        };
      }
    });
  };

  const handleActivityToggle = (activityId: string, checked: boolean) => {
    setSelectedActivities(prev => 
      checked
        ? [...prev, activityId]
        : prev.filter(id => id !== activityId)
    );
  };

  const getTotalPrice = () => {
    return selectedActivities.reduce((total, activityId) => {
      const activity = activities.find(a => a.activity.id === activityId);
      return total + (activity ? Number(activity.unitPrice || activity.activity.defaultPrice) : 0);
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("admin.orders.form.editOrder")}</DialogTitle>
        </DialogHeader>
        {dataLoading ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
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
                {(formData.status || order.status).replace("_", " ")}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="customerId">
              {t("admin.orders.form.customer")} *
            </Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => {
                handleInputChange("customerId", value);
                if (errors.customerId)
                  setErrors((prev) => ({ ...prev, customerId: "" }));
              }}
            >
              <SelectTrigger
                className={errors.customerId ? "border-red-500" : ""}
              >
                <SelectValue
                  placeholder={t("admin.orders.form.selectCustomer")}
                />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && (
              <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>
            )}
          </div>

          

          <div>
            <Label>Activities</Label>
            <div className="text-sm text-muted-foreground mb-2">
              {selectedActivities.length} activities selected - Total: €{getTotalPrice().toFixed(2)}
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
              {activities.map((customerActivity) => (
                <div key={customerActivity.id} className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`activity-${customerActivity.activity.id}`}
                      checked={selectedActivities.includes(customerActivity.activity.id)}
                      onCheckedChange={(checked) => handleActivityToggle(customerActivity.activity.id, checked as boolean)}
                    />
                    <Label htmlFor={`activity-${customerActivity.activity.id}`} className="text-sm">
                      {customerActivity.activity.name}
                    </Label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    €{Number(customerActivity.unitPrice || customerActivity.activity.defaultPrice).toFixed(2)}
                  </span>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-gray-500">{formData.customerId ? 'No activities available for this customer' : 'Select a customer first'}</p>
              )}
            </div>
          </div>

          <div>
            <Label>{t("admin.orders.form.description")}</Label>

            {order.descriptionData?.descriptionData ? (
              <div className="space-y-2 rounded-md border bg-muted p-3 text-sm">
                {Object.entries(order.descriptionData.descriptionData).map(
                  ([key, value]) => (
                    <div key={key} className="flex justify-between gap-4">
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  )
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  ℹ️  {t("admin.customerDetails.template.readOnlyWarning")}
                </p>
              </div>
            ) : (
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledDate">
                {t("admin.orders.form.scheduledDate")} *
              </Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate || ""}
                onChange={(e) => {
                  const newDate = e.target.value;
                  handleInputChange("scheduledDate", newDate);
                  // Auto-set startTime if not already set
                  if (newDate && !formData.startTime) {
                    handleInputChange("startTime", newDate + "T09:00");
                  }
                  if (errors.scheduledDate)
                    setErrors((prev) => ({ ...prev, scheduledDate: "" }));
                }}
                className={errors.scheduledDate ? "border-red-500" : ""}
              />
              {errors.scheduledDate && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.scheduledDate}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="location">
                {t("admin.orders.form.location")}
              </Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder={t("admin.orders.form.locationPlaceholder")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">
                {t("admin.orders.form.startDateTime")}
              </Label>
              <TimeOnlyInput
                value={startTimeOnly}
                onChange={setStartTimeOnly}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-set from scheduled date
              </p>
            </div>
            <div>
              <Label htmlFor="endTime">
                {t("admin.orders.form.endDateTime")} (Optional)
              </Label>
              <TimeOnlyInput value={endTimeOnly} onChange={setEndTimeOnly} />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty if not needed
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div>
              <Label htmlFor="requiredEmployees">{t("admin.orders.form.requiredEmployees")} *</Label>
              <Input
                id="requiredEmployees"
                type="number"
                min="1"
                value={formData.requiredEmployees || 1}
                onChange={(e) => {
                  handleInputChange("requiredEmployees", Number(e.target.value));
                  if (errors.requiredEmployees) setErrors(prev => ({ ...prev, requiredEmployees: "" }));
                }}
                className={errors.requiredEmployees ? "border-red-500" : ""}
              />
              {errors.requiredEmployees && <p className="text-sm text-red-500 mt-1">{errors.requiredEmployees}</p>}
            </div> */}
            <div>
              <Label htmlFor="priority">
                {t("admin.orders.form.priority")} *
              </Label>
              <Input
                id="priority"
                type="number"
                min="1"
                value={formData.priority || 1}
                onChange={(e) => {
                  handleInputChange("priority", Number(e.target.value));
                  if (errors.priority)
                    setErrors((prev) => ({ ...prev, priority: "" }));
                }}
                className={errors.priority ? "border-red-500" : ""}
              />
              {errors.priority && (
                <p className="text-sm text-red-500 mt-1">{errors.priority}</p>
              )}
            </div>
            <div>
              <Label htmlFor="duration">
                {t("admin.orders.form.duration")}
              </Label>
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
            <Label>{t("admin.orders.form.assignEmployeesEdit")}</Label>
            <div className="text-sm text-muted-foreground mb-2">
              {`${(formData.assignedEmployeeIds || []).length} employees selected`}
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`employee-${employee.id}`}
                    checked={(formData.assignedEmployeeIds || []).includes(
                      employee.id
                    )}
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
                <p className="text-sm text-gray-500">
                  {t("admin.orders.form.noEmployeesAvailable")}
                </p>
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
              {loading
                ? t("admin.orders.form.updating")
                : t("admin.orders.form.updateOrder")}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;

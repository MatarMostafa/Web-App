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
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import TimeOnlyInput from "@/components/ui/TimeOnlyInput";
import OrderDescriptionForm from "../admin/OrderDescriptionForm";

interface AddOrderDialogProps {
  trigger: React.ReactNode;
  onOrderCreated?: () => void;
}

const AddOrderDialog: React.FC<AddOrderDialogProps> = ({
  trigger,
  onOrderCreated,
}) => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [templateData, setTemplateData] = useState<Record<
    string,
    string
  > | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    scheduledDate: "",
    startTime: "",
    endTime: "",
    duration: null as number | null,
    location: "",
    priority: 1,
    specialInstructions: "",
    customerId: "",
    assignedEmployeeIds: [] as string[],
  });
  const [startTimeOnly, setStartTimeOnly] = useState("09:00");
  const [endTimeOnly, setEndTimeOnly] = useState("");

  useEffect(() => {
    if (open && session?.accessToken) {
      fetchCustomers();
      fetchEmployees();
    }
  }, [open, session?.accessToken]);

  useEffect(() => {
    if (formData.customerId) {
      fetchActivities(formData.customerId);
    } else {
      setActivities([]);
      setSelectedActivities([]);
    }
  }, [formData.customerId, session?.accessToken]);

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

  const fetchCustomers = async () => {
    if (!session?.accessToken) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      if (response.ok) {
        const result = await response.json();
        const data = result.success ? result.data : result;
        setCustomers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchEmployees = async () => {
    if (!session?.accessToken) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/team-leader/employees`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const teamMembers = (data.teams || []).flatMap(
          (team: any) =>
            team.members?.map((member: any) => ({
              id: member.employee.id,
              firstName: member.employee.firstName,
              lastName: member.employee.lastName,
              employeeCode: member.employee.employeeCode,
            })) || []
        );
        setEmployees(teamMembers);
      }
    } catch (error) {
      console.error("Error fetching team employees:", error);
    }
  };

  const fetchActivities = async (customerId?: string) => {
    if (!session?.accessToken || !customerId) {
      setActivities([]);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pricing/customers/${customerId}/activities`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const activities = Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.activity.id,
              name: item.activity.name,
              defaultPrice: item.activity.defaultPrice,
            }))
          : [];
        setActivities(activities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
    }
  };

  const resetForm = () => {
    setFormData({
      description: "",
      scheduledDate: "",
      startTime: "",
      endTime: "",
      duration: null,
      location: "",
      priority: 1,
      specialInstructions: "",
      customerId: "",
      assignedEmployeeIds: [],
    });
    setSelectedActivities([]);
    setTemplateData(null);
    setStartTimeOnly("09:00");
    setEndTimeOnly("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.scheduledDate) {
      toast.error("Customer and scheduled date are required");
      return;
    }

    setLoading(true);
    try {
      const submitData: any = {
        ...formData,
        activities: selectedActivities.map((activityId) => ({
          activityId,
          quantity: 1,
        })),
        templateData: templateData,
      };

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
        delete (submitData as any).endTime;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/team-leader/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(submitData),
        }
      );

      if (response.ok) {
        toast.success("Order created successfully");
        setOpen(false);
        resetForm();
        onOrderCreated?.();
      } else {
        toast.error("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Error creating order");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      assignedEmployeeIds: checked
        ? [...prev.assignedEmployeeIds, employeeId]
        : prev.assignedEmployeeIds.filter((id) => id !== employeeId),
    }));
  };

  const handleActivityToggle = (activityId: string, checked: boolean) => {
    setSelectedActivities((prev) =>
      checked ? [...prev, activityId] : prev.filter((id) => id !== activityId)
    );
  };

  const getTotalPrice = () => {
    return selectedActivities.reduce((total, activityId) => {
      const activity = activities.find((a) => a.id === activityId);
      return total + (activity ? Number(activity.defaultPrice) : 0);
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerId">Customer *</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, customerId: value }))
              }
            >
              <SelectTrigger>
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
          </div>

          <OrderDescriptionForm
            customerId={formData.customerId}
            description={formData.description}
            onDescriptionChange={(description) =>
              setFormData((prev) => ({ ...prev, description }))
            }
            onTemplateDataChange={setTemplateData}
          />

          <div>
            <Label>Activities</Label>
            <div className="text-sm text-muted-foreground mb-2">
              {selectedActivities.length} activities selected - Total: €
              {getTotalPrice().toFixed(2)}
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between space-x-2"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`activity-${activity.id}`}
                      checked={selectedActivities.includes(activity.id)}
                      onCheckedChange={(checked) =>
                        handleActivityToggle(activity.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`activity-${activity.id}`}
                      className="text-sm"
                    >
                      {activity.name}
                    </Label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    €{Number(activity.defaultPrice).toFixed(2)}
                  </span>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-gray-500">No activities available</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledDate">Scheduled Date *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduledDate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Order location"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <TimeOnlyInput
                value={startTimeOnly}
                onChange={setStartTimeOnly}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <TimeOnlyInput value={endTimeOnly} onChange={setEndTimeOnly} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: Number(e.target.value),
                  }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: e.target.value ? Number(e.target.value) : null,
                  }))
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
                setFormData((prev) => ({
                  ...prev,
                  specialInstructions: e.target.value,
                }))
              }
              rows={2}
            />
          </div>

          <div>
            <Label>Assign Employees</Label>
            <div className="text-sm text-muted-foreground mb-2">
              {formData.assignedEmployeeIds.length} employees selected
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`employee-${employee.id}`}
                    checked={formData.assignedEmployeeIds.includes(employee.id)}
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
              onClick={() => setOpen(false)}
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

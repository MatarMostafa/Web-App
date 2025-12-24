"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateOrderData, OrderStatus } from "@/types/order";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import TimeOnlyInput from "@/components/ui/TimeOnlyInput";
import { useSession } from "next-auth/react";

interface CreateOrderDialogProps {
  trigger: React.ReactNode;
  onOrderCreated?: () => void;
}

interface CustomerActivity {
  id: string;
  activity: {
    id: string;
    name: string;
    code?: string;
    description?: string;
    unit: string;
  };
  unitPrice: number;
}

interface SubAccount {
  id: string;
  name: string;
  code?: string;
}

const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({ trigger, onOrderCreated }) => {
  const { t, ready } = useTranslation();
  const { data: session } = useSession();
  
  if (!ready) return null;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [templateData, setTemplateData] = useState<Record<string, string> | null>(null);
  const [templateLines, setTemplateLines] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateOrderData>({
    description: "",
    scheduledDate: "",
    startTime: "",
    endTime: "",
    location: "",
    specialInstructions: "",
    status: OrderStatus.DRAFT,
    customerId: "",
  });
  const [startTimeOnly, setStartTimeOnly] = useState("09:00");
  const [endTimeOnly, setEndTimeOnly] = useState("");
  const [selectedSubAccount, setSelectedSubAccount] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetchCustomerData();
    }
  }, [open]);

  const fetchCustomerData = async () => {
    try {
      // Get customer profile and activities
      const [profileResponse, activitiesResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/me`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pricing/customers/me/activities`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        })
      ]);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const customer = profileData.data;
        
        // Set customer ID and location
        setFormData(prev => ({
          ...prev,
          customerId: customer.id,
          location: typeof customer.address === 'string' 
            ? customer.address 
            : Object.values(customer.address || {}).filter(Boolean).join(", ")
        }));

        // Set sub-accounts if available
        if (customer.subAccounts?.length > 0) {
          setSubAccounts(customer.subAccounts);
        }

        // Set template lines if available
        if (customer.descriptionTemplate?.templateLines) {
          setTemplateLines(customer.descriptionTemplate.templateLines);
          const initialTemplateData: Record<string, string> = {};
          customer.descriptionTemplate.templateLines.forEach((line: string) => {
            initialTemplateData[line] = "";
          });
          setTemplateData(initialTemplateData);
        }
      }

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.data || []);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
      toast.error("Failed to load customer data");
    }
  };

  // Combine date and time when either changes
  useEffect(() => {
    if (formData.scheduledDate && startTimeOnly) {
      setFormData(prev => ({ ...prev, startTime: `${formData.scheduledDate}T${startTimeOnly}` }));
    }
  }, [formData.scheduledDate, startTimeOnly]);

  useEffect(() => {
    if (formData.scheduledDate && endTimeOnly) {
      setFormData(prev => ({ ...prev, endTime: `${formData.scheduledDate}T${endTimeOnly}` }));
    } else if (!endTimeOnly) {
      setFormData(prev => ({ ...prev, endTime: "" }));
    }
  }, [formData.scheduledDate, endTimeOnly]);

  const resetFormData = () => {
    setFormData({
      description: "",
      scheduledDate: "",
      startTime: "",
      endTime: "",
      location: "",
      specialInstructions: "",
      status: OrderStatus.DRAFT,
      customerId: "",
    });
    setStartTimeOnly("09:00");
    setEndTimeOnly("");
    setSelectedActivities([]);
    setSelectedSubAccount("");
    setTemplateData(templateLines.length > 0 ? 
      templateLines.reduce((acc, line) => ({ ...acc, [line]: "" }), {}) : null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.scheduledDate) newErrors.scheduledDate = "Scheduled date is required";
    if (selectedActivities.length === 0) newErrors.activities = "Please select at least one activity";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const submitData = { 
        ...formData,
        activities: selectedActivities.map(activityId => ({
          activityId,
          quantity: 1
        })),
        templateData: templateData,
        createdBySubAccountId: selectedSubAccount || undefined
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/me/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      toast.success("Order created successfully!");
      setOpen(false);
      resetFormData();
      onOrderCreated?.();
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateOrderData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleActivityToggle = (activityId: string, checked: boolean) => {
    setSelectedActivities(prev => 
      checked
        ? [...prev, activityId]
        : prev.filter(id => id !== activityId)
    );
  };

  const handleTemplateDataChange = (field: string, value: string) => {
    setTemplateData(prev => prev ? { ...prev, [field]: value } : { [field]: value });
  };

  const getTotalPrice = () => {
    return selectedActivities.reduce((total, activityId) => {
      const activity = activities.find(a => a.activity.id === activityId);
      return total + (activity ? activity.unitPrice : 0);
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
          

          {/* Scheduled Date */}
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

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <TimeOnlyInput
                value={startTimeOnly}
                onChange={setStartTimeOnly}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time (Optional)</Label>
              <TimeOnlyInput
                value={endTimeOnly}
                onChange={setEndTimeOnly}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Service location"
            />
          </div>

          {/* Activities Selection */}
          <div>
            <Label>Activities *</Label>
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
                    €{customerActivity.unitPrice.toFixed(2)}
                  </span>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-gray-500">No activities available</p>
              )}
            </div>
            {errors.activities && <p className="text-sm text-red-500 mt-1">{errors.activities}</p>}
          </div>

          {/* Template Data (if available) */}
          {templateLines.length > 0 && (
            <div>
              <Label>Order Details</Label>
              <div className="space-y-2">
                {templateLines.map((line) => (
                  <div key={line}>
                    <Label htmlFor={`template-${line}`} className="text-sm">{line}</Label>
                    <Input
                      id={`template-${line}`}
                      value={templateData?.[line] || ""}
                      onChange={(e) => handleTemplateDataChange(line, e.target.value)}
                      placeholder={`Enter ${line.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description/Special Instructions */}
          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
              placeholder="Any special instructions or notes"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
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

export default CreateOrderDialog;
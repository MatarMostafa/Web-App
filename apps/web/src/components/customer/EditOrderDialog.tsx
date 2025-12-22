"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import TimeOnlyInput from "@/components/ui/TimeOnlyInput";
import { useSession } from "next-auth/react";

interface EditOrderDialogProps {
  trigger: React.ReactNode;
  order: any;
  onOrderUpdated?: () => void;
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

const EditOrderDialog: React.FC<EditOrderDialogProps> = ({
  trigger,
  order,
  onOrderUpdated,
}) => {
  const { t, ready } = useTranslation();
  const { data: session } = useSession();

  if (!ready) return null;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [templateData, setTemplateData] = useState<Record<string, string> | null>(null);
  const [templateLines, setTemplateLines] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    scheduledDate: "",
    startTime: "",
    endTime: "",
    location: "",
    specialInstructions: "",
  });
  const [startTimeOnly, setStartTimeOnly] = useState("09:00");
  const [endTimeOnly, setEndTimeOnly] = useState("");

  // Check if order can be edited (only DRAFT orders)
  const canEdit = order?.status === 'planned'; // 'planned' is the customer-facing status for DRAFT

  useEffect(() => {
    if (open && order) {
      loadOrderData();
      fetchActivities();
      loadExistingOrderData();
    }
  }, [open, order]);

  const loadExistingOrderData = async () => {
    try {
      // Fetch full order details including activities and template data
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/me/orders/${order.id}`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );

      if (response.ok) {
        const orderDetails = await response.json();
        const orderData = orderDetails.data;
        
        // Load existing activities
        if (orderData.customerActivities) {
          const existingActivityIds = orderData.customerActivities.map(
            (ca: any) => ca.activity.id
          );
          setSelectedActivities(existingActivityIds);
        }
        
        // Load existing template data
        if (orderData.descriptionData?.descriptionData) {
          setTemplateData(orderData.descriptionData.descriptionData);
        }
        
        // Load template lines from customer profile
        const profileResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/customers/me`,
          {
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          }
        );
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.data?.descriptionTemplate?.templateLines) {
            setTemplateLines(profileData.data.descriptionTemplate.templateLines);
          }
        }
      }
    } catch (error) {
      console.error("Error loading existing order data:", error);
    }
  };

  const loadOrderData = () => {
    // Convert order data to form format
    const scheduledDate = order.scheduledDate ? new Date(order.scheduledDate).toISOString().split('T')[0] : "";
    
    setFormData({
      scheduledDate,
      startTime: order.startTime || "",
      endTime: order.endTime || "",
      location: order.location || "",
      specialInstructions: order.specialInstructions || "",
    });

    // Extract time components
    if (order.startTime) {
      const startTime = new Date(order.startTime);
      setStartTimeOnly(`${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`);
    }
    
    if (order.endTime) {
      const endTime = new Date(order.endTime);
      setEndTimeOnly(`${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/me/activities`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );

      if (response.ok) {
        const activitiesData = await response.json();
        setActivities(activitiesData.data || []);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

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

    if (!canEdit) {
      toast.error(t("customerPortal.editOrder.cannotEditOrder"));
      return;
    }

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.scheduledDate)
      newErrors.scheduledDate = t("customerPortal.createOrder.scheduledDateRequired");

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(t("customerPortal.createOrder.fillRequiredFields"));
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        scheduledDate: formData.scheduledDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        specialInstructions: formData.specialInstructions,
        ...(selectedActivities.length > 0 && {
          activities: selectedActivities.map((activityId) => ({
            activityId,
            quantity: 1,
          })),
        }),
        templateData: templateData,
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/me/orders/${order.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(submitData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order");
      }

      toast.success(t("customerPortal.editOrder.orderUpdatedSuccess"));
      setOpen(false);
      onOrderUpdated?.();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("customerPortal.editOrder.orderUpdateFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleActivityToggle = (activityId: string, checked: boolean) => {
    setSelectedActivities((prev) =>
      checked ? [...prev, activityId] : prev.filter((id) => id !== activityId)
    );
  };

  const handleTemplateDataChange = (field: string, value: string) => {
    setTemplateData((prev) =>
      prev ? { ...prev, [field]: value } : { [field]: value }
    );
  };

  const getTotalPrice = () => {
    return selectedActivities.reduce((total, activityId) => {
      const activity = activities.find((a) => a.activity.id === activityId);
      return total + (activity ? Number(activity.unitPrice) : 0);
    }, 0);
  };

  if (!canEdit) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>{t("customerPortal.editOrder.title")}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              {t("customerPortal.editOrder.cannotEditMessage")}
            </p>
            <Button onClick={() => setOpen(false)} className="mt-4">
              {t("common.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("customerPortal.editOrder.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Scheduled Date */}
          <div>
            <Label htmlFor="scheduledDate">
              {t("customerPortal.createOrder.scheduledDate")} *
            </Label>
            <Input
              id="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => {
                handleInputChange("scheduledDate", e.target.value);
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

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">
                {t("customerPortal.createOrder.startTime")}
              </Label>
              <TimeOnlyInput
                value={startTimeOnly}
                onChange={setStartTimeOnly}
              />
            </div>
            <div>
              <Label htmlFor="endTime">
                {t("customerPortal.createOrder.endTime")}
              </Label>
              <TimeOnlyInput value={endTimeOnly} onChange={setEndTimeOnly} />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">
              {t("customerPortal.createOrder.location")}
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder={t("customerPortal.createOrder.locationPlaceholder")}
            />
          </div>

          {/* Activities Selection */}
          <div>
            <Label>{t("customerPortal.createOrder.selectActivities")}</Label>
            <div className="text-sm text-muted-foreground mb-2">
              {selectedActivities.length}{" "}
              {t("customerPortal.createOrder.activitiesSelected")} -{" "}
              {t("customerPortal.createOrder.totalPrice")}: €
              {getTotalPrice().toFixed(2)}
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
              {activities.map((customerActivity) => (
                <div
                  key={customerActivity.id}
                  className="flex items-center justify-between space-x-2"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`activity-${customerActivity.activity.id}`}
                      checked={selectedActivities.includes(
                        customerActivity.activity.id
                      )}
                      onCheckedChange={(checked) =>
                        handleActivityToggle(
                          customerActivity.activity.id,
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`activity-${customerActivity.activity.id}`}
                      className="text-sm"
                    >
                      {customerActivity.activity.name}
                    </Label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    €{Number(customerActivity.unitPrice).toFixed(2)}
                  </span>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-gray-500">
                  {t("customerPortal.createOrder.noActivitiesAvailable")}
                </p>
              )}
            </div>
          </div>

          {/* Template Data (if available) */}
          {templateLines.length > 0 && (
            <div>
              <Label>
                {t("customerPortal.createOrder.serviceRequirements")}
              </Label>
              <div className="space-y-2">
                {templateLines.map((line) => (
                  <div key={line}>
                    <Label htmlFor={`template-${line}`} className="text-sm">
                      {line}
                    </Label>
                    <Input
                      id={`template-${line}`}
                      value={templateData?.[line] || ""}
                      onChange={(e) =>
                        handleTemplateDataChange(line, e.target.value)
                      }
                      placeholder={`Enter ${line.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <Label htmlFor="specialInstructions">
              {t("customerPortal.createOrder.specialInstructions")}
            </Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) =>
                handleInputChange("specialInstructions", e.target.value)
              }
              placeholder={t(
                "customerPortal.createOrder.specialInstructionsPlaceholder"
              )}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("customerPortal.createOrder.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t("customerPortal.editOrder.updating")
                : t("customerPortal.editOrder.updateOrder")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;
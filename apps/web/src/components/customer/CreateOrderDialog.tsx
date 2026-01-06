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

const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({
  trigger,
  onOrderCreated,
}) => {
  const { t, ready } = useTranslation();
  const { data: session } = useSession();

  if (!ready) return null;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<Array<{
    activityId: string;
    quantity: number;
  }>>([]);
  const [templateData, setTemplateData] = useState<Record<
    string,
    string
  > | null>(null);
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

  useEffect(() => {
    if (open) {
      fetchCustomerData();
    }
  }, [open]);

  const fetchCustomerData = async () => {
    try {
      console.log('Fetching customer data...');
      // Get customer profile and activities
      const [profileResponse, activitiesResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/me`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/customers/me/activities`,
          {
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          }
        ),
      ]);

      console.log('Profile response status:', profileResponse.status);
      console.log('Activities response status:', activitiesResponse.status);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('Profile data:', profileData);
        const customer = profileData.data;

        // Set customer ID and location
        setFormData((prev) => ({
          ...prev,
          customerId: customer.id,
          location:
            typeof customer.address === "string"
              ? customer.address
              : Object.values(customer.address || {})
                  .filter(Boolean)
                  .join(", "),
        }));

        // Set template lines if available
        if (customer.descriptionTemplate?.templateLines) {
          setTemplateLines(customer.descriptionTemplate.templateLines);
          const initialTemplateData: Record<string, string> = {};
          customer.descriptionTemplate.templateLines.forEach((line: string) => {
            initialTemplateData[line] = "";
          });
          setTemplateData(initialTemplateData);
        }
      } else {
        console.error('Profile fetch failed:', profileResponse.status, profileResponse.statusText);
        const errorText = await profileResponse.text();
        console.error('Profile error response:', errorText);
      }

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        console.log('Activities response:', activitiesData);
        setActivities(activitiesData.data || []);
      } else {
        console.error('Activities fetch failed:', activitiesResponse.status, activitiesResponse.statusText);
        const errorText = await activitiesResponse.text();
        console.error('Activities error response:', errorText);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
      toast.error(t("messages.error"));
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
    setTemplateData(null);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.scheduledDate) {
      toast.error("Scheduled date is required");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        description: formData.description || "",
        scheduledDate: new Date(formData.scheduledDate + "T00:00:00").toISOString(),
        startTime: formData.scheduledDate && startTimeOnly ? 
          new Date(`${formData.scheduledDate}T${startTimeOnly}`).toISOString() : null,
        endTime: formData.scheduledDate && endTimeOnly ? 
          new Date(`${formData.scheduledDate}T${endTimeOnly}`).toISOString() : null,
        location: formData.location || "",
        specialInstructions: formData.specialInstructions || "",
        customerId: formData.customerId,
        activities: selectedActivities,
        templateData: templateData
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/me/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(submitData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Order creation failed:", response.status, errorText);
        throw new Error(`Failed to create order: ${response.status}`);
      }

      const result = await response.json();
      console.log("Order created successfully:", result);
      
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
    setSelectedActivities((prev) =>
      checked 
        ? [...prev, { activityId, quantity: 1 }]
        : prev.filter((sa) => sa.activityId !== activityId)
    );
  };

  const handleQuantityChange = (activityId: string, quantity: number) => {
    setSelectedActivities((prev) =>
      prev.map((sa) =>
        sa.activityId === activityId ? { ...sa, quantity } : sa
      )
    );
  };

  const handleTemplateDataChange = (field: string, value: string) => {
    setTemplateData((prev) =>
      prev ? { ...prev, [field]: value } : { [field]: value }
    );
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("customerPortal.createOrder.title")}</DialogTitle>
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
                setErrors(prev => ({ ...prev, scheduledDate: "" }));
              }}
              className={errors.scheduledDate ? "border-red-500" : ""}
              required
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
              {t("customerPortal.createOrder.activitiesSelected")}
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-3">
              {activities.map((customerActivity) => (
                <div
                  key={customerActivity.id}
                  className="border rounded-md p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`activity-${customerActivity.activity.id}`}
                        checked={selectedActivities.some(
                          (sa) => sa.activityId === customerActivity.activity.id
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
                        className="text-sm font-medium"
                      >
                        {customerActivity.activity.name}
                      </Label>
                    </div>
                  </div>
                  {selectedActivities.some(
                    (sa) => sa.activityId === customerActivity.activity.id
                  ) && (
                    <div className="ml-6">
                      <Label className="text-xs">Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={
                          selectedActivities.find(
                            (sa) => sa.activityId === customerActivity.activity.id
                          )?.quantity || 1
                        }
                        onChange={(e) =>
                          handleQuantityChange(
                            customerActivity.activity.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-20"
                        required
                      />
                    </div>
                  )}
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

          {/* Description/Special Instructions */}
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
              onClick={() => {
                resetFormData();
                setOpen(false);
              }}
            >
              {t("customerPortal.createOrder.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t("customerPortal.createOrder.creating")
                : t("customerPortal.createOrder.createOrder")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderDialog;

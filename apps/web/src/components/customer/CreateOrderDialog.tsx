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
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CreateOrderDialogProps {
  trigger: React.ReactNode;
  onOrderCreated?: () => void;
}

interface CustomerActivity {
  id: string;
  name: string;
  type: string;
  code?: string;
  description?: string;
  unit: string;
  unitPrice?: number;
  prices?: Array<{
    id: string;
    minQuantity: number;
    maxQuantity: number;
    price: number;
    currency: string;
  }>;
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
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [templateData, setTemplateData] = useState<Record<
    string,
    string
  > | null>(null);
  const [templateLines, setTemplateLines] = useState<string[]>([]);
  const [cartonQuantity, setCartonQuantity] = useState<number>(0);
  const [articleQuantity, setArticleQuantity] = useState<number>(0);

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
        const processedActivities = (activitiesData.data || []).map((activity: any) => {
          // Map 'prices' to 'customerPrices' and calculate lowest price
          const prices = activity.prices || [];
          const lowestPrice = prices.length > 0 ? Math.min(...prices.map((p: any) => Number(p.price))) : 0;
          return { ...activity, customerPrices: prices, unitPrice: lowestPrice };
        });
        setActivities(processedActivities);
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
    setCartonQuantity(0);
    setArticleQuantity(0);
    setCurrentStep(1);
    setErrors({});
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentStep === 1 && selectedActivities.length === 0) {
      toast.error("Please select at least one activity");
      return;
    }
    if (currentStep === 2 && (!cartonQuantity || cartonQuantity < 1)) {
      toast.error("Please enter a valid carton quantity");
      return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.scheduledDate) {
      toast.error("Scheduled date is required");
      return;
    }

    if (!cartonQuantity || cartonQuantity < 1) {
      toast.error("Carton quantity is required");
      return;
    }

    if (!articleQuantity || articleQuantity < 1) {
      toast.error("Article quantity is required");
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
        activities: selectedActivities.map(activityId => ({
          activityId,
          quantity: cartonQuantity
        })),
        cartonQuantity,
        articleQuantity,
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
        ? [...prev, activityId]
        : prev.filter((id) => id !== activityId)
    );
  };

  const handleTemplateDataChange = (field: string, value: string) => {
    setTemplateData((prev) =>
      prev ? { ...prev, [field]: value } : { [field]: value }
    );
  };

  const getTotalPrice = () => {
    if (cartonQuantity === 0) return 0;

    return selectedActivities.reduce((total, activityId) => {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return total;

      // Find price based on carton quantity range
      if (activity.prices && activity.prices.length > 0) {
        const applicablePrice = activity.prices.find((p: any) =>
          cartonQuantity >= p.minQuantity && cartonQuantity <= p.maxQuantity
        );
        if (applicablePrice) {
          return total + Number(applicablePrice.price);
        }
      }

      return total + (Number(activity.unitPrice) || 0);
    }, 0);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Step 1: Select Activities</h3>
        <p className="text-sm text-muted-foreground">Choose activities for this order</p>
      </div>
      <div>
        <Label>{t("customerPortal.createOrder.selectActivities")}</Label>
        <div className="text-sm text-muted-foreground mb-2">
          {selectedActivities.length}{" "}
          {t("customerPortal.createOrder.activitiesSelected")}
        </div>
        <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`activity-${activity.id}`}
                    checked={selectedActivities.includes(activity.id)}
                    onCheckedChange={(checked) =>
                      handleActivityToggle(activity.id, checked as boolean)
                    }
                  />
                  <div>
                    <Label
                      htmlFor={`activity-${activity.id}`}
                      className="text-sm font-medium"
                    >
                      {activity.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Type: {activity.type?.replace('_', ' ')} | Unit: {activity.unit}
                    </p>
                  </div>
                </div>
              </div>
              {activity.prices && activity.prices.length > 0 ? (
                <div className="ml-6">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Price Ranges:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    {activity.prices.map((price: any, idx: number) => (
                      <div key={idx} className="bg-muted/50 px-2 py-1 rounded">
                        {price.minQuantity}-{price.maxQuantity}: €{Number(price.price).toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="ml-6">
                  <p className="text-xs text-muted-foreground">
                    Base Price: €{Number(activity.unitPrice || 0).toFixed(2)}
                  </p>
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
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Step 2: Quantities</h3>
        <p className="text-sm text-muted-foreground">Enter carton and article quantities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cartonQuantity">Carton Quantity *</Label>
          <Input
            id="cartonQuantity"
            type="number"
            min="1"
            value={cartonQuantity || ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              setCartonQuantity(value);
              if (errors.cartonQuantity) setErrors(prev => ({ ...prev, cartonQuantity: "" }));
            }}
            className={errors.cartonQuantity ? "border-red-500" : ""}
            placeholder="Enter carton quantity"
          />
          {errors.cartonQuantity && <p className="text-sm text-red-500 mt-1">{errors.cartonQuantity}</p>}
        </div>
        <div>
          <Label htmlFor="articleQuantity">Article Quantity *</Label>
          <Input
            id="articleQuantity"
            type="number"
            min="1"
            value={articleQuantity || ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              setArticleQuantity(value);
              if (errors.articleQuantity) setErrors(prev => ({ ...prev, articleQuantity: "" }));
            }}
            className={errors.articleQuantity ? "border-red-500" : ""}
            placeholder="Enter article quantity"
          />
          {errors.articleQuantity && <p className="text-sm text-red-500 mt-1">{errors.articleQuantity}</p>}
        </div>
      </div>

      {cartonQuantity > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Price Calculation</h4>
          <div className="text-sm text-muted-foreground mb-2">
            Based on carton quantity: {cartonQuantity}
          </div>
          <div className="space-y-1">
            {selectedActivities.map(activityId => {
              const activity = activities.find(a => a.id === activityId);
              if (!activity) return null;

              let price = 0;
              let priceInfo = "Base price";

              if (activity.prices && activity.prices.length > 0) {
                const applicablePrice = activity.prices.find((p: any) =>
                  cartonQuantity >= p.minQuantity && cartonQuantity <= p.maxQuantity
                );
                if (applicablePrice) {
                  price = Number(applicablePrice.price);
                  priceInfo = `${applicablePrice.minQuantity}-${applicablePrice.maxQuantity} range`;
                }
              } else {
                price = Number(activity.unitPrice) || 0;
              }

              return (
                <div key={activityId} className="flex justify-between text-sm">
                  <span>{activity.name} ({priceInfo})</span>
                  <span>€{price.toFixed(2)}</span>
                </div>
              );
            })}
            <div className="border-t pt-1 mt-2 flex justify-between font-medium">
              <span>Total Price:</span>
              <span>€{getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Step 3: Order Details</h3>
        <p className="text-sm text-muted-foreground">Complete the order information</p>
      </div>

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
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetFormData();
    }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("customerPortal.createOrder.title")}</DialogTitle>
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && <div className={`w-8 h-0.5 ${
                    currentStep > step ? 'bg-primary' : 'bg-muted'
                  }`} />}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && (
            <form id="order-form" onSubmit={handleSubmit} className="space-y-6">
              {renderStep3()}
            </form>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
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

              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} form="order-form">
                  {loading
                    ? t("customerPortal.createOrder.creating")
                    : t("customerPortal.createOrder.createOrder")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderDialog;

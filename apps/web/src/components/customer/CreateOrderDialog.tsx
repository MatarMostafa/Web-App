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
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

interface Container {
  id?: string;
  serialNumber: string;
  cartonQuantity: number;
  articleQuantity: number;
  cartonPrice: number;
  articlePrice: number;
}

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
  const [templateData, setTemplateData] = useState<Record<string, string> | null>(null);
  const [templateLines, setTemplateLines] = useState<string[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);

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
      const [profileResponse, activitiesResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/me`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/me/activities`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }),
      ]);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const customer = profileData.data;

        setFormData((prev) => ({
          ...prev,
          customerId: customer.id,
          location: typeof customer.address === "string"
            ? customer.address
            : Object.values(customer.address || {})
                .filter(Boolean)
                .join(", "),
        }));

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
      toast.error(t("messages.error"));
    }
  };

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
    setContainers([]);
    setCurrentStep(1);
    setErrors({});
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentStep === 1 && selectedActivities.length === 0) {
      toast.error("Please select at least one activity");
      return;
    }
    if (currentStep === 2 && containers.length === 0) {
      toast.error("Please add at least one container");
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

    if (containers.length === 0) {
      toast.error("At least one container is required");
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
          quantity: containers.reduce((sum, c) => sum + c.cartonQuantity, 0)
        })),
        containers,
        cartonQuantity: containers.reduce((sum, c) => sum + c.cartonQuantity, 0),
        articleQuantity: containers.reduce((sum, c) => sum + c.articleQuantity, 0),
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
    setSelectedActivities(prev => {
      const newActivities = checked
        ? [...prev, activityId]
        : prev.filter(id => id !== activityId);
      
      // Update carton prices for all containers when activities change
      setTimeout(() => {
        setContainers(currentContainers => 
          currentContainers.map(container => ({
            ...container,
            cartonPrice: calculateCartonPriceForQuantity(container.cartonQuantity, newActivities)
          }))
        );
      }, 0);
      
      return newActivities;
    });
  };

  const calculateCartonPriceForQuantity = (cartonQuantity: number, activityIds: string[] = selectedActivities) => {
    return activityIds.reduce((total, activityId) => {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return total;

      // For customer orders, we use a base calculation since we don't have customer pricing data
      // The backend will handle proper price calculation with customer-specific pricing
      return total + (cartonQuantity * 1); // Placeholder - backend will calculate actual prices
    }, 0);
  };

  const handleTemplateDataChange = (line: string, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      [line]: value
    }));
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
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-gray-500">No activities available</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const addContainer = () => {
      // Calculate default article price from selected activities' base prices
      const defaultArticlePrice = 0; // Placeholder - backend will calculate actual prices

      const newContainer: Container = {
        serialNumber: `CONT-${Date.now()}`,
        cartonQuantity: 1,
        articleQuantity: 1,
        cartonPrice: calculateCartonPriceForQuantity(1),
        articlePrice: defaultArticlePrice
      };
      setContainers([...containers, newContainer]);
    };

    const updateContainer = (index: number, field: keyof Container, value: any) => {
      const updated = [...containers];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-calculate carton price when carton quantity changes
      if (field === 'cartonQuantity') {
        const cartonPrice = calculateCartonPriceForQuantity(value);
        updated[index].cartonPrice = cartonPrice;
      }
      
      setContainers(updated);
    };

    const removeContainer = (index: number) => {
      setContainers(containers.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold">Step 2: Container Management</h3>
          <p className="text-sm text-muted-foreground">Add containers with their details</p>
        </div>

        <div className="flex justify-between items-center">
          <h4 className="font-medium">Containers ({containers.length})</h4>
          <Button type="button" onClick={addContainer} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Container
          </Button>
        </div>

        {containers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No containers added yet</p>
            <p className="text-sm">Click "Add Container" to get started</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {containers.map((container, containerIndex) => (
              <div key={containerIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h5 className="font-medium">Container {containerIndex + 1}</h5>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeContainer(containerIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Serial Number</Label>
                    <Input
                      value={container.serialNumber}
                      onChange={(e) => updateContainer(containerIndex, 'serialNumber', e.target.value)}
                      placeholder="Container serial number"
                    />
                  </div>
                  <div>
                    <Label>Carton Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={container.cartonQuantity}
                      onChange={(e) => updateContainer(containerIndex, 'cartonQuantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Article Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={container.articleQuantity}
                      onChange={(e) => updateContainer(containerIndex, 'articleQuantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded">
                  <div className="text-sm font-medium">
                    Container Summary: {container.cartonQuantity} cartons, {container.articleQuantity} articles
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {containers.length > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Containers:</span>
                <span>{containers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Cartons:</span>
                <span>{containers.reduce((sum, c) => sum + c.cartonQuantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Articles:</span>
                <span>{containers.reduce((sum, c) => sum + c.articleQuantity, 0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
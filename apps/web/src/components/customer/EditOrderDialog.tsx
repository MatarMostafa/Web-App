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
  basePrice: number;
}

interface EditOrderDialogProps {
  trigger: React.ReactNode;
  order: any;
  onOrderUpdated?: () => void;
}

interface CustomerActivity {
  id: string;
  name: string;
  type: string;
  code?: string;
  description?: string;
  unit: string;
  basePrice?: number;
  articleBasePrice?: number;
  unitPrice?: number;
  customerPrices?: Array<{
    minQuantity: number;
    maxQuantity: number;
    price: number;
  }>;
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

  // Check if order can be edited (only DRAFT orders)
  const canEdit = order?.status === 'planned'; // 'planned' is the customer-facing status for DRAFT

  useEffect(() => {
    if (open && order) {
      loadOrderData();
    }
  }, [open, order]);

  const loadOrderData = async () => {
    setLoading(true);
    try {
      // 1. Fetch activities available for this customer
      const activitiesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/me/activities`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );

      let customerActivities: CustomerActivity[] = [];
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        const data = activitiesData.data || activitiesData;
        if (Array.isArray(data)) {
          customerActivities = data.map((activity: any) => {
            const prices = activity.prices || [];
            const lowestPrice = prices.length > 0 ? Math.min(...prices.map((p: any) => Number(p.price))) : 0;
            return { 
              ...activity, 
              customerPrices: prices, 
              unitPrice: lowestPrice,
              basePrice: Number(activity.basePrice) || 0,
              articleBasePrice: Number(activity.articleBasePrice) || 0
            };
          });
          setActivities(customerActivities);
        }
      }

      // 2. Fetch current order details
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/me/orders/${order.id}`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );

      if (response.ok) {
        const orderDetails = await response.json();
        const orderData = orderDetails.data;
        
        const scheduledDate = orderData.scheduledDate ? new Date(orderData.scheduledDate).toISOString().split('T')[0] : "";
        
        setFormData({
          description: orderData.description || "",
          scheduledDate,
          startTime: orderData.startTime || "",
          endTime: orderData.endTime || "",
          location: orderData.location || "",
          specialInstructions: orderData.specialInstructions || "",
          status: orderData.status,
          customerId: orderData.customerId,
        });

        if (orderData.startTime) {
          const startTime = new Date(orderData.startTime);
          setStartTimeOnly(`${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`);
        }
        
        if (orderData.endTime) {
          const endTime = new Date(orderData.endTime);
          setEndTimeOnly(`${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`);
        }

        // Load activities
        if (orderData.activityIds) {
          setSelectedActivities(orderData.activityIds);
        }

        // Load containers
        if (orderData.containers) {
          const loadedContainers = orderData.containers.map((c: any) => {
            // Use activityIds from orderData
            const activityIds = orderData.activityIds || [];
            const cartonPrice = calculateCartonPriceForQuantity(c.cartonQuantity, activityIds, customerActivities);
            const articlePrice = activityIds.reduce((total: number, activityId: string) => {
              const activity = customerActivities.find(a => a.id === activityId);
              return total + (Number(activity?.articleBasePrice) || 0);
            }, 0);
            const basePrice = activityIds.reduce((total: number, activityId: string) => {
              const activity = customerActivities.find(a => a.id === activityId);
              return total + (Number(activity?.basePrice) || 0);
            }, 0);

            return {
              id: c.id,
              serialNumber: c.serialNumber || "",
              cartonQuantity: c.cartonQuantity || 1,
              articleQuantity: c.articleQuantity || 0,
              cartonPrice,
              articlePrice,
              basePrice
            };
          });
          setContainers(loadedContainers);
        }

        // Load template data
        if (orderData.descriptionData?.descriptionData) {
          setTemplateData(orderData.descriptionData.descriptionData);
        }
        
        // Load template lines (from customer profile)
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
      console.error("Error loading order data:", error);
      toast.error(t("messages.error"));
    } finally {
      setLoading(false);
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

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentStep === 1 && selectedActivities.length === 0) {
      toast.error(t("customerPortal.createOrder.activitiesRequired"));
      return;
    }
    if (currentStep === 2 && containers.length === 0) {
      toast.error(t("customerPortal.createOrder.containerRequired"));
      return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const calculateCartonPriceForQuantity = (cartonQuantity: number, activityIds: string[] = selectedActivities, availableActivities: CustomerActivity[] = activities) => {
    return activityIds.reduce((total, activityId) => {
      const activity = availableActivities.find(a => a.id === activityId);
      if (!activity) return total;

      if (activity.customerPrices && activity.customerPrices.length > 0) {
        const applicablePrice = activity.customerPrices.find((p: any) =>
          cartonQuantity >= p.minQuantity && cartonQuantity <= p.maxQuantity
        );
        if (applicablePrice) {
          return total + Number(applicablePrice.price);
        }
      }

      return total + (Number(activity.unitPrice) || 0);
    }, 0);
  };

  const handleActivityToggle = (activityId: string, checked: boolean) => {
    setSelectedActivities(prev => {
      const newActivities = checked
        ? [...prev, activityId]
        : prev.filter(id => id !== activityId);
      
      // Update container prices
      setTimeout(() => {
        setContainers(currentContainers => 
          currentContainers.map(container => {
            const cartonPrice = calculateCartonPriceForQuantity(container.cartonQuantity, newActivities);
            const articlePrice = newActivities.reduce((total, activityId) => {
              const activity = activities.find(a => a.id === activityId);
              return total + (Number(activity?.articleBasePrice) || 0);
            }, 0);
            const basePrice = newActivities.reduce((total, activityId) => {
              const activity = activities.find(a => a.id === activityId);
              return total + (Number(activity?.basePrice) || 0);
            }, 0);
            
            return {
              ...container,
              cartonPrice,
              articlePrice,
              basePrice
            };
          })
        );
      }, 0);
      
      return newActivities;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      toast.error(t("customerPortal.editOrder.cannotEditOrder"));
      return;
    }

    if (!formData.scheduledDate) {
      toast.error(t("customerPortal.createOrder.scheduledDateRequired"));
      return;
    }

    if (containers.length === 0) {
      toast.error(t("customerPortal.createOrder.containerRequired"));
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
        activities: selectedActivities.map(activityId => {
          const activity = activities.find(a => a.id === activityId);
          return {
            activityId,
            quantity: containers.reduce((sum, c) => sum + c.cartonQuantity, 0),
            basePrice: Number(activity?.basePrice) || 0,
            articleBasePrice: Number(activity?.articleBasePrice) || 0
          };
        }),
        containers: containers.map(c => ({
          id: c.id, // Include ID for updates
          serialNumber: c.serialNumber,
          cartonQuantity: c.cartonQuantity,
          articleQuantity: c.articleQuantity,
          cartonPrice: c.cartonPrice,
          articlePrice: c.articlePrice
        })),
        cartonQuantity: containers.reduce((sum, c) => sum + c.cartonQuantity, 0),
        articleQuantity: containers.reduce((sum, c) => sum + c.articleQuantity, 0),
        templateData: templateData
      };

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
      toast.error(error instanceof Error ? error.message : t("customerPortal.editOrder.orderUpdateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateOrderData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        <h3 className="text-lg font-semibold">{t("customerPortal.createOrder.step1Title")}</h3>
        <p className="text-sm text-muted-foreground">{t("customerPortal.createOrder.step1Description")}</p>
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
                      {t("admin.orders.form.activityType")}: {activity.type?.replace('_', ' ')} | {t("admin.orders.form.activityUnit")}: {activity.unit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-gray-500">{t("customerPortal.createOrder.noActivitiesAvailable")}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const addContainer = () => {
      const defaultArticlePrice = selectedActivities.reduce((total, activityId) => {
        const activity = activities.find(a => a.id === activityId);
        return total + (Number(activity?.articleBasePrice) || 0);
      }, 0);

      const defaultBasePrice = selectedActivities.reduce((total, activityId) => {
        const activity = activities.find(a => a.id === activityId);
        return total + (Number(activity?.basePrice) || 0);
      }, 0);

      const newContainer: Container = {
        serialNumber: `CONT-${Date.now()}`,
        cartonQuantity: 1,
        articleQuantity: 1,
        cartonPrice: calculateCartonPriceForQuantity(1),
        articlePrice: defaultArticlePrice,
        basePrice: defaultBasePrice
      };
      setContainers([...containers, newContainer]);
    };

    const updateContainer = (index: number, field: keyof Container, value: any) => {
      const updated = [...containers];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'cartonQuantity') {
        updated[index].cartonPrice = calculateCartonPriceForQuantity(value);
      }
      
      const calculatedArticlePrice = selectedActivities.reduce((total, activityId) => {
        const activity = activities.find(a => a.id === activityId);
        return total + (Number(activity?.articleBasePrice) || 0);
      }, 0);

      const calculatedBasePrice = selectedActivities.reduce((total, activityId) => {
        const activity = activities.find(a => a.id === activityId);
        return total + (Number(activity?.basePrice) || 0);
      }, 0);

      updated[index].articlePrice = calculatedArticlePrice;
      updated[index].basePrice = calculatedBasePrice;
      
      setContainers(updated);
    };

    const removeContainer = (index: number) => {
      setContainers(containers.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold">{t("customerPortal.createOrder.step2Title")}</h3>
          <p className="text-sm text-muted-foreground">{t("customerPortal.createOrder.step2Description")}</p>
        </div>

        <div className="flex justify-between items-center">
          <h4 className="font-medium">{t("admin.orders.form.containers")} ({containers.length})</h4>
          <Button type="button" onClick={addContainer} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t("admin.orders.form.addContainer")}
          </Button>
        </div>

        {containers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>{t("admin.orders.form.noContainersAdded")}</p>
            <p className="text-sm">{t("admin.orders.form.clickAddContainer")}</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {containers.map((container, containerIndex) => (
              <div key={containerIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h5 className="font-medium">{t("admin.orders.form.container")} {containerIndex + 1}</h5>
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
                    <Label>{t("admin.orders.form.serialNumber")}</Label>
                    <Input
                      value={container.serialNumber}
                      onChange={(e) => updateContainer(containerIndex, 'serialNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{t("admin.orders.form.cartonQuantity")}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={container.cartonQuantity}
                      onChange={(e) => updateContainer(containerIndex, 'cartonQuantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>{t("admin.orders.form.articleQuantity")}</Label>
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
                    {t("customerPortal.createOrder.containerSummary")}: {container.cartonQuantity} {t("customerPortal.createOrder.cartons")}, {container.articleQuantity} {t("customerPortal.createOrder.articles")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {containers.length > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t("admin.orders.form.orderSummary")}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{t("admin.orders.form.totalContainers")}:</span>
                <span>{containers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("admin.orders.form.totalCartons")}:</span>
                <span>{containers.reduce((sum, c) => sum + c.cartonQuantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("admin.orders.form.totalArticles")}:</span>
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
        <h3 className="text-lg font-semibold">{t("customerPortal.createOrder.step3Title")}</h3>
        <p className="text-sm text-muted-foreground">{t("customerPortal.createOrder.step3Description")}</p>
      </div>

      <div>
        <Label htmlFor="scheduledDate">
          {t("customerPortal.createOrder.scheduledDate")} *
        </Label>
        <Input
          id="scheduledDate"
          type="date"
          value={formData.scheduledDate}
          onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">
            {t("customerPortal.createOrder.startTime")}
          </Label>
          <TimeOnlyInput value={startTimeOnly} onChange={setStartTimeOnly} />
        </div>
        <div>
          <Label htmlFor="endTime">
            {t("customerPortal.createOrder.endTime")}
          </Label>
          <TimeOnlyInput value={endTimeOnly} onChange={setEndTimeOnly} />
        </div>
      </div>

      <div>
        <Label htmlFor="location">
          {t("customerPortal.createOrder.location")}
        </Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
        />
      </div>

      {templateLines.map((line) => (
        <div key={line}>
          <Label htmlFor={`template-${line}`}>{line}</Label>
          <Input
            id={`template-${line}`}
            value={templateData?.[line] || ""}
            onChange={(e) => handleTemplateDataChange(line, e.target.value)}
          />
        </div>
      ))}

      <div>
        <Label htmlFor="specialInstructions">
          {t("customerPortal.createOrder.specialInstructions")}
        </Label>
        <Textarea
          id="specialInstructions"
          value={formData.specialInstructions}
          onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );

  if (!canEdit) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md text-center py-6">
          <DialogHeader>
            <DialogTitle>{t("customerPortal.editOrder.title")}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground my-4">
            {t("customerPortal.editOrder.cannotEditMessage")}
          </p>
          <Button onClick={() => setOpen(false)}>{t("common.close")}</Button>
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
          <div className="flex justify-center mt-4 space-x-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 3 && <div className={`w-8 h-0.5 ${currentStep > step ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && (
            <form id="edit-order-form" onSubmit={handleSubmit} className="space-y-6">
              {renderStep3()}
            </form>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("common.previous")}
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                {t("customerPortal.createOrder.cancel")}
              </Button>

              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext}>
                  {t("common.next")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} form="edit-order-form">
                  {loading ? t("customerPortal.editOrder.updating") : t("customerPortal.editOrder.updateOrder")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;
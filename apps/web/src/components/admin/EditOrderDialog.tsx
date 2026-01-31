"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
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
import OrderDescriptionForm from "./OrderDescriptionForm";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

interface Container {
  id?: string;
  serialNumber: string;
  cartonQuantity: number;
  articleQuantity: number;
  cartonPrice: number;
  articlePrice: number;
  articles: Array<{
    articleName: string;
    quantity: number;
    price: number;
  }>;
}

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

  if (!ready) return null;

  const { updateOrder, getOrderAssignments, getOrderContainers } = useOrderStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { customers, fetchCustomers } = useCustomerStore();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [templateData, setTemplateData] = useState<Record<string, string> | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);
  const [cartonQuantity, setCartonQuantity] = useState<number>(0);
  const [articleQuantity, setArticleQuantity] = useState<number>(0);
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);

  const [formData, setFormData] = useState<UpdateOrderData>({
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
  });
  const [startTimeOnly, setStartTimeOnly] = useState("09:00");
  const [endTimeOnly, setEndTimeOnly] = useState("");

  // Initialize form data when dialog opens
  useEffect(() => {
    if (order && open) {
      console.log('Initializing with order:', order);

      const scheduledDate = new Date(order.scheduledDate).toISOString().split('T')[0];
      const startTime = order.startTime ? new Date(order.startTime).toTimeString().slice(0, 5) : "09:00";
      const endTime = order.endTime ? new Date(order.endTime).toTimeString().slice(0, 5) : "";

      setFormData({
        description: order.description || "",
        scheduledDate,
        startTime: order.startTime || "",
        endTime: order.endTime || "",
        duration: order.duration,
        location: order.location || "",
        requiredEmployees: order.requiredEmployees,
        priority: order.priority,
        specialInstructions: order.specialInstructions || "",
        status: order.status,
        customerId: order.customerId,
      });

      setStartTimeOnly(startTime);
      setEndTimeOnly(endTime);
      setContainers([]); // Will be loaded by loadOrderData
      setCartonQuantity(order.cartonQuantity || 0);
      setArticleQuantity(order.articleQuantity || 0);

      if (order.descriptionData?.descriptionData) {
        setTemplateData(order.descriptionData.descriptionData);
      }

      fetchEmployees();
      fetchCustomers();
      loadOrderData();
    }
  }, [order, open]);

  const loadOrderData = async () => {
    try {
      let activitiesData: any[] = [];
      if (order.customerId) {
        activitiesData = await fetchActivities(order.customerId);
      }

      const [employeeIds, activityIds, containerData] = await Promise.all([
        getOrderAssignments(order.id),
        fetchOrderActivities(order.id),
        getOrderContainers(order.id)
      ]);

      setAssignedEmployeeIds(employeeIds);
      setSelectedActivities(activityIds);

      // Recalculate prices for loaded containers based on activities
      const currentActivities = activitiesData;
      const filteredActivities = currentActivities.filter((a: any) => activityIds.includes(a.id));
      const calculatedArticlePrice = filteredActivities.reduce((total: number, a: any) => total + (Number(a.articleBasePrice) || 0), 0);
      const calculatedBasePrice = filteredActivities.reduce((total: number, a: any) => total + (Number(a.basePrice) || 0), 0);

      const enhancedContainers = containerData.map((container: any) => ({
        ...container,
        articlePrice: calculatedArticlePrice,
        basePrice: calculatedBasePrice,
        cartonPrice: calculateCartonPriceForLoadedQuantity(container.cartonQuantity, activityIds, currentActivities)
      }));

      setContainers(enhancedContainers);
    } catch (error) {
      console.error("Error loading order data:", error);
    }
  };

  const calculateCartonPriceForLoadedQuantity = (cartonQuantity: number, activityIds: string[], loadedActivities: any[]) => {
    return activityIds.reduce((total, activityId) => {
      const activity = loadedActivities.find(a => a.id === activityId);
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

  const fetchOrderActivities = async (orderId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/activity-ids`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
    } catch (error) {
      console.error("Error fetching order activities:", error);
    }
    return [];
  };



  const fetchActivities = async (customerId: string) => {
    if (!customerId) return [];
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pricing/customers/${customerId}/activities`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        const jsonResponse = await response.json();
        const data = jsonResponse.data || jsonResponse;

        if (Array.isArray(data)) {
          const processedActivities = data.map((activity: any) => {
            const prices = activity.prices || [];
            const lowestPrice = prices.length > 0 ? Math.min(...prices.map((p: any) => Number(p.price))) : 0;
            return { ...activity, customerPrices: prices, unitPrice: lowestPrice };
          });
          setActivities(processedActivities);
          return processedActivities;
        }
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
    setActivities([]);
    return [];
  };

  // Auto-fetch activities when customer changes
  useEffect(() => {
    if (formData.customerId) {
      fetchActivities(formData.customerId);
    }
  }, [formData.customerId]);

  // Combine date and time
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

  const handleNext = () => {
    if (currentStep === 2 && selectedActivities.length === 0) {
      toast.error("Please select at least one activity");
      return;
    }
    if (currentStep === 3 && containers.length === 0) {
      toast.error("Please add at least one container");
      return;
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = "Customer is required";
    if (!formData.scheduledDate) newErrors.scheduledDate = "Scheduled date is required";
    if (!formData.priority || formData.priority < 1) newErrors.priority = "Priority is required";
    if (containers.length === 0) newErrors.containers = "At least one container is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        activities: selectedActivities.map(activityId => {
          const activity = activities.find(a => a.id === activityId);
          return {
            activityId,
            quantity: containers.reduce((sum, c) => sum + c.cartonQuantity, 0),
            articleBasePrice: Number(activity?.articleBasePrice) || 0,
            basePrice: Number(activity?.basePrice) || 0
          };
        }),
        containers,
        cartonQuantity: containers.reduce((sum, c) => sum + c.cartonQuantity, 0),
        articleQuantity: containers.reduce((sum, c) => sum + c.articleQuantity, 0),
        templateData,
        assignedEmployeeIds
      };

      // Convert dates to ISO format
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
      toast.success("Order updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateOrderData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    setAssignedEmployeeIds(prev =>
      checked
        ? [...prev, employeeId]
        : prev.filter(id => id !== employeeId)
    );
  };

  const handleActivityToggle = (activityId: string, checked: boolean) => {
    setSelectedActivities(prev => {
      const nextActivities = checked
        ? [...prev, activityId]
        : prev.filter(id => id !== activityId);
      
      // Update all prices for all containers when activities change
      setTimeout(() => {
        setContainers(currentContainers => {
          const updatedActivities = activities.filter(a => nextActivities.includes(a.id));
          const newArticlePrice = updatedActivities.reduce((total, a) => total + (Number(a.articleBasePrice) || 0), 0);
          const newBasePrice = updatedActivities.reduce((total, a) => total + (Number(a.basePrice) || 0), 0);

          return currentContainers.map(container => ({
            ...container,
            cartonPrice: calculateCartonPriceForQuantity(container.cartonQuantity, nextActivities),
            articlePrice: newArticlePrice,
            basePrice: newBasePrice
          }));
        });
      }, 0);
      
      return nextActivities;
    });
  };

  const getCartonPriceTotal = () => {
    return containers.reduce((sum, c) => sum + (c.cartonPrice || 0), 0);
  };

  const getBasePriceTotal = () => {
    return containers.reduce((sum, c) => sum + ((c as any).basePrice || 0), 0);
  };

  const getArticlePriceTotal = () => {
    return containers.reduce((sum, c) => sum + (c.articleQuantity * (c.articlePrice || 0)), 0);
  };

  const getSubArticlesTotal = () => {
    return containers.reduce((sum, c) => sum + c.articles.reduce((aSum, a) => aSum + (a.quantity * a.price), 0), 0);
  };

  const getTotalPrice = () => {
    return getCartonPriceTotal() + getBasePriceTotal() + getArticlePriceTotal() + getSubArticlesTotal();
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">{t("admin.orders.form.step1Title")}</h3>
        <p className="text-sm text-muted-foreground">{t("admin.orders.form.step1Description")}</p>
      </div>
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
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">{t("admin.orders.form.step2Title")}</h3>
        <p className="text-sm text-muted-foreground">{t("admin.orders.form.step2Description")}</p>
      </div>
      <div>
        <Label>Activities ({selectedActivities.length} selected)</Label>
        <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`activity-${activity.id}`}
                  checked={selectedActivities.includes(activity.id)}
                  onCheckedChange={(checked) => handleActivityToggle(activity.id, checked as boolean)}
                />
                <div>
                  <Label htmlFor={`activity-${activity.id}`} className="text-sm font-medium">
                    {activity.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.orders.form.activityType")}: {activity.type?.replace('_', ' ')} | {t("admin.orders.form.activityUnit")}: {activity.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {t("admin.orders.form.articleBasePrice")}: €{Number(activity.articleBasePrice || 0).toFixed(2)}
                </div>
                {Number(activity.basePrice || 0) !== 0 && (
                  <div className="text-sm font-medium">
                    {t("admin.orders.form.basePrice")}: €{Number(activity.basePrice || 0).toFixed(2)}
                  </div>
                )}
              </div>
              {activity.customerPrices && activity.customerPrices.length > 0 && (
                <div className="ml-6">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Price Ranges:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    {activity.customerPrices.map((price: any, idx: number) => (
                      <div key={idx} className="bg-muted/50 px-2 py-1 rounded">
                        {price.minQuantity}-{price.maxQuantity}: €{Number(price.price).toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-gray-500">No activities available for this customer</p>
          )}
        </div>
      </div>
    </div>
  );

  const calculateCartonPriceForQuantity = (cartonQuantity: number, activityIds?: string[]) => {
    const ids = activityIds || selectedActivities;
    return ids.reduce((total, activityId) => {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return total;

      // Find price based on carton quantity range
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

  const renderStep3 = () => {
    const addContainer = () => {
      const updatedActivities = activities.filter(a => selectedActivities.includes(a.id));
      const newArticlePrice = updatedActivities.reduce((total, a) => total + (Number(a.articleBasePrice) || 0), 0);
      const newBasePrice = updatedActivities.reduce((total, a) => total + (Number(a.basePrice) || 0), 0);

      const newContainer: Container & { basePrice?: number } = {
        serialNumber: `CONT-${Date.now()}`,
        cartonQuantity: 1,
        articleQuantity: 1,
        cartonPrice: calculateCartonPriceForQuantity(1),
        articlePrice: newArticlePrice,
        basePrice: newBasePrice,
        articles: []
      };
      setContainers([...containers, newContainer] as any);
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

    const addArticleToContainer = (containerIndex: number) => {
      const updated = [...containers];
      updated[containerIndex].articles.push({
        articleName: '',
        quantity: 1,
        price: 0
      });
      setContainers(updated);
    };

    const updateArticle = (containerIndex: number, articleIndex: number, field: string, value: any) => {
      const updated = [...containers];
      updated[containerIndex].articles[articleIndex] = {
        ...updated[containerIndex].articles[articleIndex],
        [field]: value
      };
      setContainers(updated);
    };

    const removeArticle = (containerIndex: number, articleIndex: number) => {
      const updated = [...containers];
      updated[containerIndex].articles.splice(articleIndex, 1);
      setContainers(updated);
    };

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold">{t("admin.orders.form.step3Title")}</h3>
          <p className="text-sm text-muted-foreground">{t("admin.orders.form.step3Description")}</p>
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
                    <Label>{t("admin.orders.form.cartonPrice")} (€) - {t("admin.orders.form.autoCalculated")}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={container.cartonPrice}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("admin.orders.form.basedOnActivitiesQuantity")}
                    </p>
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
                  {containers[containerIndex] && (containers[containerIndex] as any).basePrice > 0 && (
                    <div>
                      <Label>{t("admin.orders.form.basePrice")} (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={(containers[containerIndex] as any).basePrice}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  )}
                  <div>
                    <Label>{t("admin.orders.form.articlePrice") + " (€)"}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={container.articlePrice}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("admin.orders.form.basedOnActivitiesBasePrice")}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Articles (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArticleToContainer(containerIndex)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Article
                    </Button>
                  </div>
                  {container.articles.map((article, articleIndex) => (
                    <div key={articleIndex} className="grid grid-cols-4 gap-2 mb-2 items-end">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={article.articleName}
                          onChange={(e) => updateArticle(containerIndex, articleIndex, 'articleName', e.target.value)}
                          placeholder="Article name"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={article.quantity}
                          onChange={(e) => updateArticle(containerIndex, articleIndex, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Price (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={article.price}
                          onChange={(e) => updateArticle(containerIndex, articleIndex, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArticle(containerIndex, articleIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/50 p-3 rounded">
                  <div className="text-sm font-medium">{t("admin.orders.form.containerTotal")}: €{(container.cartonPrice + ((container as any).basePrice || 0) + (container.articleQuantity * container.articlePrice)).toFixed(2)}</div>
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
              <div className="border-t pt-1 mt-2 flex justify-between font-medium">
                <span>{t("admin.orders.form.containerTotal")}:</span>
                <span>€{containers.reduce((sum, c) => sum + c.cartonPrice + ((c as any).basePrice || 0) + (c.articleQuantity * c.articlePrice), 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">{t("admin.orders.form.step4Title")}</h3>
        <p className="text-sm text-muted-foreground">{t("admin.orders.form.step4Description")}</p>
      </div>

      <OrderDescriptionForm
        customerId={formData.customerId || ""}
        description={formData.description || ""}
        onDescriptionChange={(description) => handleInputChange("description", description)}
        onTemplateDataChange={setTemplateData}
        orderDescriptionData={templateData}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            placeholder="Enter location"
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
          <Label htmlFor="endTime">End Time (Optional)</Label>
          <TimeOnlyInput
            value={endTimeOnly}
            onChange={setEndTimeOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Priority *</Label>
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
        <Label>Assign Employees ({assignedEmployeeIds.length} selected)</Label>
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
            <p className="text-sm text-gray-500">No employees available</p>
          )}
        </div>
      </div>

      {/* Order Total Display */}
      {(selectedActivities.length > 0 || containers.length > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-green-800">{t("admin.orders.form.orderTotal")}:</span>
            <span className="text-2xl font-bold text-green-600">€{getTotalPrice().toFixed(2)}</span>
          </div>
          <div className="mt-2 text-sm text-green-700">
            <div className="flex justify-between">
              <span>{t("admin.orders.form.activitiesCartonPrice")}:</span>
              <span>€{getCartonPriceTotal().toFixed(2)}</span>
            </div>
            {getBasePriceTotal() !== 0 && (
              <div className="flex justify-between">
                <span>{t("admin.orders.form.basePrice")}:</span>
                <span>€{getBasePriceTotal().toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t("admin.orders.form.articlesTotalPrice")}:</span>
              <span>€{getArticlePriceTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) setCurrentStep(1);
    }}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("admin.orders.editOrder")}</DialogTitle>
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                    {step}
                  </div>
                  {step < 4 && <div className={`w-8 h-0.5 ${currentStep > step ? 'bg-primary' : 'bg-muted'
                    }`} />}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && (
            <form id="order-form" onSubmit={handleSubmit} className="space-y-6">
              {renderStep4()}
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
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}>
                  {t("admin.orders.form.next")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} form="order-form">
                  {loading ? t("admin.orders.form.updating") : t("admin.orders.updateOrder")}
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
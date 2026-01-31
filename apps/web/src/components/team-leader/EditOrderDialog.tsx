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
import { UpdateOrderData, OrderStatus } from "@/types/order";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import TimeOnlyInput from "@/components/ui/TimeOnlyInput";
import { useSession } from "next-auth/react";
import OrderDescriptionForm from "../admin/OrderDescriptionForm";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

interface Container {
  id?: string;
  serialNumber: string;
  cartonQuantity: number;
  articleQuantity: number;
  cartonPrice: number;
  articlePrice: number;
  basePrice?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  title?: string;
  description?: string;
  descriptionData?: {
    descriptionData: Record<string, string>;
  };
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number | null;
  location?: string;
  requiredEmployees: number;
  priority: number;
  specialInstructions?: string;
  status: string;
  customerId: string;
  cartonQuantity?: number;
  articleQuantity?: number;
  employeeAssignments?: Array<{
    employeeId?: string;
    employee: {
      id: string;
      firstName?: string;
      lastName?: string;
      employeeCode: string;
    };
  }>;
  customer: {
    companyName: string;
  };
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
  const { t, ready } = useTranslation();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [templateData, setTemplateData] = useState<Record<string, string> | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);

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
    assignedEmployeeIds: [],
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

      const initialAssignedIds = order.employeeAssignments?.map((a: any) => a.employeeId || a.employee?.id).filter(Boolean) || [];

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
        status: order.status as OrderStatus,
        customerId: order.customerId,
        assignedEmployeeIds: initialAssignedIds,
      });

      if (order.descriptionData?.descriptionData) {
        setTemplateData(order.descriptionData.descriptionData);
      } else {
        setTemplateData(null);
      }

      setStartTimeOnly(startTime);
      setEndTimeOnly(endTime);
      setCurrentStep(1);
      
      fetchCustomers();
      fetchEmployees();
      loadOrderData();
    }
  }, [order, open]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
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
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team-leader/employees`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching team employees:", error);
    }
  };

  const loadOrderData = async () => {
    setLoading(true);
    try {
      // 1. Fetch available activities for the customer
      const activitiesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pricing/customers/${order.customerId}/activities`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      
      let activitiesData: any[] = [];
      if (activitiesResponse.ok) {
        const jsonResponse = await activitiesResponse.json();
        const data = jsonResponse.data || jsonResponse;
        if (Array.isArray(data)) {
          activitiesData = data.map((activity: any) => {
            const prices = activity.prices || [];
            const lowestPrice = prices.length > 0 ? Math.min(...prices.map((p: any) => Number(p.price))) : 0;
            return { ...activity, customerPrices: prices, unitPrice: lowestPrice };
          });
          setActivities(activitiesData);
        }
      }

      // 2. Fetch order's current assignments, activities and containers in parallel
      const [assignedResp, activityIdsResp, containersResp] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/assigned-employees`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/activity-ids`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/containers`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        })
      ]);

      const [assignedData, activityIdsData, containersData] = await Promise.all([
        assignedResp.ok ? assignedResp.json() : Promise.resolve([]),
        activityIdsResp.ok ? activityIdsResp.json() : Promise.resolve({ data: [] }),
        containersResp.ok ? containersResp.json() : Promise.resolve({ data: [] })
      ]);

      console.log('EditOrderDialog: Fetched assignments raw:', assignedData);

      // Extract IDs from various possible response formats
      const assignmentIds = Array.isArray(assignedData)
        ? assignedData.map((item: any) => typeof item === 'string' ? item : (item.employeeId || item.id || (item.employee && item.employee.id)))
        : (assignedData.data || []).map((item: any) => typeof item === 'string' ? item : (item.employeeId || item.id || (item.employee && item.employee.id)));

      console.log('EditOrderDialog: Parsed assignment IDs:', assignmentIds);
      
      const selectedActivityIds = activityIdsData.data || [];
      const loadedContainers = containersData.data || [];

      // Always update assignments from the fetch, even if empty, to reflect source of truth
      setFormData(prev => ({ ...prev, assignedEmployeeIds: assignmentIds }));
      setSelectedActivities(selectedActivityIds);

      // 3. Recalculate prices for loaded containers
      const filteredActivities = activitiesData.filter((a: any) => selectedActivityIds.includes(a.id));
      const calculatedArticlePrice = filteredActivities.reduce((total: number, a: any) => total + (Number(a.articleBasePrice) || 0), 0);
      const calculatedBasePrice = filteredActivities.reduce((total: number, a: any) => total + (Number(a.basePrice) || 0), 0);

      const enhancedContainers = loadedContainers.map((container: any) => ({
        ...container,
        articlePrice: calculatedArticlePrice,
        basePrice: calculatedBasePrice,
        cartonPrice: calculateCartonPriceForQuantities(container.cartonQuantity, selectedActivityIds, activitiesData)
      }));

      setContainers(enhancedContainers);
    } catch (error) {
      console.error("Error loading order data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCartonPriceForQuantities = (cartonQuantity: number, activityIds: string[], loadedActivities: any[]) => {
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

  // Sync startTime and endTime only when scheduledDate or pickers change
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

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentStep === 2 && selectedActivities.length === 0) {
      toast.error(t("admin.orders.form.selectActivityRequired"));
      return;
    }
    if (currentStep === 3 && containers.length === 0) {
      toast.error(t("admin.orders.form.addContainerRequired"));
      return;
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = t("admin.orders.form.customerRequired");
    if (!formData.scheduledDate) newErrors.scheduledDate = t("admin.orders.form.scheduledDateRequired");
    if (!formData.priority || formData.priority < 1) newErrors.priority = t("admin.orders.form.priorityRequired");
    if (containers.length === 0) newErrors.containers = t("admin.orders.form.containerRequired");

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(t("admin.orders.form.validationError"));
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
        templateData: templateData
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
        submitData.endTime = undefined;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/team-leader/orders/${order.id}`,
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
        throw new Error(`Failed to update order: ${response.status}`);
      }

      toast.success(t("admin.orders.form.updateSuccess"));
      onOrderUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating order:", error);
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
        return {
          ...prev,
          assignedEmployeeIds: [...currentAssigned, employeeId]
        };
      } else {
        return {
          ...prev,
          assignedEmployeeIds: currentAssigned.filter((id) => id !== employeeId)
        };
      }
    });
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

  const calculateCartonPriceForQuantity = (cartonQuantity: number, activityIds: string[] = selectedActivities) => {
    return activityIds.reduce((total, activityId) => {
      const activity = activities.find(a => a.id === activityId);
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

  const getCartonPriceTotal = () => {
    return containers.reduce((sum, c) => sum + (c.cartonPrice || 0), 0);
  };

  const getBasePriceTotal = () => {
    return containers.reduce((sum, c) => sum + (c.basePrice || 0), 0);
  };

  const getArticlePriceTotal = () => {
    return containers.reduce((sum, c) => sum + (c.articleQuantity * (c.articlePrice || 0)), 0);
  };

  const getTotalPrice = () => {
    return getCartonPriceTotal() + getBasePriceTotal() + getArticlePriceTotal();
  };

  if (!ready) return null;

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">{t("admin.orders.form.step1Title")}</h3>
        <p className="text-sm text-muted-foreground">{t("admin.orders.form.step1Description")}</p>
      </div>
      <div>
        <Label htmlFor="customerId">{t("admin.orders.form.customer")} *</Label>
        <Select
          value={formData.customerId}
          onValueChange={(value) => {
            handleInputChange("customerId", value);
            if (errors.customerId) setErrors(prev => ({ ...prev, customerId: "" }));
          }}
          disabled // Customer cannot be changed in edit mode usually, but depends on requirements
        >
          <SelectTrigger className={errors.customerId ? "border-red-500" : ""}>
            <SelectValue placeholder={t("admin.orders.form.selectCustomer")} />
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
        <Label>{t("admin.orders.form.activities")}</Label>
        <div className="text-sm text-muted-foreground mb-2">
          {t("admin.orders.form.activitiesSelected", { count: selectedActivities.length })}
        </div>
        <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
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
              </div>
              {activity.customerPrices && activity.customerPrices.length > 0 ? (
                <div className="ml-6">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("admin.orders.form.priceRanges")}:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    {activity.customerPrices.map((price: any, idx: number) => (
                      <div key={idx} className="bg-muted/50 px-2 py-1 rounded">
                        {price.minQuantity}-{price.maxQuantity}: €{Number(price.price).toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="ml-6">
                  <p className="text-xs text-muted-foreground">
                    {t("admin.orders.form.basePrice")}: €{Number(activity.unitPrice || 0).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-gray-500">{t("admin.orders.form.noActivitiesAvailable")}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const addContainer = () => {
      const updatedActivities = activities.filter(a => selectedActivities.includes(a.id));
      const newArticlePrice = updatedActivities.reduce((total, a) => total + (Number(a.articleBasePrice) || 0), 0);
      const newBasePrice = updatedActivities.reduce((total, a) => total + (Number(a.basePrice) || 0), 0);

      const newContainer: Container = {
        serialNumber: `CONT-${Date.now()}`,
        cartonQuantity: 1,
        articleQuantity: 1,
        cartonPrice: calculateCartonPriceForQuantity(1),
        articlePrice: newArticlePrice,
        basePrice: newBasePrice
      };
      setContainers([...containers, newContainer]);
    };

    const updateContainer = (index: number, field: keyof Container, value: any) => {
      const updated = [...containers];
      updated[index] = { ...updated[index], [field]: value };
      
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
          <h3 className="text-lg font-semibold">{t("admin.orders.form.step3Title")}</h3>
          <p className="text-sm text-muted-foreground">{t("admin.orders.form.step3Description")}</p>
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
                      placeholder={t("admin.orders.form.serialNumberPlaceholder")}
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
                    <Label>{t("admin.orders.form.cartonPrice")} (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={container.cartonPrice}
                      readOnly
                      className="bg-gray-50"
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
                  {container.basePrice !== undefined && container.basePrice > 0 && (
                    <div>
                      <Label>{t("admin.orders.form.basePrice")} (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={container.basePrice}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  )}
                  <div>
                    <Label>{t("admin.orders.form.articlePrice")} (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={container.articlePrice}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded">
                  <div className="text-sm font-medium">{t("admin.orders.form.containerTotal")}: €{(container.cartonPrice + (container.basePrice || 0) + (container.articleQuantity * container.articlePrice)).toFixed(2)}</div>
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
              <div className="border-t pt-1 mt-2 flex justify-between font-medium">
                <span>{t("admin.orders.form.orderTotal")}:</span>
                <span>€{getTotalPrice().toFixed(2)}</span>
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
        orderDescriptionData={templateData || undefined}
      />

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
          <TimeOnlyInput
            value={startTimeOnly}
            onChange={setStartTimeOnly}
          />
        </div>
        <div>
          <Label htmlFor="endTime">{t("admin.orders.form.endDateTime")}</Label>
          <TimeOnlyInput
            value={endTimeOnly}
            onChange={setEndTimeOnly}
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
        <Label>{t("teamLeader.orders.assignTeamMembers")}</Label>
        <div className="text-sm text-muted-foreground mb-2">
          {t("admin.orders.form.employeesSelected", { selected: (formData.assignedEmployeeIds || []).length })}
        </div>
        <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
          {employees.map((employee) => (
            <div key={employee.id} className="flex items-center space-x-2">
              <Checkbox
                id={`employee-${employee.id}`}
                checked={(formData.assignedEmployeeIds || []).includes(employee.id)}
                onCheckedChange={(checked) => handleEmployeeToggle(employee.id, checked as boolean)}
              />
              <Label htmlFor={`employee-${employee.id}`} className="text-sm">
                {employee.firstName} {employee.lastName} ({employee.employeeCode})
              </Label>
            </div>
          ))}
          {employees.length === 0 && (
            <p className="text-sm text-gray-500">{t("teamLeader.orders.noTeamMembersAvailable")}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="specialInstructions">{t("admin.orders.form.specialInstructions")}</Label>
        <Textarea
          id="specialInstructions"
          value={formData.specialInstructions}
          onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
          rows={3}
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-green-800">{t("admin.orders.form.orderTotal")}:</span>
          <span className="text-2xl font-bold text-green-600">€{getTotalPrice().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("admin.orders.form.editOrder")}</DialogTitle>
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && <div className={`w-8 h-0.5 ${currentStep > step ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t("common.previous")}
            </Button>
            
            {currentStep < 4 ? (
              <Button type="button" onClick={handleNext} disabled={loading}>
                {t("common.next")}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? t("admin.orders.form.updating") : t("admin.orders.form.updateOrder")}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;
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
import { CreateOrderData, OrderStatus } from "@/types/order";
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

interface AddOrderDialogProps {
  trigger: React.ReactNode;
  onOrderCreated?: () => void;
}

const AddOrderDialog: React.FC<AddOrderDialogProps> = ({
  trigger,
  onOrderCreated,
}) => {
  const { t, ready } = useTranslation();
  const { data: session } = useSession();

  if (!ready) {
    return null;
  }

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [activityPricingSelections, setActivityPricingSelections] = useState<Record<string, string>>({});
  const [templateData, setTemplateData] = useState<Record<string, string> | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);

  const [formData, setFormData] = useState<CreateOrderData>({
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

  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchEmployees();
    }
  }, [open]);

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

  const fetchActivities = async () => {
    if (!formData.customerId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pricing/customers/${formData.customerId}/activities`, {
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
        } else {
          setActivities([]);
        }
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error(t("activities.messages.loadError"));
    }
  };

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
      fetchActivities();
      setSelectedActivities([]);
    }
  }, [formData.customerId, customers]);

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
      duration: null,
      location: "",
      requiredEmployees: 1,
      priority: 1,
      specialInstructions: "",
      status: OrderStatus.DRAFT,
      customerId: "",
      assignedEmployeeIds: [],
    });
    setStartTimeOnly("09:00");
    setEndTimeOnly("");
    setSelectedActivities([]);
    setActivityPricingSelections({});
    setTemplateData(null);
    setContainers([]);
    setCurrentStep(1);
  };

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
          const selectedPricingType = activityPricingSelections[activityId] || (activity?.pricingTypes?.[0] ?? null);
          return {
            activityId,
            quantity: containers.reduce((sum, c) => sum + c.cartonQuantity, 0),
            articleBasePrice: Number(activity?.articleBasePrice) || 0,
            basePrice: Number(activity?.basePrice) || 0,
            selectedPricingType,
            hourlyRate: Number(activity?.hourlyRate) || 0,
            perPiecePrice: Number(activity?.perPiecePrice) || 0,
            perArticlePrice: Number(activity?.perArticlePrice) || 0,
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Order creation failed:", response.status, errorText);
        throw new Error(`Failed to create order: ${response.status}`);
      }

      const result = await response.json();
      console.log("Order created successfully:", result);
      
      setOpen(false);
      resetFormData();
      toast.success(t("admin.orders.form.createSuccess"));
      onOrderCreated?.();
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(t("admin.orders.form.createError"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateOrderData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    setFormData((prev) => {
      const currentAssigned = prev.assignedEmployeeIds || [];

      if (checked) {
        const employeeExists = employees.some(emp => emp.id === employeeId);
        if (!employeeExists) {
          toast.error(t("admin.orders.form.employeeNotAvailable"));
          return prev;
        }
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
    setSelectedActivities(prev =>
      checked ? [...prev, activityId] : prev.filter(id => id !== activityId)
    );
    if (checked) {
      const activity = activities.find(a => a.id === activityId);
      if (activity?.pricingTypes?.length > 0) {
        setActivityPricingSelections(prev => ({ ...prev, [activityId]: activity.pricingTypes[0] }));
      }
    } else {
      setActivityPricingSelections(prev => { const next = { ...prev }; delete next[activityId]; return next; });
    }
  };

  const getPricingTypeLabel = (pt: string) => {
    const labels: Record<string, string> = {
      HOURLY: t('activities.pricingTypes.HOURLY'),
      PER_PIECE: t('activities.pricingTypes.PER_PIECE'),
      PER_CARTON: t('activities.pricingTypes.PER_CARTON'),
      PER_ARTICLE: t('activities.pricingTypes.PER_ARTICLE'),
    };
    return labels[pt] || pt;
  };

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
        <div className="max-h-72 overflow-y-auto border rounded-md p-3 space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`activity-${activity.id}`}
                  checked={selectedActivities.includes(activity.id)}
                  onCheckedChange={(checked) => handleActivityToggle(activity.id, checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor={`activity-${activity.id}`} className="text-sm font-medium cursor-pointer">
                    {activity.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.orders.form.activityType")}: {activity.type?.replace(/_/g, ' ')} | {t("admin.orders.form.activityUnit")}: {activity.unit}
                  </p>
                  {activity.pricingTypes && activity.pricingTypes.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("activities.form.pricingTypes")}: {activity.pricingTypes.map((pt: string) => getPricingTypeLabel(pt)).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              {selectedActivities.includes(activity.id) && activity.pricingTypes && activity.pricingTypes.length > 0 && (
                <div className="ml-6">
                  <Label className="text-xs">{t("admin.orders.form.selectPricingType")}</Label>
                  <Select
                    value={activityPricingSelections[activity.id] || activity.pricingTypes[0]}
                    onValueChange={(val) => setActivityPricingSelections(prev => ({ ...prev, [activity.id]: val }))}
                  >
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activity.pricingTypes.map((pt: string) => (
                        <SelectItem key={pt} value={pt} className="text-xs">
                          {getPricingTypeLabel(pt)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(() => {
                    const selectedPt = activityPricingSelections[activity.id] || activity.pricingTypes[0];
                    if (selectedPt === 'HOURLY') return <p className="text-xs text-muted-foreground mt-1">{t("activities.form.hourlyRate")}: €{Number(activity.hourlyRate || 0).toFixed(2)}/h</p>;
                    if (selectedPt === 'PER_PIECE') return <p className="text-xs text-muted-foreground mt-1">{t("activities.form.perPiecePrice")}: €{Number(activity.perPiecePrice || 0).toFixed(2)}</p>;
                    if (selectedPt === 'PER_CARTON' && activity.customerPrices?.length > 0) return (
                      <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                        {activity.customerPrices.map((price: any, idx: number) => (
                          <div key={idx} className="bg-muted/50 px-2 py-1 rounded">{price.minQuantity}-{price.maxQuantity}: €{Number(price.price).toFixed(2)}</div>
                        ))}
                      </div>
                    );
                    if (selectedPt === 'PER_ARTICLE') return <p className="text-xs text-muted-foreground mt-1">{t("activities.form.perArticlePrice")}: €{Number(activity.perArticlePrice || 0).toFixed(2)}</p>;
                    return null;
                  })()}
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
      const newContainer: Container = {
        serialNumber: `CONT-${Date.now()}`,
        cartonQuantity: 1,
        articleQuantity: 1,
        cartonPrice: 0,
        articlePrice: 0,
      };
      setContainers([...containers, newContainer]);
    };

    const updateContainer = (index: number, field: keyof Container, value: any) => {
      const updated = [...containers];
      updated[index] = { ...updated[index], [field]: value };
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
                      className="[&::-webkit-outer-spin-button]:opacity-0 hover:[&::-webkit-outer-spin-button]:opacity-100 focus:[&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-0 hover:[&::-webkit-inner-spin-button]:opacity-100 focus:[&::-webkit-inner-spin-button]:opacity-100"
                    />
                  </div>
                  <div>
                    <Label>{t("admin.orders.form.articleQuantity")}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={container.articleQuantity}
                      onChange={(e) => updateContainer(containerIndex, 'articleQuantity', parseInt(e.target.value) || 1)}
                      className="[&::-webkit-outer-spin-button]:opacity-0 hover:[&::-webkit-outer-spin-button]:opacity-100 focus:[&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:opacity-0 hover:[&::-webkit-inner-spin-button]:opacity-100 focus:[&::-webkit-inner-spin-button]:opacity-100"
                    />
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

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">{t("admin.orders.form.step4Title")}</h3>
        <p className="text-sm text-muted-foreground">{t("admin.orders.form.step4Description")}</p>
      </div>

      <OrderDescriptionForm
        customerId={formData.customerId}
        description={formData.description || ""}
        onDescriptionChange={(description) => handleInputChange("description", description)}
        onTemplateDataChange={setTemplateData}
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
            placeholder={t("admin.orders.form.locationPlaceholder")}
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
          <Label htmlFor="endTime">{t("admin.orders.form.endDateTime")} ({t("admin.orders.form.optional")})</Label>
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
            <p className="text-sm text-gray-500">{t("teamLeader.orders.noTeamMembersAvailable")}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="specialInstructions">{t("admin.orders.form.specialInstructions")}</Label>
        <Textarea
          id="specialInstructions"
          value={formData.specialInstructions}
          onChange={(e) =>
            handleInputChange("specialInstructions", e.target.value)
          }
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
          <DialogTitle>{t("admin.orders.form.addNewOrder")}</DialogTitle>
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && <div className={`w-8 h-0.5 ${
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
              {t("admin.orders.form.previous")}
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
                {t("admin.orders.form.cancel")}
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={handleNext}>
                  {t("admin.orders.form.next")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} form="order-form">
                  {loading ? t("admin.orders.form.creating") : t("admin.orders.form.createOrder")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrderDialog;
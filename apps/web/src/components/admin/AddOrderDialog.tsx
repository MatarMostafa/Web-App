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
import { useOrderStore } from "@/store/orderStore";
import { useEmployeeStore } from "@/store/employeeStore";
import { useCustomerStore } from "@/store/customerStore";
import { CreateOrderData, OrderStatus } from "@/types/order";
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
}

interface AddOrderDialogProps {
  trigger: React.ReactNode;
}

const AddOrderDialog: React.FC<AddOrderDialogProps> = ({ trigger }) => {
  const { t, ready } = useTranslation();
  const { data: session } = useSession();

  if (!ready) {
    return null;
  }
  const { createOrder } = useOrderStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [templateData, setTemplateData] = useState<Record<string, string> | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);
  const [cartonQuantity, setCartonQuantity] = useState<number>(0);
  const [articleQuantity, setArticleQuantity] = useState<number>(0);

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
      fetchEmployees();
      fetchCustomers();
    }
  }, [open, fetchEmployees, fetchCustomers]);

  const fetchActivities = async () => {
    if (!formData.customerId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pricing/customers/${formData.customerId}/activities`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        const jsonResponse = await response.json();
        // Handle wrapped response { success: true, data: [...] } or direct array
        const data = jsonResponse.data || jsonResponse;

        if (Array.isArray(data)) {
          const processedActivities = data.map((activity: any) => {
            // Map 'prices' to 'customerPrices' and calculate lowest price
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

  // Auto-fill location and fetch activities when customer is selected
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
    setTemplateData(null);
    setContainers([]);
    setCartonQuantity(0);
    setArticleQuantity(0);
    setCurrentStep(1);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
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

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = t("admin.orders.form.customerRequired");
    if (!formData.scheduledDate) newErrors.scheduledDate = t("admin.orders.form.scheduledDateRequired");
    if (!formData.priority || formData.priority < 1) newErrors.priority = t("admin.orders.form.priorityRequired");
    if (containers.length === 0) newErrors.containers = "At least one container is required";

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
            basePrice: Number(activity?.basePrice) || 0
          };
        }),
        containers,
        cartonQuantity: containers.reduce((sum, c) => sum + c.cartonQuantity, 0),
        articleQuantity: containers.reduce((sum, c) => sum + c.articleQuantity, 0),
        templateData: templateData
      };

      console.log('Submitting order with containers:', containers); // Debug log

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

      const newOrder = await createOrder(submitData);
      setOpen(false);
      resetFormData();
      toast.success("Order created successfully");
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
          toast.error("Employee not available");
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
    setSelectedActivities(prev => {
      const newActivities = checked
        ? [...prev, activityId]
        : prev.filter(id => id !== activityId);
      
      // Update carton prices for all containers when activities change
      setTimeout(() => {
        setContainers(currentContainers => 
          currentContainers.map(container => ({
            ...container,
            cartonPrice: calculateCartonPriceForQuantity(container.cartonQuantity)
          }))
        );
      }, 0);
      
      return newActivities;
    });
  };

  const getActivityAndBasePrices = () => {
    const totalCartons = containers.reduce((sum, c) => sum + c.cartonQuantity, 0);
    if (totalCartons === 0) return 0;

    const activityPrices = selectedActivities.reduce((total, activityId) => {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return total;

      // Find price based on total carton quantity range
      if (activity.customerPrices && activity.customerPrices.length > 0) {
        const applicablePrice = activity.customerPrices.find((p: any) =>
          totalCartons >= p.minQuantity && totalCartons <= p.maxQuantity
        );
        if (applicablePrice) {
          return total + Number(applicablePrice.price);
        }
      }

      return total + (Number(activity.unitPrice) || 0);
    }, 0);

    const basePrices = selectedActivities.reduce((total, activityId) => {
      const activity = activities.find(a => a.id === activityId);
      return total + (Number(activity?.basePrice) || 0);
    }, 0);

    return activityPrices + basePrices;
  };

  const getContainerPrices = () => {
    return containers.reduce((sum, c) => {
      const articleTotal = c.articleQuantity * c.articlePrice;
      return sum + articleTotal;
    }, 0);
  };

  const getTotalPrice = () => {
    return getActivityAndBasePrices() + getContainerPrices();
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Step 1: Select Customer</h3>
        <p className="text-sm text-muted-foreground">Choose the customer for this order</p>
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
        <h3 className="text-lg font-semibold">Step 2: Select Activities</h3>
        <p className="text-sm text-muted-foreground">Choose activities for this order</p>
      </div>
      <div>
        <Label>Activities</Label>
        <div className="text-sm text-muted-foreground mb-2">
          {selectedActivities.length} activities selected
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
                      Type: {activity.type?.replace('_', ' ')} | Unit: {activity.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    Base: €{Number(activity.basePrice || 0).toFixed(2)}
                  </div>
                </div>
              </div>
              {activity.customerPrices && activity.customerPrices.length > 0 ? (
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
            <p className="text-sm text-gray-500">No activities available for this customer</p>
          )}
        </div>
      </div>
    </div>
  );

  const calculateCartonPriceForQuantity = (cartonQuantity: number) => {
    return selectedActivities.reduce((total, activityId) => {
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
      // Calculate default article price from selected activities' base prices
      const defaultArticlePrice = selectedActivities.reduce((total, activityId) => {
        const activity = activities.find(a => a.id === activityId);
        return total + (Number(activity?.basePrice) || 0);
      }, 0);

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
          <h3 className="text-lg font-semibold">Step 3: Container Management</h3>
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
                    <Label>Carton Price (€) - Auto-calculated</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={container.cartonPrice}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on selected activities and quantity
                    </p>
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
                  <div>
                    <Label>Article Price (€) - From Activity Base Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={container.articlePrice}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on selected activities' base prices
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded">
                  <div className="text-sm font-medium">Container Total: €{(container.cartonPrice + (container.articleQuantity * container.articlePrice)).toFixed(2)}</div>
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
                <span>Container Total:</span>
                <span>€{containers.reduce((sum, c) => sum + c.cartonPrice + (c.articleQuantity * c.articlePrice), 0).toFixed(2)}</span>
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
        <h3 className="text-lg font-semibold">Step 4: Order Details</h3>
        <p className="text-sm text-muted-foreground">Complete the order information</p>
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
          <Label htmlFor="endTime">{t("admin.orders.form.endDateTime")} (Optional)</Label>
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
        <Label>{t("admin.orders.form.assignEmployees")}</Label>
        <div className="text-sm text-muted-foreground mb-2">
          {`${(formData.assignedEmployeeIds || []).length} employees selected`}
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
            <p className="text-sm text-gray-500">{t("admin.orders.form.noEmployeesAvailable")}</p>
          )}
        </div>
      </div>

      {/* Order Total Display */}
      {(selectedActivities.length > 0 || containers.length > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-green-800">Order Total:</span>
            <span className="text-2xl font-bold text-green-600">€{getTotalPrice().toFixed(2)}</span>
          </div>
          <div className="mt-2 text-sm text-green-700">
            <div className="flex justify-between">
              <span>Activities & Carton Price:</span>
              <span>€{getActivityAndBasePrices().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Articles Total Price:</span>
              <span>€{getContainerPrices().toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
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
                onClick={() => {
                  resetFormData();
                  setOpen(false);
                }}
              >
                Cancel
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} form="order-form">
                  {loading ? "Creating..." : "Create Order"}
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

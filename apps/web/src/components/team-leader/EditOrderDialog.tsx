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
  pieceQuantity: number;
  cartonPrice: number;
  piecePrice: number;
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
  pieceQuantity?: number;
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
  const [pieceEntries, setPieceEntries] = useState<Array<{ activityId: string; quantity: number; notes: string }>>([]);
  const [hourEntries, setHourEntries] = useState<Array<{ activityId: string; quantity: number; notes: string }>>([]);
  const [activityPricingSelections, setActivityPricingSelections] = useState<Record<string, string>>({});
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);

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
      fetchCurrentEmployee();
      loadOrderData();
    }
  }, [order, open]);

  const fetchCurrentEmployee = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees/me`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentEmployeeId(data.id);
      }
    } catch (error) {
      console.error("Error fetching current employee profile:", error);
    }
  };

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

      const newPricingSelections: Record<string, string> = {};
      const loadedPieceEntries: any[] = [];
      const loadedHourEntries: any[] = [];

      // Extract details from order.customerActivities if available
      const existingActivities = (order as any).customerActivities || [];
      existingActivities.forEach((a: any) => {
        if (a.selectedPricingType) {
          newPricingSelections[a.activityId || a.id] = a.selectedPricingType;
        }
        if (a.selectedPricingType === 'PER_PIECE') {
          loadedPieceEntries.push({ activityId: a.activityId || a.id, quantity: a.quantity ? Number(a.quantity) : 1, notes: a.notes || '' });
        } else if (a.selectedPricingType === 'HOURLY') {
          loadedHourEntries.push({ activityId: a.activityId || a.id, quantity: a.quantity ? Number(a.quantity) : 1, notes: a.notes || '' });
        }
      });
      setActivityPricingSelections(newPricingSelections);
      setPieceEntries(loadedPieceEntries);
      setHourEntries(loadedHourEntries);

      setContainers(loadedContainers);
    } catch (error) {
      console.error("Error loading order data:", error);
    } finally {
      setLoading(false);
    }
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
    if (currentStep === 3) {
      const hasCartonOrArticle = Object.values(activityPricingSelections).some(
        pt => pt === 'PER_CARTON' || pt === 'PER_ARTICLE'
      );
      if (hasCartonOrArticle && containers.length === 0) {
        toast.error(t("admin.orders.form.containerRequired"));
        return;
      }
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
    const hasCartonOrArticle = Object.values(activityPricingSelections).some(
      pt => pt === 'PER_CARTON' || pt === 'PER_ARTICLE'
    );
    if (hasCartonOrArticle && containers.length === 0) {
      newErrors.containers = t("admin.orders.form.containerRequired");
    }

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
          
          let quantity = 1;
          let notes = "";
          
          if (selectedPricingType === 'PER_CARTON') {
            quantity = containers.reduce((sum, c) => sum + c.cartonQuantity, 0);
          } else if (selectedPricingType === 'PER_ARTICLE') {
            quantity = containers.reduce((sum, c) => sum + c.articleQuantity, 0);
          } else if (selectedPricingType === 'PER_PIECE') {
            const entry = pieceEntries.find(e => e.activityId === activityId);
            quantity = entry?.quantity || 1;
            notes = entry?.notes || "";
          } else if (selectedPricingType === 'HOURLY') {
            const entry = hourEntries.find(e => e.activityId === activityId);
            quantity = entry?.quantity || 1;
            notes = entry?.notes || "";
          }
          
          return {
            activityId,
            quantity,
            notes,
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
        pieceQuantity: containers.reduce((sum, c) => sum + c.pieceQuantity, 0),
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
    setSelectedActivities(prev =>
      checked ? [...prev, activityId] : prev.filter(id => id !== activityId)
    );
    if (checked) {
      const activity = activities.find(a => a.id === activityId);
      if (activity?.pricingTypes?.length > 0) {
        setActivityPricingSelections(prev => ({ ...prev, [activityId]: activity.pricingTypes[0] }));
      }
      setPieceEntries(prev => [...prev, { activityId, quantity: 1, notes: '' }]);
      setHourEntries(prev => [...prev, { activityId, quantity: 1, notes: '' }]);
    } else {
      setActivityPricingSelections(prev => { const next = { ...prev }; delete next[activityId]; return next; });
      setPieceEntries(prev => prev.filter(e => e.activityId !== activityId));
      setHourEntries(prev => prev.filter(e => e.activityId !== activityId));
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
                    if (selectedPt === 'HOURLY') {
                      const entry = hourEntries.find(e => e.activityId === activity.id) || { quantity: 1, notes: '' };
                      return (
                        <div className="mt-3 p-3 bg-muted/30 rounded-md border border-muted space-y-3">
                          <p className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                            <span>{t("activities.form.hourlyRate")}: €{Number(activity.hourlyRate || 0).toFixed(2)}/h</span>
                          </p>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs">{t("admin.orders.form.estimatedHours")}</Label>
                              <Input 
                                type="number" 
                                min="0.5" 
                                step="0.5" 
                                value={entry.quantity}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setHourEntries(prev => prev.map(p => p.activityId === activity.id ? { ...p, quantity: val } : p));
                                }}
                                className="h-8 text-xs mt-1" 
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{t("admin.orders.form.notesOptional")}</Label>
                              <Input 
                                value={entry.notes}
                                onChange={(e) => {
                                  setHourEntries(prev => prev.map(p => p.activityId === activity.id ? { ...p, notes: e.target.value } : p));
                                }}
                                placeholder={t("admin.orders.form.notesPlaceholder")}
                                className="h-8 text-xs mt-1" 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }
                    if (selectedPt === 'PER_PIECE') {
                      const entry = pieceEntries.find(e => e.activityId === activity.id) || { quantity: 1, notes: '' };
                      return (
                        <div className="mt-3 p-3 bg-muted/30 rounded-md border border-muted space-y-3">
                          <p className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                            <span>{t("activities.form.perPiecePrice")}: €{Number(activity.perPiecePrice || 0).toFixed(2)}</span>
                          </p>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs">{t("admin.orders.form.quantity")}</Label>
                              <Input 
                                type="number" 
                                min="1" 
                                value={entry.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 1;
                                  setPieceEntries(prev => prev.map(p => p.activityId === activity.id ? { ...p, quantity: val } : p));
                                }}
                                className="h-8 text-xs mt-1" 
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{t("admin.orders.form.notesOptional")}</Label>
                              <Input 
                                value={entry.notes}
                                onChange={(e) => {
                                  setPieceEntries(prev => prev.map(p => p.activityId === activity.id ? { ...p, notes: e.target.value } : p));
                                }}
                                placeholder={t("admin.orders.form.notesPlaceholder")}
                                className="h-8 text-xs mt-1" 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }
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
        articleQuantity: 0,
        pieceQuantity: 0,
        cartonPrice: 0,
        piecePrice: 0,
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
                    />
                  </div>
                  <div>
                    <Label>{t("admin.orders.form.articleQuantity")}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={container.articleQuantity}
                      onChange={(e) => updateContainer(containerIndex, 'articleQuantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>{t("admin.orders.form.pieceQuantity")}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={container.pieceQuantity}
                      onChange={(e) => updateContainer(containerIndex, 'pieceQuantity', parseInt(e.target.value) || 0)}
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
          {employees
            .filter((employee) => employee.id !== currentEmployeeId)
            .map((employee) => (
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
          {employees.filter((e) => e.id !== currentEmployeeId).length === 0 && (
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
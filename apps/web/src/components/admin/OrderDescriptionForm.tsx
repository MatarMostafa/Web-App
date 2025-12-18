import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui";
import { Input } from "@/components/ui";
import { Textarea } from "@/components/ui";
import { Checkbox } from "@/components/ui";
import { Button } from "@/components/ui";
import { FileText, Save, Edit3 } from "lucide-react";
import { useTemplateStore } from "@/store/templateStore";

import { useTranslation } from "@/hooks/useTranslation";

interface OrderDescriptionFormProps {
  customerId: string;
  description: string;
  onDescriptionChange: (description: string) => void;
  onTemplateDataChange: (templateData: Record<string, string> | null) => void;
  // Optional props for employee editing
  editableForEmployee?: boolean;
  orderId?: string;
  orderDescriptionData?: Record<string, string> | null;
  onTemplateSaved?: (savedData: Record<string, string>) => void;
}

const OrderDescriptionForm: React.FC<OrderDescriptionFormProps> = ({
  customerId,
  description,
  onDescriptionChange,
  onTemplateDataChange,
  editableForEmployee = false,
  orderId,
  orderDescriptionData,
  onTemplateSaved
}) => {
  const { t } = useTranslation();
  
  // Fallback function for missing translations
  const getText = (key: string, fallback: string) => {
    try {
      return t(key) || fallback;
    } catch {
      return fallback;
    }
  };
  const { customerTemplate, loading, fetchCustomerTemplate } = useTemplateStore();
  const [useCustomDescription, setUseCustomDescription] = useState(false);
  const [templateData, setTemplateData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { createOrderDescriptionData, updateOrderDescriptionData } = useTemplateStore();

  useEffect(() => {
    if (customerId && customerId.trim() !== '') {
      
      setIsLoading(true);
      fetchCustomerTemplate(customerId).finally(() => {
        setIsLoading(false);
      });
    } else {
      
      setIsLoading(false);
    }
  }, [customerId, fetchCustomerTemplate]);

  useEffect(() => {
    console.log('OrderDescriptionForm: Template state changed:', { customerTemplate, customerId });
  }, [customerTemplate, customerId]);

  useEffect(() => {
    // Only notify parent about using template when NOT in employee-editable mode
    if (editableForEmployee) return;

    if (customerTemplate && !useCustomDescription) {
      // For order creation, just indicate template will be used but don't create empty data
      onTemplateDataChange({});
    } else {
      onTemplateDataChange(null);
    }
  }, [customerTemplate, useCustomDescription, onTemplateDataChange, editableForEmployee]);

  // Initialize templateData from orderDescriptionData when provided (employee view)
  useEffect(() => {
    if (orderDescriptionData) {
      setTemplateData(orderDescriptionData || {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDescriptionData]);

  // Remove template field change handler since fields are read-only during creation

  const handleCustomDescriptionToggle = (checked: boolean) => {
    setUseCustomDescription(checked);
    if (checked) {
      onTemplateDataChange(null);
    } else if (customerTemplate) {
      const initialData: Record<string, string> = {};
      customerTemplate.templateLines.forEach(line => {
        initialData[line] = templateData[line] || "";
      });
      setTemplateData(initialData);
      onTemplateDataChange(initialData);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setTemplateData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveForEmployee = async () => {
    if (!editableForEmployee || !orderId) return;
    try {
      if (orderDescriptionData) {
        await updateOrderDescriptionData(orderId, templateData);
      } else {
        await createOrderDescriptionData(orderId, templateData);
      }
      onTemplateSaved?.(templateData);
      // also update formatted description shown in parent
      const formattedDescription = Object.entries(templateData)
        .filter(([_, value]) => value.trim() !== "")
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      onDescriptionChange(formattedDescription);
    } catch (error) {
      // errors handled in store
    }
  };

  // Employee editing state: when saved, become read-only; pencil to re-edit
  const [isEditing, setIsEditing] = useState<boolean>(editableForEmployee ? true : false);

  useEffect(() => {
    // If orderDescriptionData updates from parent, reflect it and make editable
    if (editableForEmployee) {
      setTemplateData(orderDescriptionData || {});
      // if there's existing data, default to not editing (view mode)
      if (orderDescriptionData && Object.keys(orderDescriptionData).length > 0) {
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDescriptionData]);

  const handleCancelForEmployee = () => {
    if (orderDescriptionData) {
      setTemplateData(orderDescriptionData);
    } else if (customerTemplate) {
      const initialData: Record<string, string> = {};
      customerTemplate.templateLines.forEach(line => {
        initialData[line] = "";
      });
      setTemplateData(initialData);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div>
        <Label>{getText("order.description", "Description")}</Label>
        <div className="p-4 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">{getText("admin.customerDetails.template.loading", "Loading template...")}</p>
        </div>
      </div>
    );
  }

  // If no customer selected or no template exists, show regular description
  if (!customerId || customerId.trim() === '' || !customerTemplate) {
    console.log('OrderDescriptionForm: Showing regular description. CustomerId:', `"${customerId}"`, 'Template:', customerTemplate);
    return (
      <div>
        <Label htmlFor="description">{getText("order.description", "Description")}</Label>
        <Textarea
          id="description"
          value={description||""}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          placeholder={getText("order.descriptionPlaceholder", "Enter order description...")}
        />
        {customerId && customerId.trim() !== '' && !customerTemplate && (
          <p className="text-xs text-muted-foreground mt-1">
            No template found for this customer
          </p>
        )}
      </div>
    );
  }

  // Show template-based form
  console.log('OrderDescriptionForm: Showing template form with lines:', customerTemplate.templateLines);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {getText("order.description", "Order Description")}
        </Label>
        {/* Only show the admin checkbox toggle when not in employee-editable mode */}
        {!editableForEmployee && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useCustomDescription"
              checked={useCustomDescription}
              onCheckedChange={handleCustomDescriptionToggle}
            />
            <Label htmlFor="useCustomDescription" className="text-sm">
              {getText("admin.customerDetails.template.useCustomDescription", "Use custom description instead")}
            </Label>
          </div>
        )}
        {editableForEmployee && (
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />Edit
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {useCustomDescription && !editableForEmployee ? (
        <Textarea
          value={description||""}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          placeholder={getText("admin.customerDetails.template.customDescriptionPlaceholder", "Enter custom order description...")}
        />
      ) : (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground mb-3">
            {getText("admin.customerDetails.template.templateSelected", "Template selected - employees will fill these fields:")}
          </p>
          {customerTemplate.templateLines.map((field, index) => (
            <div key={index} className="space-y-1">
              <Label className="text-sm font-medium">{field}</Label>
              {editableForEmployee ? (
                isEditing ? (
                  <Input
                    value={templateData[field] || ""}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    placeholder={getText("admin.customerDetails.template.employeeWillFill", "Employee will fill this field")}
                  />
                ) : (
                  <div className="min-h-[40px] p-3 bg-muted rounded-md">
                    <p className="text-sm">{templateData[field] || <span className="text-muted-foreground">{getText("template.notSpecified", "Not specified")}</span>}</p>
                  </div>
                )
              ) : (
                <Input
                  value={templateData[field] || ""}
                  disabled
                  placeholder={getText("admin.customerDetails.template.employeeWillFill", "Employee will fill this field")}
                  className="bg-muted text-muted-foreground"
                />
              )}
            </div>
          ))}

          {editableForEmployee && isEditing && (
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={async () => { await handleSaveForEmployee(); setIsEditing(false); }} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {getText("common.save", "Save")}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancelForEmployee}>
                {getText("common.cancel", "Cancel")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDescriptionForm;
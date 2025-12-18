import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Textarea } from "@/components/ui";
import { FileText, Save, Edit3 } from "lucide-react";
import { useTemplateStore } from "@/store/templateStore";
import { useTranslation } from "@/hooks/useTranslation";

interface OrderDescriptionTemplateProps {
  orderId: string;
  customerId: string;
  currentDescription?: string;
  usesTemplate: boolean;
  onDescriptionUpdate?: (description: string) => void;
}

const OrderDescriptionTemplate: React.FC<OrderDescriptionTemplateProps> = ({
  orderId,
  customerId,
  currentDescription,
  usesTemplate,
  onDescriptionUpdate
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
  const {
    customerTemplate,
    orderDescriptionData,
    loading,
    fetchCustomerTemplate,
    fetchOrderDescriptionData,
    createOrderDescriptionData,
    updateOrderDescriptionData
  } = useTemplateStore();

  const [templateData, setTemplateData] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [fallbackDescription, setFallbackDescription] = useState(currentDescription || "");

  useEffect(() => {
    if (customerId) {
      fetchCustomerTemplate(customerId);
    }
    if (orderId) {
      fetchOrderDescriptionData(orderId);
    }
  }, [customerId, orderId, fetchCustomerTemplate, fetchOrderDescriptionData]);

  useEffect(() => {
    if (orderDescriptionData) {
      setTemplateData(orderDescriptionData.descriptionData);
    } else if (customerTemplate) {
      // Initialize empty template data
      const initialData: Record<string, string> = {};
      customerTemplate.templateLines.forEach(line => {
        initialData[line] = "";
      });
      setTemplateData(initialData);
    }
  }, [orderDescriptionData, customerTemplate]);

  const handleFieldChange = (field: string, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (orderDescriptionData) {
        await updateOrderDescriptionData(orderId, templateData);
      } else {
        await createOrderDescriptionData(orderId, templateData);
      }
      setIsEditing(false);
      
      // Generate formatted description for display
      const formattedDescription = Object.entries(templateData)
        .filter(([_, value]) => value.trim() !== "")
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      
      onDescriptionUpdate?.(formattedDescription);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleCancel = () => {
    if (orderDescriptionData) {
      setTemplateData(orderDescriptionData.descriptionData);
    } else if (customerTemplate) {
      const initialData: Record<string, string> = {};
      customerTemplate.templateLines.forEach(line => {
        initialData[line] = "";
      });
      setTemplateData(initialData);
    }
    setIsEditing(false);
  };

  const handleFallbackSave = () => {
    onDescriptionUpdate?.(fallbackDescription);
    setIsEditing(false);
  };

  // If customer has no template, show regular description textarea
  if (!customerTemplate) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {getText("order.description", "Order Description")}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? getText("common.cancel", "Cancel") : getText("common.edit", "Edit")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={fallbackDescription}
                onChange={(e) => setFallbackDescription(e.target.value)}
                placeholder={getText("order.descriptionPlaceholder", "Enter order description...")}
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleFallbackSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {getText("common.save", "Save")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setFallbackDescription(currentDescription || "");
                    setIsEditing(false);
                  }}
                >
                  {getText("common.cancel", "Cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {currentDescription ? (
                <p className="text-sm whitespace-pre-wrap">{currentDescription}</p>
              ) : (
                <p className="text-sm text-muted-foreground">{getText("order.noDescription", "No description provided")}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show template-based description
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Order Description
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customerTemplate.templateLines.map((field, index) => (
            <div key={index} className="space-y-2">
              <Label className="text-sm font-medium">{field}</Label>
              {isEditing ? (
                <Input
                  value={templateData[field] || ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  placeholder={getText("template.fieldPlaceholder", `Enter ${field.toLowerCase()}...`)}
                />
              ) : (
                <div className="min-h-[40px] p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    {templateData[field] || (
                      <span className="text-muted-foreground">{getText("template.notSpecified", "Not specified")}</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}

          {isEditing && (
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSave} disabled={loading} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {loading ? getText("common.saving", "Saving...") : getText("common.saveChanges", "Save Changes")}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                {getText("common.cancel", "Cancel")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDescriptionTemplate;
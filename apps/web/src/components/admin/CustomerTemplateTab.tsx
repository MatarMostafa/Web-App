import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { FileText, Plus, Trash2, Eye } from "lucide-react";
import { useTemplateStore } from "@/store/templateStore";
import { useTranslation } from "@/hooks/useTranslation";

interface CustomerTemplateTabProps {
  customerId: string;
}

const CustomerTemplateTab: React.FC<CustomerTemplateTabProps> = ({ customerId }) => {
  const { t } = useTranslation();
  const {
    customerTemplate,
    loading,
    fetchCustomerTemplate,
    createCustomerTemplate,
    updateCustomerTemplate,
    deleteCustomerTemplate
  } = useTemplateStore();

  const [templateLines, setTemplateLines] = useState<string[]>([""]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchCustomerTemplate(customerId);
    }
  }, [customerId, fetchCustomerTemplate]);

  useEffect(() => {
    if (customerTemplate) {
      setTemplateLines(customerTemplate.templateLines);
      setIsEditing(false);
    } else {
      setTemplateLines([""]);
      setIsEditing(false);
    }
  }, [customerTemplate]);

  const handleAddLine = () => {
    setTemplateLines([...templateLines, ""]);
  };

  const handleRemoveLine = (index: number) => {
    if (templateLines.length > 1) {
      setTemplateLines(templateLines.filter((_, i) => i !== index));
    }
  };

  const handleLineChange = (index: number, value: string) => {
    const newLines = [...templateLines];
    newLines[index] = value;
    setTemplateLines(newLines);
  };

  const handleSave = async () => {
    const filteredLines = templateLines.filter(line => line.trim() !== "");

    if (filteredLines.length === 0) {
      return;
    }

    try {
      if (customerTemplate) {
        await updateCustomerTemplate(customerId, filteredLines);
      } else {
        await createCustomerTemplate(customerId, filteredLines);
      }
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleDelete = async () => {
    if (confirm(t("admin.customerDetails.template.confirmDelete"))) {
      try {
        await deleteCustomerTemplate(customerId);
        setTemplateLines([""]);
        setIsEditing(false);
      } catch (error) {
        // Error handling is done in the store
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (customerTemplate) {
      setTemplateLines(customerTemplate.templateLines);
    } else {
      setTemplateLines([""]);
    }
    setIsEditing(false);
  };

  const previewData = {
    "Container": "20ft Standard Container",
    "Goods Description": "Electronics Equipment",
    "Weight": "15000 kg",
    "Special Instructions": "Handle with care - fragile items"
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("admin.customerDetails.template.title")}
          </CardTitle>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {customerTemplate && !isEditing && (
              <>
                <Button variant="outline" onClick={handleEdit} className="flex-1 sm:flex-none">
                  {t("admin.customerDetails.template.editTemplate")}
                </Button>
                <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700 flex-1 sm:flex-none">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("admin.customerDetails.template.deleteTemplate")}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!customerTemplate && !isEditing ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">{t("admin.customerDetails.template.noTemplate")}</p>
            <p className="text-sm text-muted-foreground mb-6">
              {t("admin.customerDetails.template.noTemplateDesc")}
            </p>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.customerDetails.template.createTemplate")}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Template Editor */}
            <div className="space-y-4">
              <Label className="text-base font-medium">{t("admin.customerDetails.template.templateLines")}</Label>
              {templateLines.map((line, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Label className="min-w-[60px] text-sm text-muted-foreground">
                    {t("admin.customerDetails.template.line")} {index + 1}:
                  </Label>
                  <Input
                    value={line}
                    onChange={(e) => handleLineChange(index, e.target.value)}
                    placeholder={t("admin.customerDetails.template.fieldPlaceholder")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                  {isEditing && templateLines.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveLine(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {isEditing && (
                <Button variant="outline" onClick={handleAddLine} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("admin.customerDetails.template.addLine")}
                </Button>
              )}
            </div>

            {/* Preview Section */}
            {templateLines.some(line => line.trim() !== "") && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-4 w-4" />
                  <Label className="text-base font-medium">{t("admin.customerDetails.template.preview")}</Label>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("admin.customerDetails.template.previewDesc")}
                  </p>
                  {templateLines
                    .filter(line => line.trim() !== "")
                    .map((line, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Label className="min-w-[120px] text-sm">
                          {line.trim()}:
                        </Label>
                        <Input
                          value={previewData[line.trim() as keyof typeof previewData] || ""}
                          disabled
                          className="bg-background"
                          placeholder={t("admin.customerDetails.template.employeePlaceholder")}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleCancel} variant="outline">
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading || templateLines.every(line => line.trim() === "")}
                >
                  {loading ? t("admin.customerDetails.template.saving") : customerTemplate ? t("admin.customerDetails.template.updateTemplate") : t("admin.customerDetails.template.createTemplate")}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerTemplateTab;
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Textarea } from "@/components/ui";
import { Switch } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { useDepartmentStore } from "@/store/departmentStore";
import { Department, UpdateDepartmentData } from "@/types/department";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface EditDepartmentDialogProps {
  department: Department;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditDepartmentDialog: React.FC<EditDepartmentDialogProps> = ({
  department,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const { updateDepartment } = useDepartmentStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateDepartmentData>({});

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description || "",
        isActive: department.isActive,
      });
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDepartment(department.id, formData);
      onOpenChange(false);
    } catch (error) {
      toast.error(t("admin.departments.form.updateError"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateDepartmentData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("admin.departments.form.editDepartment")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t("admin.departments.form.departmentName")} *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="code">{t("admin.departments.form.departmentCode")} *</Label>
            <Input
              id="code"
              value={formData.code || ""}
              onChange={(e) => handleInputChange("code", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">{t("admin.departments.form.description")}</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive ?? true}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
            <Label htmlFor="isActive">{t("admin.departments.form.active")}</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("admin.departments.form.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("admin.departments.form.updating") : t("admin.departments.form.updateDepartment")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDepartmentDialog;
"use client";
import React, { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui";
import { useDepartmentStore } from "@/store/departmentStore";
import { CreateDepartmentData } from "@/types/department";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface AddDepartmentDialogProps {
  trigger: React.ReactNode;
}

const AddDepartmentDialog: React.FC<AddDepartmentDialogProps> = ({ trigger }) => {
  const { t } = useTranslation();
  const { createDepartment } = useDepartmentStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateDepartmentData & { isActive: boolean }>({
    name: "",
    code: "",
    description: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createDepartment(formData);
      setOpen(false);
      setFormData({
        name: "",
        code: "",
        description: "",
        isActive: true,
      });
    } catch (error) {
      toast.error(t("admin.departments.form.createError"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof (CreateDepartmentData & { isActive: boolean }), value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("admin.departments.form.addNewDepartment")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t("admin.departments.form.departmentName")} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="code">{t("admin.departments.form.departmentCode")} *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange("code", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">{t("admin.departments.form.description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
            <Label htmlFor="isActive">{t("admin.departments.form.active")}</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("admin.departments.form.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("admin.departments.form.creating") : t("admin.departments.form.createDepartment")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDepartmentDialog;
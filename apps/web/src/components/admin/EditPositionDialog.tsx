"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Textarea } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Switch } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { usePositionStore } from "@/store/positionStore";
import { useDepartmentStore } from "@/store/departmentStore";
import { Position, UpdatePositionData } from "@/types/position";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface EditPositionDialogProps {
  position: Position;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditPositionDialog: React.FC<EditPositionDialogProps> = ({
  position,
  open,
  onOpenChange,
}) => {
  const { t, ready } = useTranslation();
  const { updatePosition } = usePositionStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdatePositionData>({});
  
  if (!ready) {
    return null;
  }

  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open, fetchDepartments]);

  useEffect(() => {
    if (position) {
      setFormData({
        title: position.title,
        description: position.description || "",
        departmentId: position.departmentId,
        isActive: position.isActive,
      });
    }
  }, [position]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updatePosition(position.id, formData);
      onOpenChange(false);
    } catch (error) {
      toast.error(t("admin.positions.form.updateError"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdatePositionData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("admin.positions.form.editPosition")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">{t("admin.positions.form.positionTitle")} *</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="departmentId">{t("admin.positions.form.department")} *</Label>
            <Select
              value={formData.departmentId || ""}
              onValueChange={(value) => handleInputChange("departmentId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.positions.form.selectDepartment")} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">{t("admin.positions.form.description")}</Label>
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
            <Label htmlFor="isActive">{t("admin.positions.form.active")}</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("admin.positions.form.cancel")}
            </Button>
            <Button type="submit" disabled={loading || !formData.departmentId}>
              {loading ? t("admin.positions.form.updating") : t("admin.positions.form.updatePosition")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPositionDialog;
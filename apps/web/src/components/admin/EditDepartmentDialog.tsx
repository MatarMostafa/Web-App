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
      toast.error("Failed to update department");
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
          <DialogTitle>Edit Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Department Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="code">Department Code *</Label>
            <Input
              id="code"
              value={formData.code || ""}
              onChange={(e) => handleInputChange("code", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
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
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Department"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDepartmentDialog;
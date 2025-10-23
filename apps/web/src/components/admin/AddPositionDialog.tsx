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
  DialogTrigger,
} from "@/components/ui";
import { usePositionStore } from "@/store/positionStore";
import { useDepartmentStore } from "@/store/departmentStore";
import { CreatePositionData } from "@/types/position";
import toast from "react-hot-toast";

interface AddPositionDialogProps {
  trigger: React.ReactNode;
}

const AddPositionDialog: React.FC<AddPositionDialogProps> = ({ trigger }) => {
  const { createPosition } = usePositionStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePositionData & { isActive: boolean }>({
    title: "",
    description: "",
    departmentId: "",
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open, fetchDepartments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createPosition(formData);
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        departmentId: "",
        isActive: true,
      });
    } catch (error) {
      toast.error("Failed to create position");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof (CreatePositionData & { isActive: boolean }), value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Position</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Position Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="departmentId">Department *</Label>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => handleInputChange("departmentId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
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
            <Label htmlFor="description">Description</Label>
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
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.departmentId}>
              {loading ? "Creating..." : "Create Position"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPositionDialog;
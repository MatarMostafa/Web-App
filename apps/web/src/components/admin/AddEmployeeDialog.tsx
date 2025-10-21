import React, { useState } from "react";
import toast from "react-hot-toast";
import { useEmployeeStore } from "@/store/employeeStore";
import { CreateEmployeeData, WorkScheduleType } from "@/types/employee";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui";
import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";

import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils/helpers";

interface AddEmployeeDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface EmployeeFormData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  hireDate?: Date;
  departmentId: string;
  positionId: string;
  managerId?: string;
  scheduleType: WorkScheduleType;
  hourlyRate?: number;
  salary?: number;
}

const scheduleTypeOptions = [
  { value: WorkScheduleType.FULL_TIME, label: "Full Time" },
  { value: WorkScheduleType.PART_TIME, label: "Part Time" },
  { value: WorkScheduleType.CONTRACT, label: "Contract" },
  { value: WorkScheduleType.TEMPORARY, label: "Temporary" },
  { value: WorkScheduleType.INTERN, label: "Intern" },
];

export default function AddEmployeeDialog({
  trigger,
  open,
  onOpenChange,
}: AddEmployeeDialogProps) {
  const { createEmployee } = useEmployeeStore();

  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled props if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState<EmployeeFormData>({
    email: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: undefined,
    address: "",
    hireDate: new Date(),
    departmentId: "",
    positionId: "",
    managerId: "",
    scheduleType: WorkScheduleType.FULL_TIME,
    hourlyRate: undefined,
    salary: undefined,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      email: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      dateOfBirth: undefined,
      address: "",
      hireDate: new Date(),
      departmentId: "",
      positionId: "",
      managerId: "",
      scheduleType: WorkScheduleType.FULL_TIME,
      hourlyRate: undefined,
      salary: undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.username.trim() ||
      !formData.password.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.departmentId || !formData.positionId) {
      toast.error("Please select department and position");
      return;
    }

    try {
      setLoading(true);

      const employeeData: CreateEmployeeData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || undefined,
        dateOfBirth: formData.dateOfBirth?.toISOString(),
        address: formData.address || undefined,
        hireDate: formData.hireDate?.toISOString(),
        departmentId: formData.departmentId,
        positionId: formData.positionId,
        managerId: formData.managerId || undefined,
        scheduleType: formData.scheduleType,
        hourlyRate: formData.hourlyRate,
        salary: formData.salary,
      };

      await createEmployee(employeeData);
      toast.success(
        `Employee ${formData.firstName} ${formData.lastName} created successfully!`
      );
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Employee creation failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create employee"
      );
    } finally {
      setLoading(false);
    }
  };

  console.log('Dialog state:', { isOpen, trigger });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('Dialog onOpenChange:', open);
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        {trigger || <Button onClick={() => {
          console.log('Default button clicked');
          setIsOpen(true);
        }}>Add Employee</Button>}
      </DialogTrigger>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '600px',
          maxHeight: '90vh',
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          overflow: 'auto',
          border: '1px solid #e5e7eb'
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Add New Employee
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Enter last name"
                  required
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="employee@company.com"
                    className="pl-10 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="Enter username"
                  required
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter password"
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    placeholder="+1 (555) 000-0000"
                    className="pl-10 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter address"
                  className="pl-10 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Building className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">
                Employment Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departmentId">Department *</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) =>
                    handleInputChange("departmentId", value)
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dept1">Engineering</SelectItem>
                    <SelectItem value="dept2">Marketing</SelectItem>
                    <SelectItem value="dept3">Sales</SelectItem>
                    <SelectItem value="dept4">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="positionId">Position *</Label>
                <Select
                  value={formData.positionId}
                  onValueChange={(value) =>
                    handleInputChange("positionId", value)
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pos1">Software Engineer</SelectItem>
                    <SelectItem value="pos2">Marketing Manager</SelectItem>
                    <SelectItem value="pos3">Sales Representative</SelectItem>
                    <SelectItem value="pos4">HR Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduleType">Schedule Type</Label>
                <Select
                  value={formData.scheduleType}
                  onValueChange={(value) =>
                    handleInputChange("scheduleType", value as WorkScheduleType)
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select schedule type" />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerId">Manager</Label>
                <Select
                  value={formData.managerId}
                  onValueChange={(value) =>
                    handleInputChange("managerId", value)
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select manager (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mgr1">John Doe</SelectItem>
                    <SelectItem value="mgr2">Jane Smith</SelectItem>
                    <SelectItem value="mgr3">Mike Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "salary",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="Enter annual salary"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  value={formData.hourlyRate || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "hourlyRate",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="Enter hourly rate"
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input
                id="hireDate"
                type="date"
                value={
                  formData.hireDate
                    ? format(formData.hireDate, "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  handleInputChange(
                    "hireDate",
                    e.target.value ? new Date(e.target.value) : new Date()
                  )
                }
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Employee"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

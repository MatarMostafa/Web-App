import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useEmployeeStore } from "@/store/employeeStore";
import {
  Employee,
  UpdateEmployeeData,
  WorkScheduleType,
} from "@/types/employee";
import { apiClient } from "@/lib/api-client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

import { User, Mail, Phone, Building, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface EditEmployeeDialogProps {
  employee: Employee;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface EmployeeFormData {
  email?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  hireDate?: Date;
  departmentId?: string;
  positionId?: string;
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

export default function EditEmployeeDialog({
  employee,
  trigger,
  open,
  onOpenChange,
}: EditEmployeeDialogProps) {
  const { updateEmployee } = useEmployeeStore();

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState<EmployeeFormData>({
    email: "",
    username: "",
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
  const [userInfo, setUserInfo] = useState<{email?: string; username: string}>({username: ""});
  const [originalData, setOriginalData] = useState<EmployeeFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [positions, setPositions] = useState<{ id: string; title: string }[]>(
    []
  );
  const [managers, setManagers] = useState<
    { id: string; employee: { firstName: string; lastName: string } }[]
  >([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (employee && isOpen) {
        try {
          // Fetch user info to get email and username
          const userResponse = await apiClient.get<{email?: string; username: string}>(`/api/employees/user/${employee.userId}`);
          setUserInfo(userResponse);
          
          const initialData = {
            email: userResponse.email || "",
            username: userResponse.username,
            firstName: employee.firstName || "",
            lastName: employee.lastName || "",
            phoneNumber: employee.phoneNumber || "",
            dateOfBirth: employee.dateOfBirth
              ? new Date(employee.dateOfBirth)
              : undefined,
            address: employee.address || "",
            hireDate: new Date(employee.hireDate),
            departmentId: employee.departmentId || "",
            positionId: employee.positionId || "",
            managerId: employee.managerId || "",
            scheduleType: employee.scheduleType,
            hourlyRate: employee.hourlyRate,
            salary: employee.salary,
          };
          setFormData(initialData);
          setOriginalData(initialData);
        } catch (error) {
          console.error("Failed to fetch user info:", error);
          // Fallback to employee data only
          const fallbackData = {
            email: "",
            username: "Loading...",
            firstName: employee.firstName || "",
            lastName: employee.lastName || "",
            phoneNumber: employee.phoneNumber || "",
            dateOfBirth: employee.dateOfBirth
              ? new Date(employee.dateOfBirth)
              : undefined,
            address: employee.address || "",
            hireDate: new Date(employee.hireDate),
            departmentId: employee.departmentId || "",
            positionId: employee.positionId || "",
            managerId: employee.managerId || "",
            scheduleType: employee.scheduleType,
            hourlyRate: employee.hourlyRate,
            salary: employee.salary,
          };
          setFormData(fallbackData);
          setOriginalData(fallbackData);
        }
      }
    };
    
    fetchUserInfo();
  }, [employee, isOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptData, posData, mgrData] = await Promise.all([
          apiClient.get<{ id: string; name: string }[]>("/api/departments"),
          apiClient.get<{ id: string; title: string }[]>("/api/positions"),
          apiClient.get<
            { id: string; employee: { firstName: string; lastName: string } }[]
          >("/api/managers"),
        ]);
        setDepartments(deptData);
        setPositions(posData);
        setManagers(mgrData);
      } catch (error) {
        console.error("Failed to fetch form data:", error);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  const handleInputChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Check if form data has changed
  const hasChanges = () => {
    if (!originalData) return false;
    
    return Object.keys(formData).some(key => {
      const field = key as keyof EmployeeFormData;
      const current = formData[field];
      const original = originalData[field];
      
      // Handle date comparison
      if (current instanceof Date && original instanceof Date) {
        return current.getTime() !== original.getTime();
      }
      
      // Handle undefined/empty string equivalence
      const normalizedCurrent = current === "" ? undefined : current;
      const normalizedOriginal = original === "" ? undefined : original;
      
      return normalizedCurrent !== normalizedOriginal;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // No mandatory fields except username (which is readonly)
    // All other fields are optional

    try {
      setLoading(true);

      const employeeData: UpdateEmployeeData = {
        email: formData.email || undefined,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        dateOfBirth: formData.dateOfBirth?.toISOString(),
        address: formData.address || undefined,
        hireDate: formData.hireDate?.toISOString(),
        departmentId: formData.departmentId || undefined,
        positionId: formData.positionId || undefined,
        managerId: formData.managerId || undefined,
        scheduleType: formData.scheduleType,
        hourlyRate: formData.hourlyRate,
        salary: formData.salary,
      };

      await updateEmployee(employee.id, employeeData);
      toast.success(
        `Employee ${formData.username} updated successfully!`
      );
      setIsOpen(false);
    } catch (error) {
      console.error("Employee update failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update employee"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button onClick={() => setIsOpen(true)}>Edit Employee</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Edit Employee
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
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ""}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ""}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Enter last name"
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="employee@company.com"
                    className="pl-10 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  readOnly
                  className="rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  placeholder="Loading..."
                />
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={
                  formData.dateOfBirth
                    ? format(formData.dateOfBirth, "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  handleInputChange(
                    "dateOfBirth",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
                className="rounded-lg"
              />
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
                <Label htmlFor="departmentId">Department</Label>
                <Select
                  value={formData.departmentId || ""}
                  onValueChange={(value) =>
                    handleInputChange("departmentId", value)
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="positionId">Position</Label>
                <Select
                  value={formData.positionId || ""}
                  onValueChange={(value) =>
                    handleInputChange("positionId", value)
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.title}
                      </SelectItem>
                    ))}
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
                    {managers.map((mgr) => (
                      <SelectItem key={mgr.id} value={mgr.id}>
                        {mgr.employee?.firstName} {mgr.employee?.lastName}
                      </SelectItem>
                    ))}
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
              className="flex-1 bg-primary hover:bg-primary/90 text-pforeground rounded-lg"
              disabled={loading || !hasChanges()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Employee"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getSession } from "next-auth/react";

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  employeeCode: string;
}

interface EmployeeExportDialogProps {
  employees: Employee[];
}

export function EmployeeExportDialog({ employees }: EmployeeExportDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<
    "assignments" | "work-stats" | "combined"
  >("assignments");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(
    "monthly"
  );
  const [employeeId, setEmployeeId] = useState<string>("all");
  const [format, setFormat] = useState<string>("xlsx");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error(t('export.selectDates'));
      return;
    }

    setLoading(true);
    try {
      const session = await getSession();
      if (!session?.accessToken) {
        toast.error(t('export.authRequired'));
        return;
      }

      const params = new URLSearchParams({
        period,
        startDate,
        endDate,
        format,
      });

      if (employeeId !== "all") {
        params.append("employeeId", employeeId);
      }

      const endpoint =
        exportType === "assignments"
          ? "/api/employees/export/assignments"
          : exportType === "work-stats"
            ? "/api/employees/export/work-stats"
            : "/api/employees/export/combined";

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(
        `${API_URL}${endpoint}?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(t('export.failed'));
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      const fileExtension = format === "csv" ? "csv" : "xlsx";
      const filename =
        response.headers
          .get("Content-Disposition")
          ?.split("filename=")[1]
          ?.replace(/"/g, "") ||
        `employee-${exportType}-${period}-${new Date().toISOString().split("T")[0]}.${fileExtension}`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t('export.success'));
      setOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t('export.error'));
    } finally {
      setLoading(false);
    }
  };

  // Set default dates (last 30 days)
  const setDefaultDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setEndDate(end.toISOString().split("T")[0]);
    setStartDate(start.toISOString().split("T")[0]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={setDefaultDates}>
          <Download className="h-4 w-4 mr-2" />
          {t('export.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('export.title')}</DialogTitle>
          <DialogDescription>
            {t('export.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="export-type" className="text-right">
              {t('export.type')}
            </Label>
            <Select
              value={exportType}
              onValueChange={(value: any) => setExportType(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t('export.selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assignments">{t('export.assignmentsOnly')}</SelectItem>
                <SelectItem value="work-stats">{t('export.workStatsOnly')}</SelectItem>
                <SelectItem value="combined">{t('export.combinedData')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="period" className="text-right">
              {t('export.period')}
            </Label>
            <Select
              value={period}
              onValueChange={(value: any) => setPeriod(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t('export.selectPeriod')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t('export.daily')}</SelectItem>
                <SelectItem value="weekly">{t('export.weekly')}</SelectItem>
                <SelectItem value="monthly">{t('export.monthly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employee" className="text-right">
              {t('export.employee')}
            </Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t('export.selectEmployee')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('export.allEmployees')}</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName && employee.lastName
                      ? `${employee.firstName} ${employee.lastName} (${employee.employeeCode})`
                      : employee.employeeCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              {t('export.format')}
            </Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t('export.selectFormat')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">{t('export.excel')}</SelectItem>
                <SelectItem value="csv">{t('export.csv')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              {t('export.startDate')}
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              {t('export.endDate')}
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? t('export.exporting') : t('export.button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

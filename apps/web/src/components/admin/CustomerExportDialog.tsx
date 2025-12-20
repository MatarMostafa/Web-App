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
import { Download } from "lucide-react";
import { toast } from "sonner";
import { getSession } from "next-auth/react";

interface Customer {
  id: string;
  companyName: string;
}

interface CustomerExportDialogProps {
  customers: Customer[];
}

export function CustomerExportDialog({ customers }: CustomerExportDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState<string>("all");
  const [format, setFormat] = useState<string>("xlsx");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error(t('customerExport.selectDates'));
      return;
    }

    setLoading(true);
    try {
      const session = await getSession();
      if (!session?.accessToken) {
        toast.error(t('customerExport.authRequired'));
        return;
      }

      const params = new URLSearchParams({
        startDate,
        endDate,
        format,
      });

      if (customerId !== "all") {
        params.append("customerId", customerId);
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(
        `${API_URL}/api/customers/export/data?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(t('customerExport.failed'));
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
        `customer-data-${new Date().toISOString().split("T")[0]}.${fileExtension}`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t('customerExport.success'));
      setOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t('customerExport.error'));
    } finally {
      setLoading(false);
    }
  };

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
          {t('customerExport.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('customerExport.title')}</DialogTitle>
          <DialogDescription>
            {t('customerExport.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer" className="text-right">
              {t('customerExport.customer')}
            </Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t('customerExport.selectCustomer')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('customerExport.allCustomers')}</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              {t('customerExport.format')}
            </Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t('customerExport.selectFormat')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">{t('customerExport.excel')}</SelectItem>
                <SelectItem value="csv">{t('customerExport.csv')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              {t('customerExport.startDate')}
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
              {t('customerExport.endDate')}
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
            {loading ? t('customerExport.exporting') : t('customerExport.button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

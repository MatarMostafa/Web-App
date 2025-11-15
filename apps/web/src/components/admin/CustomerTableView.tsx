import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Avatar, AvatarFallback } from "@/components/ui";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Customer } from "@/types/customer";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

interface CustomerTableViewProps {
  customers: Customer[];
  loading?: boolean;
  onEdit?: (customer: Customer) => void;
  onDelete?: (id: string) => void;
}

const CustomerTableView: React.FC<CustomerTableViewProps> = ({
  customers,
  loading = false,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { currentPage, setCurrentPage, paginatedItems, totalItems } = usePagination(customers);
  const getInitials = (companyName: string) => {
    return companyName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const router = useRouter();

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow className="border-b">
              <TableHead className="w-[250px]">{t("admin.customers.table.company")}</TableHead>
              <TableHead className="w-[200px]">{t("admin.customers.table.contactEmail")}</TableHead>
              <TableHead className="w-[150px]">{t("admin.customers.table.phone")}</TableHead>
              <TableHead className="w-[150px]">{t("admin.customers.table.industry")}</TableHead>
              <TableHead className="w-[150px]">{t("admin.customers.table.taxNumber")}</TableHead>
              <TableHead className="w-[100px]">{t("admin.customers.table.status")}</TableHead>
              <TableHead className="w-[150px]">{t("admin.customers.table.created")}</TableHead>
              <TableHead className="w-[120px] text-center">{t("admin.customers.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {t("admin.customers.table.loadingCustomers")}
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {t("admin.customers.table.noCustomersFound")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/50">
                  {/* Company Name */}
                  <TableCell>
                    <div
                      className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                      onClick={() =>
                        router.push(`/dashboard-admin/customers/${customer.id}`)
                      }
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(customer.companyName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-primary hover:underline">
                          {customer.companyName}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact Email */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {customer.contactEmail || "—"}
                    </span>
                  </TableCell>

                  {/* Phone */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {customer.contactPhone || "—"}
                    </span>
                  </TableCell>

                  {/* Industry */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {customer.industry || "—"}
                    </span>
                  </TableCell>

                  {/* Tax Number */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {customer.taxNumber || "—"}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={customer.isActive ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {customer.isActive ? t("admin.customers.table.active") : t("admin.customers.table.inactive")}
                    </Badge>
                  </TableCell>

                  {/* Created Date */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(customer.createdAt), "MMM d, yyyy")}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(customer)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(customer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default CustomerTableView;

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
import { Edit3, Trash2, KeyRound, UserPlus, Shield, ShieldOff } from "lucide-react";
import { format } from "date-fns";
import { Customer } from "@/types/customer";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

interface CustomerTableViewProps {
  customers: Customer[];
  loading?: boolean;
  onEdit?: (customer: Customer) => void;
  onDelete?: (id: string) => void;
  onResetPassword?: (customer: Customer) => void;
  onCreateAccount?: (customer: Customer) => void;
  onBlock?: (customer: Customer) => void;
  onUnblock?: (customer: Customer) => void;
}

const CustomerTableView: React.FC<CustomerTableViewProps> = ({
  customers,
  loading = false,
  onEdit,
  onDelete,
  onResetPassword,
  onCreateAccount,
  onBlock,
  onUnblock,
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
                      variant={customer.isActive !== false ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {customer.isActive !== false ? t("admin.customers.table.active") : t("admin.customers.table.blocked")}
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
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(customer)}
                          title={t('admin.customers.table.editCustomer')}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      {customer.user ? (
                        // Customer has account - show reset password
                        onResetPassword && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onResetPassword(customer)}
                            title={t('admin.customers.table.resetPassword')}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                        )
                      ) : (
                        // Customer has no account - show create account
                        onCreateAccount && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCreateAccount(customer)}
                            title={t('admin.customers.table.createAccount')}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )
                      )}
                      {customer.user && (
                        customer.isActive !== false ? (
                          onBlock && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onBlock(customer)}
                              title={t('admin.customers.table.blockCustomer')}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <ShieldOff className="h-4 w-4" />
                            </Button>
                          )
                        ) : (
                          onUnblock && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onUnblock(customer)}
                              title={t('admin.customers.table.unblockCustomer')}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          )
                        )
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(customer.id)}
                          title={t('admin.customers.table.deleteCustomer')}
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

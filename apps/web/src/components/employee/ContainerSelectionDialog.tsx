"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import toast from "react-hot-toast";

interface Container {
  id: string;
  serialNumber: string;
  cartonQuantity: number;
  articleQuantity: number;
  employeeAssignments: Array<{
    employee: {
      firstName: string;
      lastName: string;
    };
  }>;
}

interface ContainerSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onContainerSelected: (containerId: string) => void;
}

export const ContainerSelectionDialog: React.FC<ContainerSelectionDialogProps> = ({
  isOpen,
  onClose,
  orderId,
  onContainerSelected,
}) => {
  const { t } = useTranslation();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);

  console.log('ContainerSelectionDialog props:', { isOpen, orderId }); // Debug log

  useEffect(() => {
    if (isOpen) {
      fetchContainers();
    }
  }, [isOpen, orderId]);

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/containers/order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setContainers(data.data);
        }
      } else {
        toast.error("Failed to fetch containers");
      }
    } catch (error) {
      console.error("Failed to fetch containers:", error);
      toast.error("Failed to fetch containers");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContainer = () => {
    if (selectedContainer) {
      onContainerSelected(selectedContainer);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("employee.orderDetail.selectContainer")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">{t("employee.orderDetail.loadingContainers")}</div>
          ) : containers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("employee.orderDetail.noContainersAvailable")}
            </div>
          ) : (
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {containers.map((container) => (
                <Card
                  key={container.id}
                  className={`cursor-pointer transition-colors ${
                    selectedContainer === container.id
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedContainer(container.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedContainer === container.id}
                          onChange={() => setSelectedContainer(container.id)}
                        />
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{container.serialNumber}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{t("employee.orderDetail.cartons")}: {container.cartonQuantity}</span>
                            <span>{t("employee.orderDetail.articles")}: {container.articleQuantity}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {container.employeeAssignments.length > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {container.employeeAssignments.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {container.employeeAssignments.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {t("employee.orderDetail.assignedTo")}: {container.employeeAssignments
                          .map(a => `${a.employee.firstName} ${a.employee.lastName}`)
                          .join(", ")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleSelectContainer}
              disabled={!selectedContainer}
            >
              {t("employee.orderDetail.startWorkOnContainer")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
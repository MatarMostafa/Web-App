"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";

interface Container {
  id: string;
  serialNumber: string;
  cartonQuantity: number;
  articleQuantity: number;
}

interface ReportQuantitiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  containerId?: string | null;
  onSubmit: (data: { reportedCartonQuantity: number; reportedArticleQuantity: number; notes?: string }) => void;
}

export const ReportQuantitiesDialog: React.FC<ReportQuantitiesDialogProps> = ({
  isOpen,
  onClose,
  orderId,
  containerId,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [container, setContainer] = useState<Container | null>(null);
  const [reportedCartonQuantity, setReportedCartonQuantity] = useState<number>(0);
  const [reportedArticleQuantity, setReportedArticleQuantity] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && containerId) {
      fetchContainer();
    }
  }, [isOpen, orderId, containerId]);

  const fetchContainer = async () => {
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
          const foundContainer = data.data.find((c: Container) => c.id === containerId);
          if (foundContainer) {
            setContainer(foundContainer);
            setReportedCartonQuantity(foundContainer.cartonQuantity);
            setReportedArticleQuantity(foundContainer.articleQuantity);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch container:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      reportedCartonQuantity,
      reportedArticleQuantity,
      notes: notes.trim() || undefined,
    });
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report Work Completion</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading container...</div>
          ) : container ? (
            <>
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Container: {container.serialNumber}</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Expected Cartons:</span>
                    <span>{container.cartonQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Articles:</span>
                    <span>{container.articleQuantity}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="reportedCartons">Reported Carton Quantity</Label>
                  <Input
                    id="reportedCartons"
                    type="number"
                    min="0"
                    value={reportedCartonQuantity}
                    onChange={(e) => setReportedCartonQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="reportedArticles">Reported Article Quantity</Label>
                  <Input
                    id="reportedArticles"
                    type="number"
                    min="0"
                    value={reportedArticleQuantity}
                    onChange={(e) => setReportedArticleQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about the work completed..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  Submit Report
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground">No container selected</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
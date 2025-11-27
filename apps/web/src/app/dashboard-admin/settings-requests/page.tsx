"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Check, X, Clock, User } from "lucide-react";

interface SettingsRequest {
  id: string;
  requestType: string;
  currentValue: string | null;
  requestedValue: string;
  reason: string | null;
  status: string;
  createdAt: string;
  user: {
    username?: string;
    employee?: {
      firstName?: string;
      lastName?: string;
    } | null;
    customer?: {
      companyName?: string;
    } | null;
  };
}

export default function SettingsRequestsPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<SettingsRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SettingsRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await apiClient.get("/api/admin/settings/pending-requests");
      console.log("API Response:", response);
      console.log("Response data:", response.data);
      const requestsData = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
      console.log("Setting requests:", requestsData);
      setRequests(requestsData);
    } catch (error: any) {
      console.error("Failed to fetch requests:", error);
      console.error("Error response:", error.response?.data);
      toast.error(`Failed to load settings requests: ${error.response?.data?.message || error.message}`);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (request: SettingsRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes("");
  };

  const submitReview = async () => {
    if (!selectedRequest || !reviewAction) return;

    if (reviewAction === "reject" && !reviewNotes.trim()) {
      toast.error(t('settings.changeRequests.rejectionReasonRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = reviewAction === "approve" 
        ? `/api/admin/settings/approve-request/${selectedRequest.id}`
        : `/api/admin/settings/reject-request/${selectedRequest.id}`;

      await apiClient.post(endpoint, { reviewNotes });
      
      if (reviewAction === "reject") {
        toast.success(t('settings.requests.requestRejected'));
      }
      
      setSelectedRequest(null);
      setReviewAction(null);
      setReviewNotes("");
      fetchRequests();
    } catch (error: any) {
      toast.error(
        error.message || 
        (reviewAction === "approve" 
          ? t('settings.changeRequests.approveFailed')
          : t('settings.changeRequests.rejectFailed'))
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getRequestorName = (request: SettingsRequest) => {
    if (request.user?.employee?.firstName && request.user?.employee?.lastName) {
      return `${request.user.employee.firstName} ${request.user.employee.lastName}`;
    }
    if (request.user?.customer?.companyName) {
      return request.user.customer.companyName;
    }
    return request.user?.username || 'Unknown User';
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "PENDING" ? "secondary" : status === "APPROVED" ? "default" : "destructive";
    return (
      <Badge variant={variant}>
        {t(`settings.requests.status.${status}`)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t('settings.requests.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('settings.requests.subtitle')}
        </p>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {!loading && (!requests || requests.length === 0) ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {t('settings.requests.noRequests')}
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="text-center">{t('common.loading')}</div>
        ) : (
          requests?.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">
                        {getRequestorName(request)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {t(`settings.requests.types.${request.requestType}`)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      {t('settings.requests.currentValue')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {request.currentValue || t('settings.personal.notSet')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      {t('settings.requests.requestedValue')}
                    </Label>
                    <p className="text-sm font-semibold">
                      {request.requestedValue}
                    </p>
                  </div>
                </div>
                
                {request.reason && (
                  <div>
                    <Label className="text-sm font-medium">
                      {t('settings.requests.requestReason')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {request.reason}
                    </p>
                  </div>
                )}

                {request.status === "PENDING" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleReview(request, "approve")}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      {t('settings.requests.approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReview(request, "reject")}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      {t('settings.requests.reject')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => {
        setSelectedRequest(null);
        setReviewAction(null);
        setReviewNotes("");
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" 
                ? t('settings.requests.approve')
                : t('settings.requests.reject')
              } - {selectedRequest && getRequestorName(selectedRequest)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('settings.requests.requestType')}
                </Label>
                <p className="text-sm">
                  {t(`settings.requests.types.${selectedRequest.requestType}`)}
                </p>
                <Label className="text-sm font-medium">
                  Change Details
                </Label>
                <p className="text-sm">
                  <span className="text-muted-foreground">
                    {selectedRequest.currentValue || t('settings.personal.notSet')}
                  </span>
                  {" → "}
                  <span className="font-semibold">
                    {selectedRequest.requestedValue}
                  </span>
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>
                {reviewAction === "approve" 
                  ? t('settings.requests.approvalNotes')
                  : t('settings.requests.rejectionReason')
                }
                {reviewAction === "reject" && " *"}
              </Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  reviewAction === "approve"
                    ? "Add optional notes for this approval..."
                    : "Provide a reason for rejection..."
                }
                className="min-h-[80px]"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewAction(null);
                  setReviewNotes("");
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={submitReview} 
                disabled={submitting}
                variant={reviewAction === "approve" ? "default" : "destructive"}
              >
                {submitting 
                  ? (reviewAction === "approve" 
                      ? t('settings.requests.approving')
                      : t('settings.requests.rejecting'))
                  : (reviewAction === "approve" 
                      ? t('settings.requests.approve')
                      : t('settings.requests.reject'))
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
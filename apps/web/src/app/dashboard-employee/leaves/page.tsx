"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useEmployeeLeaveStore } from "@/store/employeeLeaveStore";
import { LeaveRequestModal } from "@/components/employee/LeaveRequestModal";
import { formatDate } from "@/lib/utils";

const LeavesPage = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { 
    absences, 
    stats, 
    loading, 
    fetchMyAbsences, 
    fetchLeaveStats 
  } = useEmployeeLeaveStore();

  useEffect(() => {
    fetchMyAbsences();
    fetchLeaveStats();
  }, [fetchMyAbsences, fetchLeaveStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
        <Button onClick={() => setShowRequestModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Request Leave
        </Button>
      </div>

      {/* Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Days</p>
                <p className="text-2xl font-bold">{stats?.totalDays || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats?.approvedDays || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pendingDays || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats?.rejectedDays || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>My Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {absences.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leave requests found</p>
              <Button 
                onClick={() => setShowRequestModal(true)} 
                className="mt-4"
                variant="outline"
              >
                Submit Your First Request
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {absences.map((absence) => (
                <div key={absence.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{absence.type.replace('_', ' ')}</h3>
                        <Badge className={getStatusColor(absence.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(absence.status)}
                            {absence.status}
                          </div>
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Duration:</strong> {formatDate(absence.startDate, { month: 'short', day: 'numeric', year: 'numeric' })} - {formatDate(absence.endDate, { month: 'short', day: 'numeric', year: 'numeric' })}
                          <span className="ml-2">({calculateDays(absence.startDate, absence.endDate)} days)</span>
                        </p>
                        {absence.reason && (
                          <p><strong>Reason:</strong> {absence.reason}</p>
                        )}
                        {absence.status === 'REJECTED' && absence.rejectionReason && (
                          <p className="text-red-600">
                            <strong>Rejection Reason:</strong> {absence.rejectionReason}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Submitted on {formatDate(absence.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Request Modal */}
      <LeaveRequestModal 
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={() => {
          setShowRequestModal(false);
          fetchMyAbsences();
          fetchLeaveStats();
        }}
      />
    </div>
  );
};

export default LeavesPage;
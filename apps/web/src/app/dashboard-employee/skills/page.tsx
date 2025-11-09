"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinnerWithText } from "@/components/ui";
import { Award, Plus, Trash2, Edit, CheckCircle, XCircle, Clock } from "lucide-react";
import { useSkillsStore } from "@/store/skillsStore";
import { useAuthStore } from "@/store/authStore";
import { useEmployeeStore } from "@/store/employeeStore";
import AddSkillModal from "@/components/employee/AddSkillModal";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useTranslation } from "@/hooks/useTranslation";

const SkillsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { 
    employeeQualifications, 
    loading, 
    fetchEmployeeQualifications, 
    removeEmployeeQualification 
  } = useSkillsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployeeQualifications();
  }, [fetchEmployeeQualifications]);
  
  useEffect(() => {
    const handleRefreshSkills = () => {
      fetchEmployeeQualifications();
    };
    
    window.addEventListener('refreshSkillsData', handleRefreshSkills);
    return () => window.removeEventListener('refreshSkillsData', handleRefreshSkills);
  }, [fetchEmployeeQualifications]);

  const handleDelete = async (qualificationId: string) => {
    setDeletingId(qualificationId);
    try {
      await removeEmployeeQualification(qualificationId);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (qualification: any) => {
    if (qualification.isVerified) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('employee.skills.verified')}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          {t('employee.skills.pending')}
        </Badge>
      );
    }
  };

  const canDelete = (qualification: any) => {
    return !qualification.isVerified; // Can only delete pending qualifications
  };

  if (loading && employeeQualifications.length === 0) {
    return (
      <div className="w-full h-full min-h-[calc(100vh-130px)] flex items-center justify-center">
        <LoadingSpinnerWithText text={t('employee.skills.loading')} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('employee.skills.title')}</h1>
          <p className="text-muted-foreground">
            {t('employee.skills.subtitle')}
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('employee.skills.addSkill')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {t('employee.skills.title')} ({employeeQualifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employeeQualifications.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t('employee.skills.noSkills')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('employee.skills.noSkillsDesc')}
              </p>
              <Button 
                onClick={() => setShowAddModal(true)} 
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('employee.skills.addFirstSkill')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employeeQualifications.map((eq) => (
                <div
                  key={eq.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">
                        {eq.qualification.name}
                      </h4>
                      {eq.qualification.category && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {eq.qualification.category}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(eq)}
                      {canDelete(eq) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(eq.qualificationId)}
                          disabled={deletingId === eq.qualificationId}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('employee.skills.proficiency')}:</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < eq.proficiencyLevel
                                ? "bg-primary"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-xs">
                          {eq.proficiencyLevel}/5
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('employee.skills.acquired')}:</span>
                      <span>
                        {format(new Date(eq.acquiredDate), "dd.MM.yyyy", { locale: de })}
                      </span>
                    </div>

                    {eq.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('employee.skills.expires')}:</span>
                        <span className={
                          new Date(eq.expiryDate) < new Date() 
                            ? "text-red-600" 
                            : new Date(eq.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            ? "text-yellow-600"
                            : ""
                        }>
                          {format(new Date(eq.expiryDate), "dd.MM.yyyy", { locale: de })}
                        </span>
                      </div>
                    )}
                  </div>

                  {eq.qualification.description && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        {eq.qualification.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddSkillModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </div>
  );
};

export default SkillsPage;
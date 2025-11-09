import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Award } from "lucide-react";
import { useSkillsStore } from "@/store/skillsStore";
import { CreateEmployeeQualificationData } from "@/types/skills";
import { useTranslation } from "@/hooks/useTranslation";

interface AddSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddSkillModal: React.FC<AddSkillModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const { 
    qualifications, 
    loading, 
    fetchQualifications, 
    addEmployeeQualification 
  } = useSkillsStore();
  
  const [formData, setFormData] = useState<CreateEmployeeQualificationData>({
    qualificationId: "",
    proficiencyLevel: 1,
    expiryDate: "",
    certificateUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && qualifications.length === 0) {
      fetchQualifications();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.qualificationId) {
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        expiryDate: formData.expiryDate || undefined,
        certificateUrl: formData.certificateUrl || undefined,
      };
      
      await addEmployeeQualification(submitData);
      onOpenChange(false);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      qualificationId: "",
      proficiencyLevel: 1,
      expiryDate: "",
      certificateUrl: "",
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const selectedQualification = qualifications.find(q => q.id === formData.qualificationId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {t('employee.skills.addSkill')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qualification">{t('employee.skills.qualification')} *</Label>
            <Select
              value={formData.qualificationId}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, qualificationId: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={t('employee.skills.selectQualification')} />
              </SelectTrigger>
              <SelectContent>
                {qualifications.map((qualification) => (
                  <SelectItem key={qualification.id} value={qualification.id}>
                    <div>
                      <div className="font-medium">{qualification.name}</div>
                      {qualification.category && (
                        <div className="text-xs text-muted-foreground">
                          {qualification.category}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedQualification?.description && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {selectedQualification.description}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="proficiencyLevel">{t('employee.skills.proficiencyLevel')} (1-5) *</Label>
            <Select
              value={formData.proficiencyLevel.toString()}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, proficiencyLevel: parseInt(value) }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - {t('employee.skills.level1')}</SelectItem>
                <SelectItem value="2">2 - {t('employee.skills.level2')}</SelectItem>
                <SelectItem value="3">3 - {t('employee.skills.level3')}</SelectItem>
                <SelectItem value="4">4 - {t('employee.skills.level4')}</SelectItem>
                <SelectItem value="5">5 - {t('employee.skills.level5')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedQualification?.requiresCertificate && (
            <div className="space-y-2">
              <Label htmlFor="certificateUrl">{t('employee.skills.certificateUrl')}</Label>
              <Input
                id="certificateUrl"
                type="url"
                value={formData.certificateUrl}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, certificateUrl: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          )}

          {selectedQualification?.expiryMonths && (
            <div className="space-y-2">
              <Label htmlFor="expiryDate">{t('employee.skills.expiryDate')}</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, expiryDate: e.target.value }))
                }
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.qualificationId}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('employee.skills.adding')}
                </>
              ) : (
                t('common.add')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSkillModal;
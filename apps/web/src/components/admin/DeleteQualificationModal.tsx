import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSkillsStore } from "@/store/skillsStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Qualification } from "@/types/skills";
import { AlertTriangle } from "lucide-react";

interface DeleteQualificationModalProps {
  isOpen: boolean;
  qualification: Qualification;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteQualificationModal: React.FC<DeleteQualificationModalProps> = ({
  isOpen,
  qualification,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { loading, deleteQualification } = useSkillsStore();

  const handleDelete = async () => {
    try {
      await deleteQualification(qualification.id);
      onSuccess();
    } catch (error) {
      console.error("Error deleting qualification:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {t('admin.qualifications.delete.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              {t('admin.qualifications.delete.warning')}
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium">{t('admin.qualifications.delete.qualificationName')}:</p>
            <p className="text-lg font-semibold text-gray-900">{qualification.name}</p>
            {qualification.category && (
              <p className="text-sm text-gray-600">
                {t('admin.qualifications.delete.category')}: {qualification.category}
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              {t('admin.qualifications.delete.note')}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? t('admin.qualifications.delete.deleting') : t('admin.qualifications.delete.confirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteQualificationModal;
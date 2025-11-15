import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSkillsStore } from "@/store/skillsStore";
import { Award, X } from "lucide-react";

interface AddEmployeeSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  onSuccess: () => void;
}

const AddEmployeeSkillModal: React.FC<AddEmployeeSkillModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  onSuccess,
}) => {
  const [selectedQualificationId, setSelectedQualificationId] = useState("");
  const [proficiencyLevel, setProficiencyLevel] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");

  const {
    qualifications,
    loading,
    fetchQualifications,
    addEmployeeQualificationAsAdmin,
  } = useSkillsStore();

  useEffect(() => {
    if (isOpen) {
      fetchQualifications();
    }
  }, [isOpen, fetchQualifications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQualificationId) return;

    try {
      await addEmployeeQualificationAsAdmin(employeeId, {
        qualificationId: selectedQualificationId,
        proficiencyLevel,
        expiryDate: expiryDate || undefined,
        certificateUrl: certificateUrl || undefined,
      });
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  const handleClose = () => {
    setSelectedQualificationId("");
    setProficiencyLevel(1);
    setExpiryDate("");
    setCertificateUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Fähigkeit hinzufügen - {employeeName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="qualification">Qualifikation *</Label>
            <Select value={selectedQualificationId} onValueChange={setSelectedQualificationId}>
              <SelectTrigger>
                <SelectValue placeholder="Qualifikation auswählen" />
              </SelectTrigger>
              <SelectContent>
                {qualifications.map((qual) => (
                  <SelectItem key={qual.id} value={qual.id}>
                    {qual.name} ({qual.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="proficiency">Kompetenzstufe</Label>
            <Select value={proficiencyLevel.toString()} onValueChange={(value) => setProficiencyLevel(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Level 1 - Grundkenntnisse</SelectItem>
                <SelectItem value="2">Level 2 - Fortgeschritten</SelectItem>
                <SelectItem value="3">Level 3 - Experte</SelectItem>
                <SelectItem value="4">Level 4 - Spezialist</SelectItem>
                <SelectItem value="5">Level 5 - Meister</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expiryDate">Ablaufdatum (optional)</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="certificateUrl">Zertifikat URL (optional)</Label>
            <Input
              id="certificateUrl"
              type="url"
              placeholder="https://..."
              value={certificateUrl}
              onChange={(e) => setCertificateUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedQualificationId || loading}
            >
              {loading ? "Wird hinzugefügt..." : "Hinzufügen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeSkillModal;
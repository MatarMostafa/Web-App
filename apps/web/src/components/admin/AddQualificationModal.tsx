import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSkillsStore } from "@/store/skillsStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Award } from "lucide-react";

interface AddQualificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddQualificationModal: React.FC<AddQualificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const {
    categories,
    loading,
    createQualification,
    fetchCategories,
  } = useSkillsStore();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!category && !customCategory.trim())) return;

    try {
      await createQualification({
        name: name.trim(),
        description: description.trim() || undefined,
        category: customCategory.trim() || category,
      });
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error creating qualification:", error);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setCategory("");
    setCustomCategory("");
    onClose();
  };

  const predefinedCategories = [
    "Technical Skills",
    "Soft Skills", 
    "Certifications",
    "Languages",
    "Tools & Software",
    "Industry Knowledge"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {t('admin.qualifications.addNew')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('admin.qualifications.form.name')} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('admin.qualifications.form.namePlaceholder')}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">{t('admin.qualifications.form.category')} *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t('admin.qualifications.form.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {predefinedCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
                {categories.filter(cat => !predefinedCategories.includes(cat)).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
                <SelectItem value="custom">{t('admin.qualifications.form.customCategory')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {category === "custom" && (
            <div>
              <Label htmlFor="customCategory">{t('admin.qualifications.form.newCategory')} *</Label>
              <Input
                id="customCategory"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder={t('admin.qualifications.form.newCategoryPlaceholder')}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="description">{t('admin.qualifications.form.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('admin.qualifications.form.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || (!category && !customCategory.trim()) || loading}
            >
              {loading ? t('admin.qualifications.form.creating') : t('admin.qualifications.form.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddQualificationModal;
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { ActivityType } from '@/types/order';
import { Plus, Trash2 } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  code?: string;
  unit: string;
  prices?: Array<{
    id: string;
    minQuantity: number;
    maxQuantity: number;
    price: number;
    effectiveFrom?: string;
  }>;
}

interface EditActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  customerId: string;
  onSubmit: (data: {
    name: string;
    type: ActivityType;
    code: string;
    unit: string;
    basePrice: number;
    articleBasePrice: number;
    priceRanges: Array<{ minQuantity: number; maxQuantity: number; price: number; validFrom: string }>;
  }) => Promise<void>;
}

export const EditActivityDialog = ({ open, onOpenChange, activity, customerId, onSubmit }: EditActivityDialogProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    type: ActivityType.CONTAINER_UNLOADING,
    code: '',
    unit: 'hour',
    basePrice: 0,
    articleBasePrice: 0
  });
  const [priceRanges, setPriceRanges] = useState([
    { minQuantity: 1, maxQuantity: 10, price: 0, validFrom: new Date().toISOString().split('T')[0] }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name,
        type: activity.type,
        code: activity.code || '',
        unit: activity.unit,
        basePrice: (activity as any).basePrice || 0,
        articleBasePrice: (activity as any).articleBasePrice || 0
      });
      
      if (activity.prices && activity.prices.length > 0) {
        setPriceRanges(activity.prices.map(p => ({
          minQuantity: p.minQuantity,
          maxQuantity: p.maxQuantity,
          price: p.price,
          validFrom: p.effectiveFrom ? new Date(p.effectiveFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        })));
      } else {
        setPriceRanges([{ minQuantity: 1, maxQuantity: 10, price: 0, validFrom: new Date().toISOString().split('T')[0] }]);
      }
    }
  }, [activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ ...formData, priceRanges });
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const addPriceRange = () => {
    setPriceRanges([...priceRanges, { minQuantity: 1, maxQuantity: 10, price: 0, validFrom: new Date().toISOString().split('T')[0] }]);
  };

  const removePriceRange = (index: number) => {
    setPriceRanges(priceRanges.filter((_, i) => i !== index));
  };

  const updatePriceRange = (index: number, field: string, value: any) => {
    const updated = [...priceRanges];
    updated[index] = { ...updated[index], [field]: value };
    setPriceRanges(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("activities.form.editTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("activities.form.name")} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{t("activities.form.type")} *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as ActivityType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ActivityType).map(type => (
                    <SelectItem key={type} value={type}>{t(`activities.types.${type}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("activities.form.code")}</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("activities.form.unit")} *</Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>
          </div>
          
          {/* Base Price - Only for Container Loading/Unloading */}
          {(formData.type === ActivityType.CONTAINER_LOADING || formData.type === ActivityType.CONTAINER_UNLOADING) && (
            <div>
              <Label>{t("activities.form.basePrice")} *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                placeholder={t("activities.form.basePricePlaceholder")}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("activities.form.basePriceHelp")}
              </p>
            </div>
          )}
          
          <div>
            <Label>{t("activities.form.articleBasePrice")} *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.articleBasePrice}
              onChange={(e) => setFormData({ ...formData, articleBasePrice: parseFloat(e.target.value) || 0 })}
              placeholder={t("activities.form.articleBasePricePlaceholder")}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("activities.form.articleBasePriceHelp")}
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>{t("activities.form.priceRanges")}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPriceRange}>
                <Plus className="w-4 h-4 mr-1" />
                {t("activities.form.addRange")}
              </Button>
            </div>
            {priceRanges.map((range, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 mb-2 items-end">
                <div>
                  <Label className="text-xs">{t("activities.form.minQty")}</Label>
                  <Input
                    type="number"
                    value={range.minQuantity}
                    onChange={(e) => updatePriceRange(index, 'minQuantity', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("activities.form.maxQty")}</Label>
                  <Input
                    type="number"
                    value={range.maxQuantity}
                    onChange={(e) => updatePriceRange(index, 'maxQuantity', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("activities.form.price")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={range.price}
                    onChange={(e) => updatePriceRange(index, 'price', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("activities.form.validFrom")}</Label>
                  <Input
                    type="date"
                    value={range.validFrom}
                    onChange={(e) => updatePriceRange(index, 'validFrom', e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePriceRange(index)}
                  disabled={priceRanges.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("activities.form.updating") : t("activities.updateActivity")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
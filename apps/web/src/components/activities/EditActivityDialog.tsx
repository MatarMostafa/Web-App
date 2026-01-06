import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ActivityType } from '@/types/order';
import { useState, useEffect } from 'react';

interface PriceRange {
  minQuantity: number;
  maxQuantity: number;
  price: number;
  validFrom: string;
}

interface EditActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: {
    id: string;
    name: string;
    type: ActivityType;
    code?: string;
    unit: string;
    customerPrices?: Array<{
      minQuantity: number;
      maxQuantity: number;
      price: number;
      effectiveFrom?: string;
    }>;
  } | null;
  customerId: string;
  onSubmit: (data: {
    name: string;
    type: ActivityType;
    code: string;
    unit: string;
    priceRanges: PriceRange[];
  }) => void;
}

const ACTIVITY_TYPE_OPTIONS = [
  { value: ActivityType.CONTAINER_UNLOADING, label: 'Container Unloading' },
  { value: ActivityType.WRAPPING, label: 'Wrapping' },
  { value: ActivityType.REPACKING, label: 'Repacking' },
  { value: ActivityType.CROSSING, label: 'Crossing' },
  { value: ActivityType.LABELING, label: 'Labeling' },
  { value: ActivityType.OTHER, label: 'Other' }
];

export const EditActivityDialog = ({ open, onOpenChange, activity, customerId, onSubmit }: EditActivityDialogProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    type: ActivityType.CONTAINER_UNLOADING,
    code: '',
    unit: 'hour'
  });
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([{ minQuantity: 1, maxQuantity: 999999, price: 0, validFrom: new Date().toISOString().split('T')[0] }]);

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name,
        type: activity.type,
        code: activity.code || '',
        unit: activity.unit
      });
      
      if (activity.customerPrices && activity.customerPrices.length > 0) {
        setPriceRanges(activity.customerPrices.map(p => ({
          minQuantity: p.minQuantity,
          maxQuantity: p.maxQuantity,
          price: Number(p.price),
          validFrom: p.effectiveFrom ? new Date(p.effectiveFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        })));
      } else {
        setPriceRanges([{ minQuantity: 1, maxQuantity: 999999, price: 0, validFrom: new Date().toISOString().split('T')[0] }]);
      }
    }
  }, [activity]);

  const addPriceRange = () => {
    setPriceRanges([...priceRanges, { minQuantity: 1, maxQuantity: 999999, price: 0, validFrom: new Date().toISOString().split('T')[0] }]);
  };

  const removePriceRange = (index: number) => {
    if (priceRanges.length > 1) {
      setPriceRanges(priceRanges.filter((_, i) => i !== index));
    }
  };

  const updatePriceRange = (index: number, field: keyof PriceRange, value: number | string) => {
    const updated = [...priceRanges];
    updated[index] = { ...updated[index], [field]: value };
    setPriceRanges(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, priceRanges });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('activities.editActivity')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label>{t('activities.form.name')} *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <Label>{t('activities.form.type')} *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as ActivityType })} required>
                <SelectTrigger>
                  <SelectValue placeholder={t('activities.form.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('activities.form.code')}</Label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
            </div>
            <div>
              <Label>{t('activities.form.unit')}</Label>
              <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <Label className="text-base font-medium">Price Ranges</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPriceRange} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-1" />Add Range
              </Button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {priceRanges.map((range, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 border rounded-lg bg-gray-50">
                  <div>
                    <Label className="text-xs font-medium">Min Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={range.minQuantity}
                      onChange={(e) => updatePriceRange(index, 'minQuantity', parseInt(e.target.value) || 1)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Max Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={range.maxQuantity}
                      onChange={(e) => updatePriceRange(index, 'maxQuantity', parseInt(e.target.value) || 1)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Price (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={range.price}
                      onChange={(e) => updatePriceRange(index, 'price', parseFloat(e.target.value) || 0)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Valid From</Label>
                    <Input
                      type="date"
                      value={range.validFrom}
                      onChange={(e) => updatePriceRange(index, 'validFrom', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end sm:col-span-2 lg:col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePriceRange(index)}
                      disabled={priceRanges.length === 1}
                      className="w-full lg:w-auto mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Button type="submit" className="w-full">{t('activities.form.update')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
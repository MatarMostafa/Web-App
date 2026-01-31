'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ActivityType } from '@/types/order';
import { Plus, Trash2 } from 'lucide-react';

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export const AddActivityDialog = ({ open, onOpenChange, customerId, onSubmit }: AddActivityDialogProps) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ ...formData, priceRanges });
      setFormData({ name: '', type: ActivityType.CONTAINER_UNLOADING, code: '', unit: 'hour', basePrice: 0, articleBasePrice: 0 });
      setPriceRanges([{ minQuantity: 1, maxQuantity: 10, price: 0, validFrom: new Date().toISOString().split('T')[0] }]);
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
      <DialogTrigger asChild>
        <Button>Add Activity</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Type *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as ActivityType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ActivityType).map(type => (
                    <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <Label>Unit *</Label>
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
              <Label>Base Price (€) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                placeholder="Base price for container loading/unloading"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is the base price for container loading/unloading activities
              </p>
            </div>
          )}
          
          <div>
            <Label>Article Base Price (€) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.articleBasePrice}
              onChange={(e) => setFormData({ ...formData, articleBasePrice: parseFloat(e.target.value) || 0 })}
              placeholder="Base price for articles in this activity"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              This price will be used as the default article price when creating orders
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Price Ranges</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPriceRange}>
                <Plus className="w-4 h-4 mr-1" />
                Add Range
              </Button>
            </div>
            {priceRanges.map((range, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 mb-2 items-end">
                <div>
                  <Label className="text-xs">Min Qty</Label>
                  <Input
                    type="number"
                    value={range.minQuantity}
                    onChange={(e) => updatePriceRange(index, 'minQuantity', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Max Qty</Label>
                  <Input
                    type="number"
                    value={range.maxQuantity}
                    onChange={(e) => updatePriceRange(index, 'maxQuantity', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={range.price}
                    onChange={(e) => updatePriceRange(index, 'price', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Valid From</Label>
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
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Activity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
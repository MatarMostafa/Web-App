'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { ActivityType } from '@/types/order';

interface CustomerPricingTabProps {
  customerId: string;
}

interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  unit: string;
}

interface CustomerPriceTier {
  id: string;
  activityId: string;
  minQuantity: number;
  maxQuantity: number;
  price: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  activity: Activity;
}

const ACTIVITY_TYPE_LABELS = {
  [ActivityType.CONTAINER_UNLOADING]: 'Container Unloading',
  [ActivityType.CONTAINER_LOADING]: 'Container Loading',
  [ActivityType.WRAPPING]: 'Wrapping',
  [ActivityType.REPACKING]: 'Repacking',
  [ActivityType.CROSSING]: 'Crossing',
  [ActivityType.LABELING]: 'Labeling',
  [ActivityType.OTHER]: 'Other'
};

export default function CustomerPricingTab({ customerId }: CustomerPricingTabProps) {
  const [priceTiers, setPriceTiers] = useState<CustomerPriceTier[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    activityId: '',
    minQuantity: '1',
    maxQuantity: '100',
    price: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    isActive: true
  });

  useEffect(() => {
    fetchPriceTiers();
    fetchActivities();
  }, [customerId]);

  const fetchPriceTiers = async () => {
    try {
      const data = await apiClient.get<CustomerPriceTier[]>(`/pricing/customers/${customerId}/prices`);
      setPriceTiers(data || []);
    } catch (error) {
      toast.error('Failed to load price tiers');
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await apiClient.get<Activity[]>('/pricing/activities');
      setActivities(data || []);
    } catch (error) {
      toast.error('Failed to load activities');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.activityId || !formData.minQuantity || !formData.maxQuantity || !formData.price) {
      toast.error('All fields are required');
      return;
    }

    const minQty = parseInt(formData.minQuantity);
    const maxQty = parseInt(formData.maxQuantity);
    
    if (minQty <= 0 || maxQty <= 0) {
      toast.error('Quantities must be positive');
      return;
    }
    
    if (minQty > maxQty) {
      toast.error('Minimum quantity cannot be greater than maximum quantity');
      return;
    }

    try {
      await apiClient.post(`/pricing/customers/${customerId}/prices`, {
        ...formData,
        minQuantity: minQty,
        maxQuantity: maxQty,
        price: parseFloat(formData.price),
        effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
        effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : null
      });
      toast.success('Price tier created');
      setDialogOpen(false);
      setFormData({ 
        activityId: '', 
        minQuantity: '1', 
        maxQuantity: '100', 
        price: '', 
        effectiveFrom: new Date().toISOString().split('T')[0], 
        effectiveTo: '', 
        isActive: true 
      });
      fetchPriceTiers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create price tier');
    }
  };

  const handleDelete = async (priceId: string) => {
    if (!confirm('Delete this price tier?')) return;
    try {
      await apiClient.delete(`/pricing/customers/${customerId}/prices/${priceId}`);
      toast.success('Price tier deleted');
      fetchPriceTiers();
    } catch (error) {
      toast.error('Failed to delete price tier');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Customer Pricing Tiers</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Price Tier</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Customer Price Tier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Activity *</Label>
                <Select value={formData.activityId} onValueChange={(v) => setFormData({ ...formData, activityId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} ({ACTIVITY_TYPE_LABELS[a.type]}) - {a.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Quantity *</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={formData.minQuantity} 
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <Label>Max Quantity *</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={formData.maxQuantity} 
                    onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })} 
                    required 
                  />
                </div>
              </div>
              <div>
                <Label>Price (EUR) *</Label>
                <Input type="number" step="0.01" min="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
              </div>
              <div>
                <Label>Effective From *</Label>
                <Input type="date" value={formData.effectiveFrom} onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })} required />
              </div>
              <div>
                <Label>Effective To</Label>
                <Input type="date" value={formData.effectiveTo} onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Create Price Tier</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity Range</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Effective From</TableHead>
              <TableHead>Effective To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {priceTiers.map((tier) => (
              <TableRow key={tier.id}>
                <TableCell className="font-medium">{tier.activity.name}</TableCell>
                <TableCell>{ACTIVITY_TYPE_LABELS[tier.activity.type]}</TableCell>
                <TableCell>{tier.minQuantity} - {tier.maxQuantity}</TableCell>
                <TableCell>€{tier.price.toFixed(2)}</TableCell>
                <TableCell>{new Date(tier.effectiveFrom).toLocaleDateString()}</TableCell>
                <TableCell>{tier.effectiveTo ? new Date(tier.effectiveTo).toLocaleDateString() : 'Indefinite'}</TableCell>
                <TableCell>{tier.isActive ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(tier.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

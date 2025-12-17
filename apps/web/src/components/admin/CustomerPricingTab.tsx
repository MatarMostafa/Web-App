'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/api';

interface CustomerPricingTabProps {
  customerId: string;
}

interface Activity {
  id: string;
  name: string;
  defaultPrice: number;
  unit: string;
}

interface CustomerPrice {
  id: string;
  activityId: string;
  price: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  activity: Activity;
}

export default function CustomerPricingTab({ customerId }: CustomerPricingTabProps) {
  const [prices, setPrices] = useState<CustomerPrice[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    activityId: '',
    price: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    isActive: true
  });

  useEffect(() => {
    fetchPrices();
    fetchActivities();
  }, [customerId]);

  const fetchPrices = async () => {
    try {
      const { data } = await api.get(`/pricing/customers/${customerId}/prices`);
      setPrices(data);
    } catch (error) {
      toast.error('Failed to load prices');
    }
  };

  const fetchActivities = async () => {
    try {
      const { data } = await api.get('/pricing/activities');
      setActivities(data);
    } catch (error) {
      toast.error('Failed to load activities');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/pricing/customers/${customerId}/prices`, {
        ...formData,
        price: parseFloat(formData.price),
        effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
        effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : null
      });
      toast.success('Price created');
      setDialogOpen(false);
      setFormData({ activityId: '', price: '', effectiveFrom: new Date().toISOString().split('T')[0], effectiveTo: '', isActive: true });
      fetchPrices();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create price');
    }
  };

  const handleDelete = async (priceId: string) => {
    if (!confirm('Delete this price?')) return;
    try {
      await api.delete(`/pricing/customers/${customerId}/prices/${priceId}`);
      toast.success('Price deleted');
      fetchPrices();
    } catch (error) {
      toast.error('Failed to delete price');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Customer Pricing</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Price</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Customer Price</DialogTitle>
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
                        {a.name} (€{a.defaultPrice.toFixed(2)}/{a.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (EUR) *</Label>
                <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
              </div>
              <div>
                <Label>Effective From *</Label>
                <Input type="date" value={formData.effectiveFrom} onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })} required />
              </div>
              <div>
                <Label>Effective To</Label>
                <Input type="date" value={formData.effectiveTo} onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Default Price</TableHead>
              <TableHead>Effective From</TableHead>
              <TableHead>Effective To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.map((price) => (
              <TableRow key={price.id}>
                <TableCell className="font-medium">{price.activity.name}</TableCell>
                <TableCell>€{price.price.toFixed(2)}</TableCell>
                <TableCell className="text-muted-foreground">€{price.activity.defaultPrice.toFixed(2)}</TableCell>
                <TableCell>{new Date(price.effectiveFrom).toLocaleDateString()}</TableCell>
                <TableCell>{price.effectiveTo ? new Date(price.effectiveTo).toLocaleDateString() : 'Indefinite'}</TableCell>
                <TableCell>{price.isActive ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(price.id)}>
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

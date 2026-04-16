'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';
import { useSession } from 'next-auth/react';
import { CustomerPricingRule, PricingMethod } from '@/types/order';

interface Activity {
  id: string;
  name: string;
  type: string;
}

interface CustomerPricingRulesTabProps {
  customerId: string;
}

const METHOD_LABELS: Record<PricingMethod, string> = {
  [PricingMethod.HOURLY]: 'Hourly',
  [PricingMethod.PER_CARTON]: 'Per Carton',
  [PricingMethod.PER_PIECE]: 'Per Piece',
  [PricingMethod.QUANTITY]: 'Quantity-Based'
};

const METHOD_BADGE_VARIANTS: Record<PricingMethod, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  [PricingMethod.HOURLY]: 'default',
  [PricingMethod.PER_CARTON]: 'secondary',
  [PricingMethod.PER_PIECE]: 'outline',
  [PricingMethod.QUANTITY]: 'secondary'
};

interface RuleFormState {
  customerActivityId: string; // '' = all activities (customer default)
  method: PricingMethod;
  hourlyRate: string;
  cartonRate: string;
  articleRate: string;
  effectiveFrom: string;
  effectiveTo: string;
}

const emptyForm = (): RuleFormState => ({
  customerActivityId: '',
  method: PricingMethod.QUANTITY,
  hourlyRate: '',
  cartonRate: '',
  articleRate: '',
  effectiveFrom: new Date().toISOString().split('T')[0],
  effectiveTo: ''
});

export const CustomerPricingRulesTab = ({ customerId }: CustomerPricingRulesTabProps) => {
  const { data: session } = useSession();
  const [rules, setRules] = useState<CustomerPricingRule[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editRule, setEditRule] = useState<CustomerPricingRule | null>(null);
  const [form, setForm] = useState<RuleFormState>(emptyForm());

  useEffect(() => {
    if (session?.accessToken) {
      fetchRules();
      fetchActivities();
    }
  }, [session, customerId]);

  const fetchRules = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: CustomerPricingRule[] }>(
        `/api/billing/customers/${customerId}/rules`
      );
      setRules(response.data || []);
    } catch {
      toast.error('Failed to load pricing rules');
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Activity[] }>(
        `/api/pricing/customers/${customerId}/activities`
      );
      setActivities(response.data || []);
    } catch {
      // non-critical
    }
  };

  const handleOpenAdd = () => {
    setForm(emptyForm());
    setAddOpen(true);
  };

  const handleOpenEdit = (rule: CustomerPricingRule) => {
    setEditRule(rule);
    setForm({
      customerActivityId: rule.customerActivityId ?? '',
      method: rule.method,
      hourlyRate: rule.hourlyRate != null ? String(rule.hourlyRate) : '',
      cartonRate: rule.cartonRate != null ? String(rule.cartonRate) : '',
      articleRate: rule.articleRate != null ? String(rule.articleRate) : '',
      effectiveFrom: rule.effectiveFrom.split('T')[0],
      effectiveTo: rule.effectiveTo ? rule.effectiveTo.split('T')[0] : ''
    });
    setAddOpen(true);
  };

  const handleClose = () => {
    setAddOpen(false);
    setEditRule(null);
    setForm(emptyForm());
  };

  const handleSubmit = async () => {
    try {
      const payload: Record<string, any> = {
        method: form.method,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || undefined,
        customerActivityId: form.customerActivityId || undefined
      };

      if (form.method === PricingMethod.HOURLY) {
        if (!form.hourlyRate) return toast.error('Hourly rate is required');
        payload.hourlyRate = parseFloat(form.hourlyRate);
      } else if (form.method === PricingMethod.PER_CARTON) {
        if (!form.cartonRate) return toast.error('Carton rate is required');
        payload.cartonRate = parseFloat(form.cartonRate);
      } else if (form.method === PricingMethod.PER_PIECE) {
        if (!form.articleRate) return toast.error('Article/piece rate is required');
        payload.articleRate = parseFloat(form.articleRate);
      }

      if (editRule) {
        await apiClient.put(`/api/billing/customers/${customerId}/rules/${editRule.id}`, payload);
        toast.success('Pricing rule updated');
      } else {
        await apiClient.post(`/api/billing/customers/${customerId}/rules`, payload);
        toast.success('Pricing rule created');
      }

      handleClose();
      fetchRules();
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || 'Failed to save pricing rule');
    }
  };

  const handleDelete = async (rule: CustomerPricingRule) => {
    if (!confirm('Deactivate this pricing rule?')) return;
    try {
      await apiClient.delete(`/api/billing/customers/${customerId}/rules/${rule.id}`);
      toast.success('Pricing rule deactivated');
      fetchRules();
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate rule');
    }
  };

  const getRateDisplay = (rule: CustomerPricingRule) => {
    if (rule.method === PricingMethod.HOURLY && rule.hourlyRate != null) {
      return `€${Number(rule.hourlyRate).toFixed(2)}/hr`;
    }
    if (rule.method === PricingMethod.PER_CARTON && rule.cartonRate != null) {
      return `€${Number(rule.cartonRate).toFixed(2)}/carton`;
    }
    if (rule.method === PricingMethod.PER_PIECE && rule.articleRate != null) {
      return `€${Number(rule.articleRate).toFixed(2)}/piece`;
    }
    return '— (uses price tiers)';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Pricing Rules
          </CardTitle>
          <Button onClick={handleOpenAdd} size="sm">
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead className="hidden sm:table-cell">Effective From</TableHead>
                  <TableHead className="hidden sm:table-cell">Effective To</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      {rule.customerActivity?.name ?? 'All Activities (Default)'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={METHOD_BADGE_VARIANTS[rule.method]}>
                        {METHOD_LABELS[rule.method]}
                      </Badge>
                    </TableCell>
                    <TableCell>{getRateDisplay(rule)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(rule.effectiveFrom).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {rule.effectiveTo ? new Date(rule.effectiveTo).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(rule)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(rule)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pricing rules configured</p>
            <p className="text-sm">Add a rule to define how this customer is billed</p>
          </div>
        )}
      </CardContent>

      {/* Add / Edit Dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Activity selector */}
            <div className="space-y-1">
              <Label>Activity</Label>
              <Select
                value={form.customerActivityId}
                onValueChange={(v) => setForm((f) => ({ ...f, customerActivityId: v === '__default__' ? '' : v }))}
                disabled={!!editRule}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Activities (Customer Default)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__default__">All Activities (Customer Default)</SelectItem>
                  {activities.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Method selector */}
            <div className="space-y-1">
              <Label>Pricing Method</Label>
              <Select
                value={form.method}
                onValueChange={(v) => setForm((f) => ({ ...f, method: v as PricingMethod }))}
                disabled={!!editRule}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PricingMethod).map((m) => (
                    <SelectItem key={m} value={m}>{METHOD_LABELS[m]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional rate input */}
            {form.method === PricingMethod.HOURLY && (
              <div className="space-y-1">
                <Label>Hourly Rate (€/hr)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.hourlyRate}
                  onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            )}
            {form.method === PricingMethod.PER_CARTON && (
              <div className="space-y-1">
                <Label>Carton Rate (€/carton)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cartonRate}
                  onChange={(e) => setForm((f) => ({ ...f, cartonRate: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            )}
            {form.method === PricingMethod.PER_PIECE && (
              <div className="space-y-1">
                <Label>Article / Piece Rate (€/piece)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.articleRate}
                  onChange={(e) => setForm((f) => ({ ...f, articleRate: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            )}
            {form.method === PricingMethod.QUANTITY && (
              <p className="text-sm text-muted-foreground">
                Quantity-based pricing uses the existing price tiers configured in the Pricing tab.
              </p>
            )}

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Effective From</Label>
                <Input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Effective To (optional)</Label>
                <Input
                  type="date"
                  value={form.effectiveTo}
                  onChange={(e) => setForm((f) => ({ ...f, effectiveTo: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit}>{editRule ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CustomerPricingRulesTab;

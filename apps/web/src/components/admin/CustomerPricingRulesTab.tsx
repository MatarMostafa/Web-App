'use client';

import { useState, useEffect } from 'react';
import { Edit, Settings2, Power } from 'lucide-react';
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
import { CustomerPricingRule } from '@/types/order';

interface Activity {
  id: string;
  name: string;
  type: string;
}

interface CustomerPricingRulesTabProps {
  customerId: string;
}

interface RuleFormState {
  customerActivityId: string;
  hourlyRate: string;
  cartonRate: string;
  pieceRate: string;
  articleRate: string;
  effectiveFrom: string;
  effectiveTo: string;
}

const emptyForm = (): RuleFormState => ({
  customerActivityId: '',
  hourlyRate: '',
  cartonRate: '',
  pieceRate: '',
  articleRate: '',
  effectiveFrom: new Date().toISOString().split('T')[0],
  effectiveTo: ''
});

const rateDisplay = (rate: number | null | undefined, unit: string) =>
  rate != null ? `€${Number(rate).toFixed(2)}/${unit}` : null;

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
      hourlyRate: rule.hourlyRate != null ? String(rule.hourlyRate) : '',
      cartonRate: rule.cartonRate != null ? String(rule.cartonRate) : '',
      pieceRate: rule.pieceRate != null ? String(rule.pieceRate) : '',
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
      if (!form.hourlyRate && !form.cartonRate && !form.pieceRate && !form.articleRate) {
        return toast.error('At least one rate must be provided');
      }

      const payload: Record<string, any> = {
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || undefined,
        customerActivityId: form.customerActivityId || undefined,
        hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
        cartonRate: form.cartonRate ? parseFloat(form.cartonRate) : undefined,
        pieceRate: form.pieceRate ? parseFloat(form.pieceRate) : undefined,
        articleRate: form.articleRate ? parseFloat(form.articleRate) : undefined
      };

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

  const handleToggleActive = async (rule: CustomerPricingRule) => {
    const action = rule.isActive ? 'Deactivate' : 'Activate';
    if (!confirm(`${action} this pricing rule?`)) return;
    try {
      if (rule.isActive) {
        await apiClient.delete(`/api/billing/customers/${customerId}/rules/${rule.id}`);
        toast.success('Pricing rule deactivated');
      } else {
        await apiClient.put(`/api/billing/customers/${customerId}/rules/${rule.id}`, { isActive: true });
        toast.success('Pricing rule activated');
      }
      fetchRules();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action.toLowerCase()} rule`);
    }
  };

  const getActiveRateSummary = (rule: CustomerPricingRule) => {
    const parts: string[] = [];
    if (rule.hourlyRate != null) parts.push(`€${Number(rule.hourlyRate).toFixed(2)}/hr`);
    if (rule.cartonRate != null) parts.push(`€${Number(rule.cartonRate).toFixed(2)}/carton`);
    if (rule.pieceRate != null) parts.push(`€${Number(rule.pieceRate).toFixed(2)}/piece`);
    if (rule.articleRate != null) parts.push(`€${Number(rule.articleRate).toFixed(2)}/article`);
    return parts.length > 0 ? parts.join(' + ') : '— (uses price tiers)';
  };

  const getActiveMethodBadges = (rule: CustomerPricingRule) => {
    const methods: string[] = [];
    if (rule.hourlyRate != null) methods.push('HOURLY');
    if (rule.cartonRate != null) methods.push('PER_CARTON');
    if (rule.pieceRate != null) methods.push('PER_PIECE');
    if (rule.articleRate != null) methods.push('PER_ARTICLE');
    if (methods.length === 0) methods.push('QUANTITY');
    return methods;
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
                  <TableHead>Active Methods</TableHead>
                  <TableHead>Rates</TableHead>
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
                      <div className="flex flex-wrap gap-1">
                        {getActiveMethodBadges(rule).map((m) => (
                          <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{getActiveRateSummary(rule)}</TableCell>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(rule)}
                          title={rule.isActive ? 'Deactivate' : 'Activate'}
                          className={rule.isActive ? 'text-red-500 hover:text-red-600' : 'text-green-600 hover:text-green-700'}
                        >
                          <Power className="w-4 h-4" />
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

      <Dialog open={addOpen} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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

            <p className="text-sm text-muted-foreground">
              Set any combination of rates — each active rate generates an independent billing line item.
              Leave a rate blank to disable that pricing method.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Hourly Rate (€/hr)</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={form.hourlyRate}
                  onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
                  placeholder="—"
                />
              </div>
              <div className="space-y-1">
                <Label>Carton Rate (€/carton)</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={form.cartonRate}
                  onChange={(e) => setForm((f) => ({ ...f, cartonRate: e.target.value }))}
                  placeholder="—"
                />
              </div>
              <div className="space-y-1">
                <Label>Piece Rate (€/piece)</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={form.pieceRate}
                  onChange={(e) => setForm((f) => ({ ...f, pieceRate: e.target.value }))}
                  placeholder="—"
                />
              </div>
              <div className="space-y-1">
                <Label>Article Rate (€/article type)</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={form.articleRate}
                  onChange={(e) => setForm((f) => ({ ...f, articleRate: e.target.value }))}
                  placeholder="—"
                />
              </div>
            </div>

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

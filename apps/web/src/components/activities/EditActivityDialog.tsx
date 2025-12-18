import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';

interface EditActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  customers: any[];
  onSubmit: (e: React.FormEvent) => void;
}

export const EditActivityDialog = ({ open, onOpenChange, formData, setFormData, customers, onSubmit }: EditActivityDialogProps) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('activities.editActivity')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>{t('activities.form.customer')} *</Label>
            <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })} required>
              <SelectTrigger>
                <SelectValue placeholder={t('activities.form.selectCustomer')} />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(customers) && customers.length > 0 ? customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </SelectItem>
                )) : (
                  <SelectItem value="no-customers" disabled>{t('activities.form.noCustomersAvailable')}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('activities.form.name')} *</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div>
            <Label>{t('activities.form.code')}</Label>
            <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
          </div>
          <div>
            <Label>{t('activities.form.defaultPrice')} *</Label>
            <Input type="number" step="0.01" value={formData.defaultPrice} onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })} required />
          </div>
          <div>
            <Label>{t('activities.form.unit')}</Label>
            <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
          </div>
          <Button type="submit" className="w-full">{t('activities.form.update')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
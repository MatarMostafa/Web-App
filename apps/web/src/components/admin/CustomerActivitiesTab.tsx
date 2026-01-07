'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Activity as ActivityIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';
import { useSession } from 'next-auth/react';
import { AddActivityDialog } from '@/components/activities/AddActivityDialog';
import { EditActivityDialog } from '@/components/activities/EditActivityDialog';
import { useTranslation } from '@/hooks/useTranslation';
import { ActivityType } from '@/types/order';

interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  code?: string;
  unit: string;
  isActive: boolean;
  customerPrices?: Array<{
    id: string;
    minQuantity: number;
    maxQuantity: number;
    price: number;
    currency: string;
    effectiveFrom?: string;
  }>;
}

const ACTIVITY_TYPE_LABELS = {
  [ActivityType.CONTAINER_UNLOADING]: 'Container Unloading',
  [ActivityType.WRAPPING]: 'Wrapping',
  [ActivityType.REPACKING]: 'Repacking',
  [ActivityType.CROSSING]: 'Crossing',
  [ActivityType.LABELING]: 'Labeling',
  [ActivityType.OTHER]: 'Other'
};

interface CustomerActivitiesTabProps {
  customerId: string;
}

export const CustomerActivitiesTab = ({ customerId }: CustomerActivitiesTabProps) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      fetchActivities();
    }
  }, [session, customerId]);

  const fetchActivities = async () => {
    try {
      // Fetch only activities available for this specific customer
      const response = await apiClient.get<{success: boolean, data: Activity[]}>(`/api/pricing/customers/${customerId}/activities`);
      setActivities(response.data || []);
    } catch (error) {
      toast.error(t('activities.messages.loadError'));
    }
  };

  const handleAddSubmit = async (data: {
    name: string;
    type: ActivityType;
    code: string;
    unit: string;
    priceRanges: Array<{ minQuantity: number; maxQuantity: number; price: number; validFrom: string }>;
  }): Promise<void> => {
    try {
      // Create activity
      const activity = await apiClient.post<Activity>('/api/pricing/activities', {
        name: data.name,
        type: data.type,
        code: data.code || undefined,
        unit: data.unit
      });

      // Create customer prices
      await Promise.all(
        data.priceRanges.map(range =>
          apiClient.post(`/api/pricing/customers/${customerId}/prices`, {
            activityId: activity.id,
            minQuantity: range.minQuantity,
            maxQuantity: range.maxQuantity,
            price: range.price,
            effectiveFrom: new Date(range.validFrom).toISOString()
          })
        )
      );

      toast.success(t('activities.messages.createSuccess'));
      setAddDialogOpen(false);
      fetchActivities();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || t('activities.messages.createError');
      toast.error(errorMessage);
      throw error; // Re-throw to prevent form reset on error
    }
  };

  const handleEditSubmit = async (data: {
    name: string;
    type: ActivityType;
    code: string;
    unit: string;
    priceRanges: Array<{ minQuantity: number; maxQuantity: number; price: number; validFrom: string }>;
  }) => {
    if (!editingActivity) return;
    try {
      // Update activity
      await apiClient.put(`/api/pricing/activities/${editingActivity.id}`, {
        name: data.name,
        type: data.type,
        code: data.code,
        unit: data.unit
      });

      // Delete existing customer prices
      if (editingActivity.customerPrices) {
        await Promise.all(
          editingActivity.customerPrices.map(price =>
            apiClient.delete(`/api/pricing/customers/${customerId}/prices/${price.id}`)
          )
        );
      }

      // Create new customer prices
      await Promise.all(
        data.priceRanges.map(range =>
          apiClient.post(`/api/pricing/customers/${customerId}/prices`, {
            activityId: editingActivity.id,
            minQuantity: range.minQuantity,
            maxQuantity: range.maxQuantity,
            price: range.price,
            effectiveFrom: new Date(range.validFrom).toISOString()
          })
        )
      );

      toast.success(t('activities.messages.updateSuccess'));
      setEditDialogOpen(false);
      setEditingActivity(null);
      fetchActivities();
    } catch (error: any) {
      toast.error(error.message || t('activities.messages.updateError'));
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('activities.confirmDelete'))) return;
    try {
      await apiClient.delete(`/api/pricing/activities/${id}`);
      toast.success(t('activities.messages.deleteSuccess'));
      fetchActivities();
    } catch (error: any) {
      toast.error(error.message || t('activities.messages.deleteError'));
    }
  };

  const formatPriceRanges = (prices?: Activity['customerPrices']) => {
    if (!prices || prices.length === 0) return 'No pricing';
    return prices.map(p => {
      const validFrom = p.effectiveFrom ? ` (from ${new Date(p.effectiveFrom).toLocaleDateString()})` : '';
      return `${p.minQuantity}-${p.maxQuantity}: €${p.price}${validFrom}`;
    }).join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            {t('activities.title')}
          </CardTitle>
          <AddActivityDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            customerId={customerId}
            onSubmit={handleAddSubmit}
          />
        </div>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('activities.table.name')}</TableHead>
                  <TableHead>{t('activities.table.type')}</TableHead>
                  <TableHead>{t('activities.table.code')}</TableHead>
                  <TableHead>{t('activities.table.unit')}</TableHead>
                  <TableHead>Price Ranges (Valid From)</TableHead>
                  <TableHead>{t('activities.table.status')}</TableHead>
                  <TableHead>{t('activities.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity: Activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.name}</TableCell>
                    <TableCell>{ACTIVITY_TYPE_LABELS[activity.type]}</TableCell>
                    <TableCell>{activity.code || '-'}</TableCell>
                    <TableCell>{activity.unit}</TableCell>
                    <TableCell className="max-w-xs truncate" title={formatPriceRanges(activity.customerPrices)}>
                      {formatPriceRanges(activity.customerPrices)}
                    </TableCell>
                    <TableCell>{activity.isActive ? t('activities.table.active') : t('activities.table.inactive')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(activity)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(activity.id)}>
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
            <ActivityIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('activities.noActivities')}</p>
            <p className="text-sm">{t('activities.noActivitiesDesc')}</p>
          </div>
        )}
      </CardContent>

      <EditActivityDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        activity={editingActivity}
        customerId={customerId}
        onSubmit={handleEditSubmit}
      />
    </Card>
  );
};

export default CustomerActivitiesTab;
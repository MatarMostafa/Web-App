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
  prices?: Array<{
    id: string;
    minQuantity: number;
    maxQuantity: number;
    price: number;
    currency: string;
    effectiveFrom?: string;
  }>;
}



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
      const response = await apiClient.get<{ success: boolean, data: Activity[] }>(`/api/pricing/customers/${customerId}/activities`);
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
    basePrice: number;
    articleBasePrice: number;
    priceRanges: Array<{ minQuantity: number; maxQuantity: number; price: number; validFrom: string }>;
  }): Promise<void> => {
    try {
      // Create activity with price ranges in a single request (backend handles transaction)
      await apiClient.post<Activity>('/api/pricing/activities', {
        name: data.name,
        type: data.type,
        code: data.code || undefined,
        unit: data.unit,
        basePrice: data.basePrice,
        articleBasePrice: data.articleBasePrice,
        customerId,
        priceRanges: data.priceRanges
      });

      toast.success(t('activities.messages.createSuccess'));
      setAddDialogOpen(false);
      fetchActivities();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || t('activities.messages.createError');
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleEditSubmit = async (data: {
    name: string;
    type: ActivityType;
    code: string;
    unit: string;
    basePrice: number;
    articleBasePrice: number;
    priceRanges: Array<{ minQuantity: number; maxQuantity: number; price: number; validFrom: string }>;
  }) => {
    if (!editingActivity) return;
    try {
      // Update activity with price ranges in a single request (backend handles transaction)
      await apiClient.put(`/api/pricing/activities/${editingActivity.id}`, {
        name: data.name,
        type: data.type,
        code: data.code,
        unit: data.unit,
        basePrice: data.basePrice,
        articleBasePrice: data.articleBasePrice,
        customerId,
        priceRanges: data.priceRanges
      });

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

  const formatPriceRanges = (prices?: Activity['prices']) => {
    if (!prices || prices.length === 0) return t('activities.messages.noPricing');
    return prices.map(p => {
      const validFrom = p.effectiveFrom ? ` (${t('activities.messages.from')} ${new Date(p.effectiveFrom).toLocaleDateString()})` : '';
      return `${p.minQuantity}-${p.maxQuantity}: €${p.price}${validFrom}`;
    }).join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            {t('activities.title')}
          </CardTitle>
          <div className="w-full sm:w-auto">
            <AddActivityDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              customerId={customerId}
              onSubmit={handleAddSubmit}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('activities.table.name')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('activities.table.type')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('activities.table.code')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('activities.table.unit')}</TableHead>
                  <TableHead>{t('activities.form.priceRanges')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('activities.table.status')}</TableHead>
                  <TableHead className="text-right">{t('activities.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity: Activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{t(`activities.types.${activity.type}`)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{activity.code || '-'}</TableCell>
                    <TableCell className="hidden sm:table-cell">{activity.unit}</TableCell>
                    <TableCell className="max-w-[120px] sm:max-w-xs truncate" title={formatPriceRanges(activity.prices)}>
                      {formatPriceRanges(activity.prices)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{activity.isActive ? t('activities.table.active') : t('activities.table.inactive')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
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
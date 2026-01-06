'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
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
}

const ACTIVITY_TYPE_LABELS = {
  [ActivityType.CONTAINER_UNLOADING]: 'Container Unloading',
  [ActivityType.WRAPPING]: 'Wrapping',
  [ActivityType.REPACKING]: 'Repacking',
  [ActivityType.CROSSING]: 'Crossing',
  [ActivityType.LABELING]: 'Labeling',
  [ActivityType.OTHER]: 'Other'
};

export const ActivitiesPage = () => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [addFormData, setAddFormData] = useState({ 
    name: '', 
    type: ActivityType.CONTAINER_UNLOADING, 
    code: '', 
    unit: 'hour' 
  });
  const [editFormData, setEditFormData] = useState({ 
    name: '', 
    type: ActivityType.CONTAINER_UNLOADING, 
    code: '', 
    unit: 'hour' 
  });

  useEffect(() => {
    if (session?.accessToken) {
      fetchActivities();
    }
  }, [session]);

  const fetchActivities = async () => {
    try {
      const data = await apiClient.get<Activity[]>('/api/pricing/activities');
      setActivities(data);
    } catch (error) {
      toast.error(t('activities.messages.loadError'));
    }
  };

  const handleAddSubmit = async (data: { name: string; type: ActivityType; code: string; unit: string; priceRanges?: any[] }) => {
    try {
      // Extract only the activity data, ignore priceRanges for now
      const { priceRanges, ...activityData } = data;
      await apiClient.post('/api/pricing/activities', activityData);
      toast.success(t('activities.messages.createSuccess'));
      setAddDialogOpen(false);
      setAddFormData({ name: '', type: ActivityType.CONTAINER_UNLOADING, code: '', unit: 'hour' });
      fetchActivities();
    } catch (error: any) {
      toast.error(error.message || t('activities.messages.createError'));
    }
  };

  const handleEditSubmit = async (data: { name: string; type: ActivityType; code: string; unit: string; priceRanges?: any[] }) => {
    if (!editingActivity) return;
    try {
      // Extract only the activity data, ignore priceRanges for now
      const { priceRanges, ...activityData } = data;
      await apiClient.put(`/api/pricing/activities/${editingActivity.id}`, activityData);
      toast.success(t('activities.messages.updateSuccess'));
      setEditDialogOpen(false);
      setEditingActivity(null);
      setEditFormData({ name: '', type: ActivityType.CONTAINER_UNLOADING, code: '', unit: 'hour' });
      fetchActivities();
    } catch (error: any) {
      toast.error(error.message || t('activities.messages.updateError'));
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setEditFormData({
      name: activity.name,
      type: activity.type,
      code: activity.code || '',
      unit: activity.unit
    });
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('activities.title')}</h1>
        <AddActivityDialog
          open={addDialogOpen}
          onOpenChange={(open) => {
            setAddDialogOpen(open);
            if (!open) setAddFormData({ name: '', type: ActivityType.CONTAINER_UNLOADING, code: '', unit: 'hour' });
          }}
          customerId="" // Not needed for general activities
          onSubmit={handleAddSubmit}
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('activities.table.name')}</TableHead>
              <TableHead>{t('activities.table.type')}</TableHead>
              <TableHead>{t('activities.table.code')}</TableHead>
              <TableHead>{t('activities.table.unit')}</TableHead>
              <TableHead>{t('activities.table.status')}</TableHead>
              <TableHead>{t('activities.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{activity.name}</TableCell>
                <TableCell>{ACTIVITY_TYPE_LABELS[activity.type]}</TableCell>
                <TableCell>{activity.code || '-'}</TableCell>
                <TableCell>{activity.unit}</TableCell>
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
      </Card>

      <EditActivityDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditingActivity(null);
            setEditFormData({ name: '', type: ActivityType.CONTAINER_UNLOADING, code: '', unit: 'hour' });
          }
        }}
        activity={editingActivity}
        customerId="" // Not needed for general activities
        onSubmit={handleEditSubmit}
      />
    </div>
  );
};
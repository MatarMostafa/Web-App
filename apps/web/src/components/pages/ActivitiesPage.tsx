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

interface Activity {
  id: string;
  name: string;
  code?: string;
  defaultPrice: number;
  unit: string;
  isActive: boolean;
  customerActivities?: {
    id: string;
    customerId: string;
    customer: {
      id: string;
      companyName: string;
    };
  }[];
}

export const ActivitiesPage = () => {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [addFormData, setAddFormData] = useState({ name: '', code: '', defaultPrice: '', unit: 'hour', customerId: '' });
  const [editFormData, setEditFormData] = useState({ name: '', code: '', defaultPrice: '', unit: 'hour', customerId: '' });

  useEffect(() => {
    if (session?.accessToken) {
      fetchActivities();
      fetchCustomers();
    }
  }, [session]);

  const fetchCustomers = async () => {
    if (!session?.accessToken) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.success ? result.data : result;
        setCustomers(Array.isArray(data) ? data : []);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      setCustomers([]);
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await apiClient.get<Activity[]>('/api/pricing/activities');
      setActivities(data);
    } catch (error) {
      toast.error('Failed to load activities');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/pricing/customer-activities', {
        ...addFormData,
        defaultPrice: parseFloat(addFormData.defaultPrice)
      });
      toast.success('Customer activity created');
      setAddDialogOpen(false);
      setAddFormData({ name: '', code: '', defaultPrice: '', unit: 'hour', customerId: '' });
      fetchActivities();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save activity');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    try {
      await apiClient.put('/api/pricing/customer-activities', {
        ...editFormData,
        defaultPrice: parseFloat(editFormData.defaultPrice)
      });
      toast.success('Customer activity updated');
      setEditDialogOpen(false);
      setEditingActivity(null);
      setEditFormData({ name: '', code: '', defaultPrice: '', unit: 'hour', customerId: '' });
      fetchActivities();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save activity');
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    const customerId = activity.customerActivities?.[0]?.customerId || '';
    setEditFormData({
      name: activity.name,
      code: activity.code || '',
      defaultPrice: activity.defaultPrice.toString(),
      unit: activity.unit,
      customerId
    });
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await apiClient.delete(`/api/pricing/activities/${id}`);
      toast.success('Activity deleted');
      fetchActivities();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete activity');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        <AddActivityDialog
          open={addDialogOpen}
          onOpenChange={(open) => {
            setAddDialogOpen(open);
            if (!open) setAddFormData({ name: '', code: '', defaultPrice: '', unit: 'hour', customerId: '' });
          }}
          formData={addFormData}
          setFormData={setAddFormData}
          customers={customers}
          onSubmit={handleAddSubmit}
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Default Price</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{activity.name}</TableCell>
                <TableCell>{activity.code || '-'}</TableCell>
                <TableCell>€{Number(activity.defaultPrice).toFixed(2)}</TableCell>
                <TableCell>{activity.unit}</TableCell>
                <TableCell>{activity.isActive ? 'Active' : 'Inactive'}</TableCell>
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
            setEditFormData({ name: '', code: '', defaultPrice: '', unit: 'hour', customerId: '' });
          }
        }}
        formData={editFormData}
        setFormData={setEditFormData}
        customers={customers}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
};
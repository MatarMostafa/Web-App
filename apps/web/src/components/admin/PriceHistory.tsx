'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceHistoryProps {
  customerId: string;
}

interface Activity {
  id: string;
  name: string;
}

interface PricePoint {
  effectiveFrom: string;
  price: number;
  isActive: boolean;
}

export default function PriceHistory({ customerId }: PriceHistoryProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [history, setHistory] = useState<PricePoint[]>([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (selectedActivity) {
      fetchHistory();
    }
  }, [selectedActivity]);

  const fetchActivities = async () => {
    try {
      const { data } = await api.get('/pricing/activities');
      setActivities(data);
    } catch (error) {
      toast.error('Failed to load activities');
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get(`/pricing/customers/${customerId}/prices`);
      const filtered = data
        .filter((p: any) => p.activityId === selectedActivity)
        .sort((a: any, b: any) => new Date(a.effectiveFrom).getTime() - new Date(b.effectiveFrom).getTime());
      setHistory(filtered);
    } catch (error) {
      toast.error('Failed to load history');
    }
  };

  const chartData = history.map((h) => ({
    date: new Date(h.effectiveFrom).toLocaleDateString(),
    price: h.price
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Select Activity</Label>
        <Select value={selectedActivity} onValueChange={setSelectedActivity}>
          <SelectTrigger>
            <SelectValue placeholder="Choose activity" />
          </SelectTrigger>
          <SelectContent>
            {activities.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {history.length > 0 && (
        <>
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#8884d8" name="Price (EUR)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h, i) => (
                  <TableRow key={i}>
                    <TableCell>{new Date(h.effectiveFrom).toLocaleDateString()}</TableCell>
                    <TableCell>€{h.price.toFixed(2)}</TableCell>
                    <TableCell>{h.isActive ? 'Active' : 'Inactive'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Order {
  id: string;
  orderNumber: string;
  scheduledDate: string;
  customer: { companyName: string };
  qualifications: Array<{
    activity?: { name: string };
    unitPrice?: number;
    quantity: number;
    lineTotal?: number;
  }>;
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [groupBy, setGroupBy] = useState<'customer' | 'activity'>('customer');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await apiClient.get<Order[]>('/orders');
      setOrders(data || []);
    } catch (error) {
      toast.error('Failed to load orders');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const date = new Date(o.scheduledDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const revenueByCustomer = filteredOrders.reduce((acc, order) => {
    const customer = order.customer.companyName;
    const total = order.qualifications.reduce((sum, q) => sum + (q.lineTotal || 0), 0);
    acc[customer] = (acc[customer] || 0) + total;
    return acc;
  }, {} as Record<string, number>);

  const revenueByActivity = filteredOrders.reduce((acc, order) => {
    order.qualifications.forEach((q) => {
      const activity = q.activity?.name || 'Unknown';
      acc[activity] = (acc[activity] || 0) + (q.lineTotal || 0);
    });
    return acc;
  }, {} as Record<string, number>);

  const chartData = groupBy === 'customer'
    ? Object.entries(revenueByCustomer).map(([name, revenue]) => ({ name, revenue }))
    : Object.entries(revenueByActivity).map(([name, revenue]) => ({ name, revenue }));

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Revenue Analytics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div>
              <Label>Group By</Label>
              <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">€{totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredOrders.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by {groupBy === 'customer' ? 'Customer' : 'Activity'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue (EUR)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={chartData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={150} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

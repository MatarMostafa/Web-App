'use client';

import { useState } from 'react';
import { Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';

interface BulkPriceImportProps {
  customerId: string;
  onImportComplete: () => void;
}

export default function BulkPriceImport({ customerId, onImportComplete }: BulkPriceImportProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const downloadTemplate = () => {
    const csv = 'activityId,price,effectiveFrom,effectiveTo\n' +
                'activity-id-1,75.00,2025-01-01,\n' +
                'activity-id-2,85.50,2025-01-01,2025-12-31';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'price-import-template.csv';
    a.click();
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').slice(1);
      let success = 0;
      let failed = 0;

      for (const line of lines) {
        if (!line.trim()) continue;
        const [activityId, price, effectiveFrom, effectiveTo] = line.split(',');
        
        try {
          await api.post(`/pricing/customers/${customerId}/prices`, {
            activityId: activityId.trim(),
            price: parseFloat(price),
            effectiveFrom: new Date(effectiveFrom.trim()).toISOString(),
            effectiveTo: effectiveTo?.trim() ? new Date(effectiveTo.trim()).toISOString() : null,
            isActive: true
          });
          success++;
        } catch {
          failed++;
        }
      }

      toast.success(`Imported ${success} prices, ${failed} failed`);
      setDialogOpen(false);
      setFile(null);
      onImportComplete();
    } catch (error) {
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Bulk Import</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import Prices</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button variant="outline" onClick={downloadTemplate} className="w-full">
            <Download className="w-4 h-4 mr-2" />Download CSV Template
          </Button>
          <div>
            <Label>Upload CSV File</Label>
            <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <Button onClick={handleImport} disabled={!file || importing} className="w-full">
            {importing ? 'Importing...' : 'Import'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

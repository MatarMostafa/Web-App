import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Container {
  id: string;
  serialNumber: string;
  cartonQuantity: number;
  articleQuantity: number;
  cartonPrice: number;
  articlePrice: number;
}

interface EditContainerDialogProps {
  container: Container;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditContainerDialog: React.FC<EditContainerDialogProps> = ({
  container,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    serialNumber: container.serialNumber,
    cartonQuantity: container.cartonQuantity,
    articleQuantity: container.articleQuantity,
    cartonPrice: container.cartonPrice,
    articlePrice: container.articlePrice
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serialNumber || formData.cartonQuantity <= 0 || formData.articleQuantity <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields with valid values',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/containers/${container.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Container updated successfully'
        });
        onSuccess();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update container');
      }
    } catch (error) {
      console.error('Error updating container:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update container',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const containerTotal = formData.cartonQuantity * formData.cartonPrice;
    const articleTotal = formData.articleQuantity * formData.articlePrice;
    return containerTotal + articleTotal;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Container</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="serialNumber">Serial Number *</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => handleInputChange('serialNumber', e.target.value)}
              placeholder="Enter serial number"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cartonQuantity">Carton Quantity *</Label>
              <Input
                id="cartonQuantity"
                type="number"
                min="1"
                value={formData.cartonQuantity}
                onChange={(e) => handleInputChange('cartonQuantity', parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="cartonPrice">Carton Price (€) *</Label>
              <Input
                id="cartonPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.cartonPrice}
                onChange={(e) => handleInputChange('cartonPrice', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="articleQuantity">Article Quantity *</Label>
              <Input
                id="articleQuantity"
                type="number"
                min="1"
                value={formData.articleQuantity}
                onChange={(e) => handleInputChange('articleQuantity', parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="articlePrice">Article Price (€) *</Label>
              <Input
                id="articlePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.articlePrice}
                onChange={(e) => handleInputChange('articlePrice', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="flex justify-between items-center font-semibold">
              <span>Total Container Price:</span>
              <span>€{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Container'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
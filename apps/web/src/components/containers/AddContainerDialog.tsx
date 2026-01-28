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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Article {
  articleName: string;
  quantity: number;
  price: number;
}

interface AddContainerDialogProps {
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddContainerDialog: React.FC<AddContainerDialogProps> = ({
  orderId,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    serialNumber: '',
    cartonQuantity: 0,
    articleQuantity: 0,
    cartonPrice: 0,
    articlePrice: 0
  });
  const [articles, setArticles] = useState<Article[]>([]);
  const [newArticle, setNewArticle] = useState<Article>({
    articleName: '',
    quantity: 0,
    price: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddArticle = () => {
    if (!newArticle.articleName || newArticle.quantity <= 0 || newArticle.price <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill all article fields with valid values',
        variant: 'destructive'
      });
      return;
    }

    setArticles(prev => [...prev, { ...newArticle }]);
    setNewArticle({ articleName: '', quantity: 0, price: 0 });
  };

  const handleRemoveArticle = (index: number) => {
    setArticles(prev => prev.filter((_, i) => i !== index));
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
      const response = await fetch(`/api/containers/order/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          articles: articles.length > 0 ? articles : undefined
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Container added successfully'
        });
        onSuccess();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add container');
      }
    } catch (error) {
      console.error('Error adding container:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add container',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const containerTotal = formData.cartonQuantity * formData.cartonPrice;
    const articleTotal = formData.articleQuantity * formData.articlePrice;
    const articlesTotal = articles.reduce((sum, article) => sum + (article.quantity * article.price), 0);
    return containerTotal + articleTotal + articlesTotal;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Container</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Articles (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div>
                  <Label htmlFor="articleName">Article Name</Label>
                  <Input
                    id="articleName"
                    value={newArticle.articleName}
                    onChange={(e) => setNewArticle(prev => ({ ...prev, articleName: e.target.value }))}
                    placeholder="Article name"
                  />
                </div>
                <div>
                  <Label htmlFor="articleQty">Quantity</Label>
                  <Input
                    id="articleQty"
                    type="number"
                    min="1"
                    value={newArticle.quantity}
                    onChange={(e) => setNewArticle(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="articlePrc">Price (€)</Label>
                  <Input
                    id="articlePrc"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newArticle.price}
                    onChange={(e) => setNewArticle(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <Button type="button" onClick={handleAddArticle}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {articles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Added Articles:</h4>
                  {articles.map((article, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>
                        {article.articleName} - {article.quantity} × €{article.price.toFixed(2)}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveArticle(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
              {loading ? 'Adding...' : 'Add Container'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
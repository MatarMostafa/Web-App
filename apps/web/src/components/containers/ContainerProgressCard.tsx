import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Clock, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface ContainerAssignment {
  id: string;
  reportedCartonQuantity: number;
  reportedArticleQuantity: number;
  isCompleted: boolean;
  completedAt: string | null;
  notes: string | null;
  container: {
    id: string;
    serialNumber: string;
    cartonQuantity: number;
    articleQuantity: number;
    order: {
      id: string;
      orderNumber: string;
      status: string;
      scheduledDate: string;
    };
    articles: Array<{
      id: string;
      articleName: string;
      quantity: number;
      price: number;
    }>;
  };
}

interface ContainerProgressCardProps {
  assignment: ContainerAssignment;
  onUpdate: () => void;
}

export const ContainerProgressCard: React.FC<ContainerProgressCardProps> = ({
  assignment,
  onUpdate
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportedCartons, setReportedCartons] = useState(assignment.reportedCartonQuantity || 0);
  const [reportedArticles, setReportedArticles] = useState(assignment.reportedArticleQuantity || 0);
  const [notes, setNotes] = useState(assignment.notes || '');

  const handleProgressUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/container-employee/${assignment.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reportedCartonQuantity: reportedCartons,
          reportedArticleQuantity: reportedArticles,
          notes
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: t('containers.progress.updateSuccess'),
          description: t('containers.progress.updateSuccessDesc')
        });
        onUpdate();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: t('containers.progress.updateError'),
        description: error instanceof Error ? error.message : t('containers.progress.updateErrorDesc'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWork = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/container-employee/${assignment.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: t('containers.complete.success'),
          description: t('containers.complete.successDesc')
        });
        onUpdate();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: t('containers.complete.error'),
        description: error instanceof Error ? error.message : t('containers.complete.errorDesc'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`${assignment.isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t('containers.container')} {assignment.container.serialNumber}
              {assignment.isCompleted && (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t('containers.completed')}
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('containers.order')}: {assignment.container.order.orderNumber}
            </p>
          </div>
          <Badge variant="outline">
            {assignment.container.order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('containers.totalCartons')}:</span>
              <span className="font-medium">{assignment.container.cartonQuantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t('containers.totalArticles')}:</span>
              <span className="font-medium">{assignment.container.articleQuantity}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('containers.reportedCartons')}:</span>
              <span className="font-medium text-blue-600">{assignment.reportedCartonQuantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t('containers.reportedArticles')}:</span>
              <span className="font-medium text-blue-600">{assignment.reportedArticleQuantity}</span>
            </div>
          </div>
        </div>

        {!assignment.isCompleted && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reportedCartons">{t('containers.reportCartons')}</Label>
                <Input
                  id="reportedCartons"
                  type="number"
                  min="0"
                  max={assignment.container.cartonQuantity}
                  value={reportedCartons}
                  onChange={(e) => setReportedCartons(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="reportedArticles">{t('containers.reportArticles')}</Label>
                <Input
                  id="reportedArticles"
                  type="number"
                  min="0"
                  max={assignment.container.articleQuantity}
                  value={reportedArticles}
                  onChange={(e) => setReportedArticles(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">{t('containers.notes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('containers.notesPlaceholder')}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleProgressUpdate}
                disabled={loading}
                variant="outline"
              >
                <Clock className="w-4 h-4 mr-2" />
                {loading ? t('containers.updating') : t('containers.updateProgress')}
              </Button>
              <Button
                onClick={handleCompleteWork}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {loading ? t('containers.completing') : t('containers.markComplete')}
              </Button>
            </div>
          </div>
        )}

        {assignment.isCompleted && assignment.completedAt && (
          <div className="bg-green-100 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              {t('containers.completedAt')}: {new Date(assignment.completedAt).toLocaleString()}
            </p>
            {assignment.notes && (
              <p className="text-sm text-green-700 mt-1">
                {t('containers.finalNotes')}: {assignment.notes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import React, { useState, useEffect } from 'react';
import { ContainerProgressCard } from '@/components/containers/ContainerProgressCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useSession } from 'next-auth/react';

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

export const EmployeeContainersPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<ContainerAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/employee/${session.user.id}/containers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAssignments(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: t('containers.loadError'),
        description: error instanceof Error ? error.message : t('containers.loadErrorDesc'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [session?.user?.id]);

  const activeAssignments = assignments.filter(a => !a.isCompleted);
  const completedAssignments = assignments.filter(a => a.isCompleted);

  const totalCartons = assignments.reduce((sum, a) => sum + a.container.cartonQuantity, 0);
  const reportedCartons = assignments.reduce((sum, a) => sum + a.reportedCartonQuantity, 0);
  const totalArticles = assignments.reduce((sum, a) => sum + a.container.articleQuantity, 0);
  const reportedArticles = assignments.reduce((sum, a) => sum + a.reportedArticleQuantity, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('containers.myContainers')}</h1>
        <Badge variant="outline">
          {assignments.length} {t('containers.assigned')}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">{t('containers.totalCartons')}</p>
                <p className="text-lg font-semibold">{totalCartons}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">{t('containers.reportedCartons')}</p>
                <p className="text-lg font-semibold">{reportedCartons}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">{t('containers.totalArticles')}</p>
                <p className="text-lg font-semibold">{totalArticles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">{t('containers.completed')}</p>
                <p className="text-lg font-semibold">{completedAssignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Assignments */}
      {activeAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t('containers.activeWork')}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeAssignments.map((assignment) => (
              <ContainerProgressCard
                key={assignment.id}
                assignment={assignment}
                onUpdate={fetchAssignments}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Assignments */}
      {completedAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {t('containers.completedWork')}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {completedAssignments.map((assignment) => (
              <ContainerProgressCard
                key={assignment.id}
                assignment={assignment}
                onUpdate={fetchAssignments}
              />
            ))}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('containers.noAssignments')}</h3>
            <p className="text-muted-foreground">{t('containers.noAssignmentsDesc')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
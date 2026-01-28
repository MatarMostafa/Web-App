import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { AddContainerDialog } from './AddContainerDialog';
import { EditContainerDialog } from './EditContainerDialog';
import { AssignEmployeeToContainerDialog } from './AssignEmployeeToContainerDialog';
import { useToast } from '@/components/ui/use-toast';

interface Container {
  id: string;
  serialNumber: string;
  cartonQuantity: number;
  articleQuantity: number;
  cartonPrice: number;
  articlePrice: number;
  articles: Array<{
    id: string;
    articleName: string;
    quantity: number;
    price: number;
  }>;
  employeeAssignments: Array<{
    id: string;
    role?: string;
    employee: {
      id: string;
      firstName: string;
      lastName: string;
      employeeCode: string;
    };
  }>;
}

interface ContainerManagementProps {
  orderId: string;
  isReadOnly?: boolean;
}

export const ContainerManagement: React.FC<ContainerManagementProps> = ({
  orderId,
  isReadOnly = false
}) => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);
  const [assigningContainer, setAssigningContainer] = useState<Container | null>(null);
  const { toast } = useToast();

  const fetchContainers = async () => {
    try {
      const response = await fetch(`/api/containers/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContainers(data.data);
      }
    } catch (error) {
      console.error('Error fetching containers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch containers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, [orderId]);

  const handleDeleteContainer = async (containerId: string) => {
    if (!confirm('Are you sure you want to delete this container?')) return;

    try {
      const response = await fetch(`/api/containers/${containerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Container deleted successfully'
        });
        fetchContainers();
      }
    } catch (error) {
      console.error('Error deleting container:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete container',
        variant: 'destructive'
      });
    }
  };

  const calculateContainerTotal = (container: Container) => {
    const containerPrice = container.cartonQuantity * container.cartonPrice;
    const articlePrice = container.articleQuantity * container.articlePrice;
    return containerPrice + articlePrice;
  };

  const calculateOrderTotal = () => {
    return containers.reduce((total, container) => total + calculateContainerTotal(container), 0);
  };

  if (loading) {
    return <div className="p-4">Loading containers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Containers</h3>
        {!isReadOnly && (
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Container
          </Button>
        )}
      </div>

      {containers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No containers added yet
          </CardContent>
        </Card>
      ) : (
        <>
          {containers.map((container) => (
            <Card key={container.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Container {container.serialNumber}
                    </CardTitle>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>{container.cartonQuantity} cartons</span>
                      <span>{container.articleQuantity} articles</span>
                      <span className="font-semibold">
                        Total: €{calculateContainerTotal(container).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssigningContainer(container)}
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingContainer(container)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteContainer(container.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Pricing</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Carton Price:</span>
                        <span>€{container.cartonPrice.toFixed(2)} × {container.cartonQuantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Article Price:</span>
                        <span>€{container.articlePrice.toFixed(2)} × {container.articleQuantity}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Assigned Employees</h4>
                    <div className="flex flex-wrap gap-1">
                      {container.employeeAssignments.length === 0 ? (
                        <span className="text-sm text-gray-500">No employees assigned</span>
                      ) : (
                        container.employeeAssignments.map((assignment) => (
                          <Badge key={assignment.id} variant="secondary">
                            {assignment.employee.firstName} {assignment.employee.lastName}
                            {assignment.role && ` (${assignment.role})`}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {container.articles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Articles</h4>
                    <div className="space-y-1">
                      {container.articles.map((article) => (
                        <div key={article.id} className="flex justify-between text-sm">
                          <span>{article.articleName}</span>
                          <span>{article.quantity} × €{article.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Order Total:</span>
                <span>€{calculateOrderTotal().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {showAddDialog && (
        <AddContainerDialog
          orderId={orderId}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => {
            setShowAddDialog(false);
            fetchContainers();
          }}
        />
      )}

      {editingContainer && (
        <EditContainerDialog
          container={editingContainer}
          onClose={() => setEditingContainer(null)}
          onSuccess={() => {
            setEditingContainer(null);
            fetchContainers();
          }}
        />
      )}

      {assigningContainer && (
        <AssignEmployeeToContainerDialog
          container={assigningContainer}
          onClose={() => setAssigningContainer(null)}
          onSuccess={() => {
            setAssigningContainer(null);
            fetchContainers();
          }}
        />
      )}
    </div>
  );
};
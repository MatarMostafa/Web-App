"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Search, Plus, Briefcase } from "lucide-react";
import PositionTableView from "@/components/admin/PositionTableView";
import AddPositionDialog from "@/components/admin/AddPositionDialog";
import EditPositionDialog from "@/components/admin/EditPositionDialog";
import { usePositionStore } from "@/store/positionStore";
import { Position } from "@/types/position";

const PositionsPage = () => {
  const { positions, loading, fetchPositions, deletePosition } = usePositionStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const filteredPositions = positions.filter(
    (position) =>
      position.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (position.description && position.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (position.department?.name && position.department.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this position?")) {
      await deletePosition(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Positions</h1>
          <p className="text-muted-foreground">
            Manage your organization's positions
          </p>
        </div>
        <div className="flex gap-2">
          <AddPositionDialog
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Add Position
              </Button>
            }
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search positions by title, department, or description..."
            className="pl-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <PositionTableView
        positions={filteredPositions}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {editingPosition && (
        <EditPositionDialog
          position={editingPosition}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditingPosition(null);
          }}
        />
      )}

      {!loading && positions.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-12 border rounded-lg">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No positions found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first position
          </p>
          <AddPositionDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Position
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default PositionsPage;
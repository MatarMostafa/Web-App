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
import { useTranslation } from "@/hooks/useTranslation";

const PositionsPage = () => {
  const { t, ready } = useTranslation();
  const { positions, loading, fetchPositions, deletePosition } = usePositionStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  if (!ready) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

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
    if (confirm(t("admin.positions.confirmDelete"))) {
      await deletePosition(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">{t("admin.positions.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.positions.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <AddPositionDialog
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> {t("admin.positions.addPosition")}
              </Button>
            }
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("admin.positions.searchPlaceholder")}
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
          <h3 className="text-lg font-medium mb-1">{t("admin.positions.noPositionsFound")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("admin.positions.getStartedMessage")}
          </p>
          <AddPositionDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" /> {t("admin.positions.addPosition")}
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default PositionsPage;
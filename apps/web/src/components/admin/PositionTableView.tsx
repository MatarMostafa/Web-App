"use client";
import React from "react";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Edit, Trash2, Briefcase } from "lucide-react";
import { Position } from "@/types/position";
import { format } from "date-fns";

interface PositionTableViewProps {
  positions: Position[];
  loading: boolean;
  onEdit: (position: Position) => void;
  onDelete: (id: string) => void;
}

const PositionTableView: React.FC<PositionTableViewProps> = ({
  positions,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Title</th>
              <th className="text-left p-4 font-medium">Department</th>
              <th className="text-left p-4 font-medium">Description</th>
              <th className="text-left p-4 font-medium">Created</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.id} className="border-t hover:bg-muted/25">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{position.title}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline">{position.department?.name || "N/A"}</Badge>
                </td>
                <td className="p-4">
                  <p className="text-sm text-muted-foreground max-w-xs truncate">
                    {position.description || "No description"}
                  </p>
                </td>
                <td className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(position.createdAt), "MMM d, yyyy")}
                  </p>
                </td>
                <td className="p-4">
                  <Badge variant={position.isActive ? "default" : "destructive"}>
                    {position.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(position)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(position.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionTableView;
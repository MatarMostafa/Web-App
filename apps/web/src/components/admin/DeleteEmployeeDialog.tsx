import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employeeName: string;
  loading?: boolean;
}

export const DeleteEmployeeDialog: React.FC<DeleteEmployeeDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  employeeName,
  loading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Mitarbeiter löschen
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">
                  Unwiderrufliche Aktion
                </h4>
                <p className="text-sm text-red-700">
                  Diese Aktion kann nicht rückgängig gemacht werden. Alle Mitarbeiterdaten werden dauerhaft aus dem System entfernt.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Möchten Sie den Mitarbeiter <strong>{employeeName}</strong> wirklich löschen?
            </p>
            <p className="text-sm text-gray-500">
              Folgende Daten werden gelöscht:
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside space-y-1 ml-2">
              <li>Persönliche Informationen</li>
              <li>Arbeitsverträge und Gehaltsdaten</li>
              <li>Arbeitszeiten und Leistungsdaten</li>
              <li>Zuweisungen und Projekthistorie</li>
              <li>Benutzeraccount und Anmeldedaten</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Wird gelöscht..." : "Endgültig löschen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
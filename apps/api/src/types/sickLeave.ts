// src/types/sickLeave.ts

export interface Krankmeldung {
  id?: string;
  mitarbeiterId?: string;
  von?: string;  // ISO-Datum
  bis?: string;  // ISO-Datum
  grund?: string;
  status?: "gemeldet" | "genehmigt" | "abgelehnt";
  erstelltAm?: string; // ISO-Datum
}
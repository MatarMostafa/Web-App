// src/types/leave.ts

export type UrlaubsStatus = "beantragt" | "genehmigt" | "abgelehnt"; 
// English: requested | approved | rejected

export interface Urlaub {
  id?: string;            // Unique ID of the leave
  mitarbeiterId?: string; // Employee ID
  von: string;           // Start date
  bis: string;  // End date
  kommentar?:string;         
  status?: UrlaubsStatus; // Current status of the leave
}

// Type definition for employee blocks / restrictions

/**
 * Represents a block/restriction for an employee.
 */
export interface Mitarbeitersperre {
  id: number;             // Unique ID of the block
  mitarbeiterId: number;  // Employee ID
  grund: string;          // Reason for the block
  von: string;            // Start date (YYYY-MM-DD)
  bis: string;            // End date (YYYY-MM-DD)
}

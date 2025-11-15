export type AbsenceType = "urlaub" | "krank" | "sonstiges";
// English: AbsenceType = "vacation" | "sick" | "other"

export interface Absence {
  id: number | string; // English: Absence ID
  mitarbeiterId: number | string; // English: Employee ID
  typ?: AbsenceType; // English: Type of absence
  von?: string; // English: From (start date)
  bis?: string;
  grund?: string; // English: To (end date, optional)
  datum?: string; //English: date
  kommentar?: string; // English: Comment (optional)
}

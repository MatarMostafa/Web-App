export type Rolle = "admin" | "teamleiter" | "mitarbeiter";
//Role 
export interface User {
  id: string;
  username?: string;
  email?:string;
  password: string; // bcrypt-Hash
  role?: Rolle;
}
// src/types/benachrichtigung.ts

export interface Benachrichtigung {
  id: string;           // English: Notification ID
  userId: string;       // English: Recipient User ID
  titel: string;        // English: Title
  nachricht: string;    // English: Message / Content
  gelesen: boolean;     // English: Read (true = read, false = unread)
  erstelltAm: string;   // English: Created at (timestamp / date string)
}

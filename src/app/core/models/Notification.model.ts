export interface Notification {
  id?: number;
  accountId: number;
  message: string;
  seen: boolean;
  createdAt: string; // ou Date selon le backend
}

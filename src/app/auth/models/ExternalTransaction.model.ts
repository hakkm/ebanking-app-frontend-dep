export interface ExternalTransaction {
  sourceAccountId: number;
  recipientId: number;
  amount: number;
  reason?: string;
  executedAt?: string; // Optional, as backend sets it
}

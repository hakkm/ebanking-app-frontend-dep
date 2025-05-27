export interface Account {
  id: number;
  maskedAccountNumber: string;
  balance: number; // or string, depending on JSON serialization
  currency: string;
  accountType: string;
  status: string;
  alias: string;
  createdAt?: string;
}

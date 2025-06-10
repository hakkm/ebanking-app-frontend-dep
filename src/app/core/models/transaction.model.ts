export interface Transaction {
  id?: number;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
  createdAt?: string;
}

export interface Transaction {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
}

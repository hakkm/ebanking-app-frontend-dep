export interface Transaction {
  id: number;
  fromAccountId: number;
  toAccountId: number;
  amount: string; // BigDecimal from TransactionDTO, serialized as string
  currency: string;
  status: string;
  type: string;
  description: string;
  createdAt: string; // LocalDateTime serialized as ISO string
}

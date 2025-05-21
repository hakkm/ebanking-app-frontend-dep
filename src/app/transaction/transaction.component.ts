import { Component, OnInit } from '@angular/core';
import { NgClass, NgForOf, NgIf, DatePipe, CurrencyPipe } from '@angular/common';
import { AccountService } from '../auth/services/account.service';
import { Account } from '../auth/models/account.model';

interface DisplayTransaction {
  type: 'Internal' | 'External';
  direction: 'In' | 'Out';
  amount: number;
  description: string;
  date: string;
  fromAccountId?: number;
  toAccountId?: number;
  sourceAccountId?: number;
  recipientId?: number;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [NgClass, NgForOf, NgIf, DatePipe, CurrencyPipe],
  templateUrl: './transaction.component.html'
})
export class TransactionsComponent implements OnInit {
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  transactions: DisplayTransaction[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.error = null;
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.isLoading = false;
        if (accounts.length > 0) {
          this.selectAccount(accounts[0]);
        }
      },
      error: (err) => {
        this.error = 'Failed to load accounts';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  selectAccount(account: Account): void {
    this.selectedAccount = account;
    this.transactions = [];
    this.isLoading = true;
    this.error = null;

    // Fetch internal transactions
    this.accountService.getTransactions(account.id).subscribe({
      next: (internalTxs) => {
        const internalDisplayTxs: DisplayTransaction[] = internalTxs.map(tx => ({
          type: 'Internal',
          direction: tx.fromAccountId === account.id ? 'Out' : 'In',
          amount: tx.amount,
          description: tx.description || 'No description',
          date: tx.createdAt || new Date().toISOString(),
          fromAccountId: tx.fromAccountId,
          toAccountId: tx.toAccountId
        }));

        // Fetch external transactions
        this.accountService.getExternalTransactions().subscribe({
          next: (externalTxs) => {
            const externalDisplayTxs: DisplayTransaction[] = externalTxs
              .filter(tx => tx.sourceAccountId === account.id)
              .map(tx => ({
                type: 'External',
                direction: 'Out',
                amount: tx.amount,
                description: tx.reason || 'No reason',
                date: tx.executedAt || new Date().toISOString(),
                sourceAccountId: tx.sourceAccountId,
                recipientId: tx.recipientId
              }));

            // Combine and sort by date (newest first)
            this.transactions = [...internalDisplayTxs, ...externalDisplayTxs].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            this.isLoading = false;
          },
          error: (err) => {
            this.error = 'Failed to load external transactions';
            this.isLoading = false;
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load internal transactions';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { NgClass, NgForOf, NgIf, DatePipe, CurrencyPipe } from '@angular/common';
import { AccountService } from '../../../../core/services/account.service';

import { TransactionService } from '../../../../core/services/transaction.service';
import { RouterLink } from '@angular/router';
import { Account } from '../../../../core/models/account.model';



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
  templateUrl: './transaction.component.html',
  styleUrls: ['transaction.component.css']
})
export class TransactionsComponent implements OnInit {
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  transactions: DisplayTransaction[] = [];
  isLoading = false;
  error: string | null = null;

  // For mobile view
  isMobileView = window.innerWidth < 768;

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    // Check for mobile view on resize
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  ngOnDestroy(): void {
    // Remove event listener
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }

  checkScreenSize(): void {
    this.isMobileView = window.innerWidth < 768;
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
        this.error = 'Échec du chargement des comptes. Veuillez réessayer plus tard.';
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
    this.transactionService.getTransactions(account.id).subscribe({
      next: (internalTxs) => {
        const internalDisplayTxs: DisplayTransaction[] = internalTxs.map(tx => ({
          type: 'Internal',
          direction: tx.fromAccountId === account.id ? 'Out' : 'In',
          amount: tx.amount,
          description: tx.description || 'Aucune description',
          date: tx.createdAt || new Date().toISOString(),
          fromAccountId: tx.fromAccountId,
          toAccountId: tx.toAccountId
        }));

        // Fetch external transactions
        this.transactionService.getExternalTransactions().subscribe({
          next: (externalTxs) => {
            const externalDisplayTxs: DisplayTransaction[] = externalTxs
              .filter(tx => tx.sourceAccountId === account.id)
              .map(tx => ({
                type: 'External',
                direction: 'Out',
                amount: tx.amount,
                description: tx.reason || 'Aucune raison',
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
            this.error = 'Échec du chargement des transactions externes';
            this.isLoading = false;
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.error = 'Échec du chargement des transactions internes';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  /**
   * Get a formatted account name or number for display
   */
  getAccountLabel(accountId: number | undefined): string {
    if (!accountId) return '-';

    const account = this.accounts.find(a => a.id === accountId);
    if (account) {
      return account.alias || account.maskedAccountNumber;
    }
    return `Compte #${accountId}`;
  }

  /**
   * Track transaction items for better ngFor performance
   */
  trackByFn(index: number, item: DisplayTransaction): string {
    // Create a unique key from transaction properties
    return `${item.date}-${item.fromAccountId || item.sourceAccountId}-${item.toAccountId || item.recipientId}-${item.amount}`;
  }
}

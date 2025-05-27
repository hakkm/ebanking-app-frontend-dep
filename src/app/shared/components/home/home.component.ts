import { Component, OnInit } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { Account } from '../../../core/models/account.model';
import { AuthService } from '../../../core/services/auth.service';
import { AccountService } from '../../../core/services/account.service';
import { RouterLink, RouterOutlet } from '@angular/router';
import {NgForOf, NgIf, DatePipe, NgClass, DecimalPipe} from '@angular/common';
import { RechargeComponent } from '../../../Rechargetel/rechargetel/rechargetel.component';
import { Transaction } from '../../../core/models/transaction.model';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [
    RouterLink,
    NgIf,
    NgForOf,
    DatePipe,
    NgClass,
    DecimalPipe
  ],
  standalone: true,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  accounts: Account[] = [];
  activeAccountsPercentage: number = 0;
  transactions: Transaction[] = [];
  mostRecentTransaction: Transaction | null = null;
  isLoading = true;
  isLoadingTransactions = true;
  error: string | null = null;
  providers: any[] = [];
  today: Date = new Date();

  constructor(
    protected authService: AuthService,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadAccounts();
    this.loadProviders();
  }

  loadUserData(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (!user) {
          this.authService.getCurrentUser().subscribe();
        }
      },
      error: (err) => {
        this.error = 'Failed to load user information. Please try again later.';
        console.error('Error loading user data:', err);
      }
    });
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.isLoading = false;

        // Calculate active accounts percentage based on total accounts
        const activeAccounts = accounts.filter(account => account.status === 'ACTIVE').length;
        this.activeAccountsPercentage = accounts.length > 0
          ? (activeAccounts / accounts.length) * 100
          : 0;

        // Load transactions for the first account
        if (accounts.length > 0) {
          this.loadTransactions(accounts[0].id);
        } else {
          this.isLoadingTransactions = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to load account information. Please try again later.';
        console.error('Error loading accounts:', err);
        this.isLoading = false;
        this.isLoadingTransactions = false;
      }
    });
  }


  // loadTransactions(accountId: number): void {
  //   this.isLoadingTransactions = true;
  //   this.transactionService.getTransactions(accountId).subscribe({
  //     next: (transactions) => {
  //       this.transactions = transactions;
  //       this.isLoadingTransactions = false;
  //     },
  //     error: (err) => {
  //       console.error('Error loading transactions:', err);
  //       this.isLoadingTransactions = false;
  //     }
  //   });
  // }


  loadTransactions(accountId: number): void {
    this.isLoadingTransactions = true;
    this.transactionService.getTransactions(accountId).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.isLoadingTransactions = false;

        // Find the most recent transaction
        this.mostRecentTransaction = transactions.length > 0
          ? transactions.reduce((latest, current) =>
            new Date(current.createdAt ?? 0) > new Date(latest.createdAt ?? 0) ? current : latest
          )
          : null;
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        this.isLoadingTransactions = false;
        this.mostRecentTransaction = null;
      }
    });
  }



  loadProviders(): void {
    this.accountService.getProviders().subscribe({
      next: (data) => {
        this.providers = data;
      },
      error: (err) => {
        console.error('Error loading providers:', err);
      }
    });
  }

  formatCurrency(amount: string | number, currency: string): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) {
      console.warn(`Invalid amount: ${amount}`);
      return 'N/A';
    }
    try {
      return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: currency || 'MAD' // Default to MAD for Morocco
      }).format(numericAmount);
    } catch (e) {
      console.warn(`Invalid currency: ${currency}`);
      return numericAmount.toFixed(2); // Fallback to plain number
    }
  }


  getTransactionCurrency(transaction: Transaction): string {
    const account = this.accounts.find(
      acc => acc.id === transaction.fromAccountId || acc.id === transaction.toAccountId
    );
    return account ? account.currency : 'MAD';
  }


  getTotalBalance(): string {
    // Calculate total balance across all accounts
    let total = 0;
    let currency = 'MAD'; // Default currency for Morocco

    if (this.accounts && this.accounts.length > 0) {
      this.accounts.forEach(account => {
        const amount = typeof account.balance === 'string' ?
          parseFloat(account.balance) : account.balance;

        if (!isNaN(amount)) {
          total += amount;
        }

        // Use the currency from the first valid account
        if (account.currency && currency === 'MAD') {
          currency = account.currency;
        }
      });
    }

    return this.formatCurrency(total, currency);
  }

  /**
   * Determines if a transaction is incoming (deposit) for any of the user's accounts
   */
  isIncomingTransaction(transaction: Transaction): boolean {
    // If the transaction's toAccountId matches any of the user's account IDs,
    // then it's an incoming transaction (money coming into one of the user's accounts)
    return this.accounts.some(account => account.id === transaction.toAccountId);
  }

  /**
   * Generates a description for a transaction if none is provided
   */
  getTransactionDescription(transaction: Transaction): string {
    if (this.isIncomingTransaction(transaction)) {
      // Find source account if it's one of the user's accounts (internal transfer)
      const sourceAccount = this.accounts.find(a => a.id === transaction.fromAccountId);
      if (sourceAccount) {
        return `Virement de ${sourceAccount.alias || sourceAccount.accountType}`;
      }
      return 'Dépôt reçu';
    } else {
      // Find destination account if it's one of the user's accounts (internal transfer)
      const destAccount = this.accounts.find(a => a.id === transaction.toAccountId);
      if (destAccount) {
        return `Virement vers ${destAccount.alias || destAccount.accountType}`;
      }
      return 'Paiement envoyé';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

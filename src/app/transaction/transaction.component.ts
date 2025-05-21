import { Component, OnInit } from '@angular/core';
import {NgClass, NgForOf, NgIf, DatePipe, CurrencyPipe} from '@angular/common';
import { AccountService } from '../auth/services/account.service';
import { Account } from '../auth/models/account.model';
import { Transaction } from '../auth/models/transaction.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [NgClass, NgForOf, NgIf, DatePipe, CurrencyPipe],
  templateUrl: './transaction.component.html'
})
export class TransactionsComponent implements OnInit {
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  transactions: Transaction[] = [];
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
    this.accountService.getTransactions(account.id).subscribe({
      next: (txs) => {
        this.transactions = txs;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load transactions';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}

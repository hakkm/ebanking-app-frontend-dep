import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CryptoService, Transaction } from '../../../../core/services/crypto.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class TransactionHistoryComponent implements OnInit {
  transactions: Transaction[] = [];
  isLoading = true;

  constructor(private cryptoService: CryptoService) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.cryptoService.getTransactionHistory().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.isLoading = false;
        console.log('transactions', this.transactions);
      },
      error: (err) => {
        console.error('Error loading transactions', err);
        this.isLoading = false;
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  }
}

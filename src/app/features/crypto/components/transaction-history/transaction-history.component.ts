import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CryptoService, Transaction } from '../../../../core/services/crypto.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(private cryptoService: CryptoService) { }

  ngOnInit(): void {
    // Subscribe to loading state
    this.cryptoService.getTransactionsLoadingState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.isLoading = isLoading;
      });

    // Subscribe to transaction data
    this.cryptoService.getTransactionHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
        },
        error: (err) => {
          console.error('Error loading transactions', err);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

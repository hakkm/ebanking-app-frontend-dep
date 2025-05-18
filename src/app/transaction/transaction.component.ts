import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Transaction} from '../auth/models/transaction.model';
import {AccountService} from '../auth/services/account.service';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  imports: [
    NgClass,
    NgForOf,
    NgIf,
    DatePipe
  ]
})
export class TransactionComponent implements OnInit {
  transactions: Transaction[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    const accountId = Number(this.route.snapshot.paramMap.get('id'));
    if (!accountId) {
      this.error = 'No account ID provided';
      return;
    }

    this.isLoading = true;
    this.accountService.getTransactions(accountId).subscribe({
      next: (txs) => {
        this.transactions = txs;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load transactions';
        this.isLoading = false;
        console.error(err);
      },
    });
  }
}

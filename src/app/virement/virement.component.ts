import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Recipient } from '../auth/models/recipient.model';
import {Account} from '../auth/models/account.model';
import {AccountService} from '../auth/services/account.service';
import {RecipientService} from '../auth/services/recipient.service';
import {Transaction} from '../auth/models/transaction.model';

@Component({
  selector: 'app-transfer',
  templateUrl: './virement.component.html',
  imports: [ReactiveFormsModule, RouterModule, CommonModule]
})
export class VirementComponent implements OnInit {
  transferForm: FormGroup;
  recipients: Recipient[] = [];
  accounts: Account[] = [];
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private recipientService: RecipientService
  ) {
    this.transferForm = this.fb.group({
      recipient: ['', Validators.required],
      fromAccount: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      motif: [''],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load accounts. Please try again.';
        this.isLoading = false;
      },
    });

    this.recipientService.getRecipients().subscribe({
      next: (recipients) => {
        this.recipients = recipients;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load recipients. Please try again.';
        this.isLoading = false;
      },
    });
  }

  onSubmitTransfer(): void {
    if (this.transferForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.error = null;

      const transaction: Transaction = {
        fromAccountId: this.transferForm.value.fromAccount,
        toAccountId: this.transferForm.value.recipient,
        amount: this.transferForm.value.amount,
        description: this.transferForm.value.motif,
      };

      console.log('Sending transaction:', JSON.stringify(transaction, null, 2));

      this.accountService.createTransfer(transaction).subscribe({
        next: (result) => {
          console.log('Transfer successful:', JSON.stringify(result, null, 2));
          this.isSubmitting = false;
          this.transferForm.reset();
          alert('Transfer successful!');
        },
        error: (err) => {
          console.error('Error:', JSON.stringify(err, null, 2));
          this.error = err.error?.message || 'Failed to create transfer. Please try again.';
          this.isSubmitting = false;
        },
      });
    }
  }

  deleteRecipient(id: number | undefined): void {
    if (confirm('Are you sure you want to delete this recipient?')) {
      this.recipientService.deleteRecipient(id).subscribe({
        next: () => {
          this.recipients = this.recipients.filter((r) => r.id !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete recipient. Please try again.';
        },
      });
    }
  }
}

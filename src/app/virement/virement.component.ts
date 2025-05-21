import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Recipient } from '../auth/models/recipient.model';
import { recipientExternal } from '../auth/models/recipientExternal.model';
import { Account } from '../auth/models/account.model';
import { AccountService } from '../auth/services/account.service';
import { RecipientService } from '../auth/services/recipient.service';
import { Transaction } from '../auth/models/transaction.model';
import {ExternalTransaction} from '../auth/models/ExternalTransaction.model';

@Component({
  selector: 'app-transfer',
  templateUrl: './virement.component.html',
  imports: [FormsModule, RouterModule, CommonModule]
})
export class VirementComponent implements OnInit {
  transferModel: {
    recipientType: string;
    recipient: string;
    fromAccount: string;
    amount: number | null;
    reason: string;
  } = {
    recipientType: 'internal',
    recipient: '',
    fromAccount: '',
    amount: null,
    reason: ''
  };
  recipients: Recipient[] = [];
  externalRecipients: recipientExternal[] = [];
  accounts: Account[] = [];
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private accountService: AccountService,
    private recipientService: RecipientService
  ) {}

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
        this.error = 'Failed to load accounts.';
        this.isLoading = false;
      }
    });

    this.recipientService.getRecipients().subscribe({
      next: (recipients) => {
        this.recipients = recipients;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load internal recipients.';
        this.isLoading = false;
      }
    });

    this.recipientService.getExternalRecipients().subscribe({
      next: (externalRecipients) => {
        this.externalRecipients = externalRecipients;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load external recipients.';
        this.isLoading = false;
      }
    });
  }

  onSubmitTransfer(): void {
    if (this.isFormValid() && !this.isSubmitting) {
      this.isSubmitting = true;
      this.error = null;
      this.successMessage = null;

      if (this.transferModel.recipientType === 'internal') {
        const transaction: Transaction = {
          fromAccountId: Number(this.transferModel.fromAccount),
          toAccountId: Number(this.transferModel.recipient),
          amount: this.transferModel.amount!,
          description: this.transferModel.reason
        };

        this.accountService.createTransfer(transaction).subscribe({
          next: (result) => {
            this.isSubmitting = false;
            this.successMessage = `Internal transfer of $${result.amount} completed!`;
            this.resetForm();
          },
          error: (err) => {
            this.error = err.error?.message || 'Failed to create internal transfer. Please check your input or balance.';
            this.isSubmitting = false;
          }
        });
      } else {
        const externalTransaction: ExternalTransaction = {
          sourceAccountId: Number(this.transferModel.fromAccount),
          recipientId: Number(this.transferModel.recipient),
          amount: this.transferModel.amount!,
          reason: this.transferModel.reason
        };

        this.accountService.createExternalTransfer(externalTransaction).subscribe({
          next: (result) => {
            this.isSubmitting = false;
            this.successMessage = `External transfer of $${result.amount} completed at ${result.executedAt}!`;
            this.resetForm();
          },
          error: (err) => {
            this.error = err.error?.message || 'Failed to create external transfer. Please check your input or balance.';
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.error = 'Please fill all required fields correctly.';
    }
  }

  isFormValid(): boolean {
    const amount = this.transferModel.amount;
    const amountRegex = /^\d+(\.\d{1,2})?$/;
    return (
      !!this.transferModel.recipientType &&
      !!this.transferModel.recipient &&
      !!this.transferModel.fromAccount &&
      amount !== null &&
      amount >= 1 &&
      amountRegex.test(amount.toString())
    );
  }

  resetForm(): void {
    this.transferModel = {
      recipientType: 'internal',
      recipient: '',
      fromAccount: '',
      amount: null,
      reason: ''
    };
  }

  onRecipientTypeChange(): void {
    this.transferModel.recipient = '';
  }

  deleteRecipient(id: number | undefined, isExternal: boolean): void {
    if (confirm('Are you sure you want to delete this recipient?')) {
      const deleteObservable = isExternal
        ? this.recipientService.deleteExternalRecipient(id)
        : this.recipientService.deleteRecipient(id);

      deleteObservable.subscribe({
        next: () => {
          if (isExternal) {
            this.externalRecipients = this.externalRecipients.filter((r) => r.id !== id);
          } else {
            this.recipients = this.recipients.filter((r) => r.id !== id);
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to delete recipient.';
        }
      });
    }
  }
}

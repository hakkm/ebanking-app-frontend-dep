import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Recipient } from '../../../core/models/recipient.model';
import { recipientExternal } from '../../../core/models/recipientExternal.model';
import { Account } from '../../../core/models/account.model';
import { AccountService } from '../../../core/services/account.service';
import { RecipientService } from '../../../core/services/recipient.service';
import { Transaction } from '../../../core/models/transaction.model';
import {ExternalTransaction} from '../../../core/models/ExternalTransaction.model';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './virement.component.html',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  styles: [`
    /* Custom scrollbar styling */
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(31, 41, 55, 0.8);
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(34, 197, 94, 0.4);
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(34, 197, 94, 0.6);
    }

    /* Animation for form submission */
    .form-submitting {
      pointer-events: none;
      opacity: 0.7;
    }

    /* Custom radio button animations */
    input[type="radio"]:checked + div {
      transform: scale(1.02);
    }
  `]
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
    private recipientService: RecipientService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    // Load accounts
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.checkLoadingComplete();
      },
      error: (err) => {
        this.error = 'Échec du chargement des comptes.';
        this.isLoading = false;
        console.error('Error loading accounts:', err);
      }
    });

    // Load internal recipients
    this.recipientService.getRecipients().subscribe({
      next: (recipients) => {
        this.recipients = recipients;
        this.checkLoadingComplete();
      },
      error: (err) => {
        this.error = 'Échec du chargement des bénéficiaires internes.';
        this.isLoading = false;
        console.error('Error loading recipients:', err);
      }
    });

    // Load external recipients
    this.recipientService.getExternalRecipients().subscribe({
      next: (externalRecipients) => {
        this.externalRecipients = externalRecipients;
        this.checkLoadingComplete();
      },
      error: (err) => {
        this.error = 'Échec du chargement des bénéficiaires externes.';
        this.isLoading = false;
        console.error('Error loading external recipients:', err);
      }
    });
  }

  private checkLoadingComplete(): void {
    // Check if all data has been loaded
    if (this.accounts.length >= 0 && this.recipients.length >= 0 && this.externalRecipients.length >= 0) {
      this.isLoading = false;
    }
  }

  onSubmitTransfer(): void {
    if (this.isFormValid() && !this.isSubmitting) {
      this.isSubmitting = true;
      this.error = null;
      this.successMessage = null;

      // Show confirmation dialog
      const selectedAccount = this.accounts.find(acc => acc.id === Number(this.transferModel.fromAccount));
      const accountInfo = selectedAccount ? `${selectedAccount.maskedAccountNumber} (${selectedAccount.accountType})` : 'Compte sélectionné';

      let recipientInfo = '';
      if (this.transferModel.recipientType === 'internal') {
        const recipient = this.recipients.find(r => r.recipientAccountId === Number(this.transferModel.recipient));
        recipientInfo = recipient ? (recipient.alias || recipient.accountNumber) : 'Bénéficiaire sélectionné';
      } else {
        const recipient = this.externalRecipients.find(r => r.id === Number(this.transferModel.recipient));
        recipientInfo = recipient ? (recipient.alias || recipient.accountNumber) : 'Bénéficiaire sélectionné';
      }

      const confirmation = window.confirm(
        `Confirmation du Virement\n\n` +
        `Type: ${this.transferModel.recipientType === 'internal' ? 'Interne' : 'Externe'}\n` +
        `De: ${accountInfo}\n` +
        `Vers: ${recipientInfo}\n` +
        `Montant: ${this.transferModel.amount} MAD\n` +
        `Motif: ${this.transferModel.reason || 'Aucun motif spécifié'}\n\n` +
        `Voulez-vous confirmer ce virement?`
      );

      if (!confirmation) {
        this.isSubmitting = false;
        return;
      }

      if (this.transferModel.recipientType === 'internal') {
        this.processInternalTransfer();
      } else {
        this.processExternalTransfer();
      }
    } else {
      this.error = 'Veuillez remplir tous les champs obligatoires correctement.';
    }
  }

  private processInternalTransfer(): void {
    const transaction: Transaction = {
      fromAccountId: Number(this.transferModel.fromAccount),
      toAccountId: Number(this.transferModel.recipient),
      amount: this.transferModel.amount!,
      description: this.transferModel.reason
    };

        this.transactionService.createTransfer(transaction).subscribe({
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
        //  else {
        const externalTransaction: ExternalTransaction = {
          sourceAccountId: Number(this.transferModel.fromAccount),
          recipientId: Number(this.transferModel.recipient),
          amount: this.transferModel.amount!,
          reason: this.transferModel.reason
        };

        this.transactionService.createExternalTransfer(externalTransaction).subscribe({
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
    // } else {
    //   this.error = 'Please fill all required fields correctly.';
  //   }
  // }

    private processExternalTransfer(): void {
    const externalTransaction: ExternalTransaction = {
      sourceAccountId: Number(this.transferModel.fromAccount),
      recipientId: Number(this.transferModel.recipient),
      amount: this.transferModel.amount!,
      reason: this.transferModel.reason
    };

    this.transactionService.createExternalTransfer(externalTransaction).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        // Fix: Handle potential undefined executedAt
        const executedDate = result.executedAt ? new Date(result.executedAt).toLocaleString('fr-FR') : 'maintenant';
        this.successMessage = `Virement externe de ${result.amount} MAD effectué avec succès le ${executedDate}!`;
        this.resetForm();
        this.scrollToTop();
      },
      error: (err) => {
        this.error = err.error?.message || 'Échec du virement externe. Veuillez vérifier votre saisie ou votre solde.';
        this.isSubmitting = false;
        this.scrollToTop();
      }
    });
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
    // Clear any previous errors when changing type
    this.error = null;
  }

  deleteRecipient(id: number | undefined, isExternal: boolean): void {
    if (!id) return;

    const recipientType = isExternal ? 'externe' : 'interne';
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ce bénéficiaire ${recipientType}?`;

    if (confirm(confirmMessage)) {
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
          this.successMessage = `Bénéficiaire ${recipientType} supprimé avec succès.`;

          // Clear recipient selection if the deleted recipient was selected
          if (Number(this.transferModel.recipient) === id) {
            this.transferModel.recipient = '';
          }
        },
        error: (err) => {
          this.error = err.error?.message || `Échec de la suppression du bénéficiaire ${recipientType}.`;
        }
      });
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Helper method to get account balance for display
  getAccountBalance(accountId: string): string {
    const account = this.accounts.find(acc => acc.id === Number(accountId));
    if (account) {
      return `Solde: ${account.balance} ${account.currency}`;
    }
    return '';
  }

  // Helper method to format currency
  formatCurrency(amount: number, currency: string = 'MAD'): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}

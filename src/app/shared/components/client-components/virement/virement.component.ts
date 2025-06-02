import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Recipient } from '../../../../core/models/recipient.model';
import { recipientExternal } from '../../../../core/models/recipientExternal.model';
import { Account } from '../../../../core/models/account.model';
import { AccountService } from '../../../../core/services/account.service';
import { RecipientService } from '../../../../core/services/recipient.service';
import { Transaction } from '../../../../core/models/transaction.model';
import { ExternalTransaction } from '../../../../core/models/ExternalTransaction.model';
import { TransactionService } from '../../../../core/services/transaction.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationModalComponent, ConfirmationData } from './virement-confirmation-modal';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-transfer',
  templateUrl: './virement.component.html',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, ConfirmationModalComponent],
  styleUrls: ['virement.component.css']
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
  showConfirmationModal = false;
  confirmationData: ConfirmationData | null = null;
  showVerificationModal = false;
  verificationCode: string = '';
  userPhone: string | null = null;

  constructor(
    private accountService: AccountService,
    private recipientService: RecipientService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadUserPhone();
  }

  private loadUserPhone(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userPhone = user.phone;
      },
      error: (err) => {
        this.error = 'Échec du chargement du numéro de téléphone.';
        console.error('Error loading user phone:', err);
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

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
    if (this.accounts.length >= 0 && this.recipients.length >= 0 && this.externalRecipients.length >= 0) {
      this.isLoading = false;
    }
  }

  onSubmitTransfer(): void {
    if (this.isFormValid() && !this.isSubmitting) {
      this.prepareConfirmationData();
      this.showConfirmationModal = true;
    } else {
      this.error = 'Veuillez remplir tous les champs obligatoires correctement.';
    }
  }

  private prepareConfirmationData(): void {
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

    const fees = this.transferModel.recipientType === 'external' && this.transferModel.amount
      ? Math.max(this.transferModel.amount * 0.005, 5)
      : 0;

    this.confirmationData = {
      title: 'Confirmation du Virement',
      type: this.transferModel.recipientType as 'internal' | 'external',
      fromAccount: accountInfo,
      toRecipient: recipientInfo,
      amount: this.transferModel.amount || 0,
      currency: 'MAD',
      reason: this.transferModel.reason || undefined,
      fees: fees > 0 ? fees : undefined
    };
  }

  onConfirmTransfer(): void {
    this.showConfirmationModal = false;
    if (!this.userPhone) {
      this.error = 'Numéro de téléphone non disponible.';
      return;
    }

    this.isSubmitting = true;
    this.http.post(`${environment.apiUrl}/test/send-code`, { phone: `+${this.userPhone}` }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showVerificationModal = true;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = 'Échec de l’envoi du code de vérification.';
        console.error('Error sending SMS:', err);
      }
    });
  }

  onVerifyCode(): void {
    if (!this.verificationCode || !this.userPhone) {
      this.error = 'Veuillez entrer un code de vérification valide.';
      return;
    }

    this.isSubmitting = true;
    this.http
      .post(`${environment.apiUrl}/test/verify-code`, {
        phone: `+${this.userPhone}`,
        code: this.verificationCode
      })
      .subscribe({
        next: (response: any) => {
          if (response === 'Code verified successfully') {
            this.showVerificationModal = false;
            this.verificationCode = '';
            if (this.transferModel.recipientType === 'internal') {
              this.processInternalTransfer();
            } else {
              this.processExternalTransfer();
            }
          } else {
            this.error = 'Code de vérification invalide ou expiré.';
            this.isSubmitting = false;
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Échec de la vérification du code.';
          this.isSubmitting = false;
          console.error('Error verifying code:', err);
        }
      });
  }

  onCancelVerification(): void {
    this.showVerificationModal = false;
    this.verificationCode = '';
    this.isSubmitting = false;
    this.confirmationData = null;
  }

  onCancelTransfer(): void {
    this.showConfirmationModal = false;
    this.confirmationData = null;
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
        this.successMessage = `Virement interne de ${this.formatCurrency(result.amount)} effectué avec succès!`;
        this.resetForm();
        this.scrollToTop();
      },
      error: (err) => {
        this.error = err.error?.message || 'Échec du virement interne. Veuillez vérifier votre saisie ou votre solde.';
        this.isSubmitting = false;
        this.scrollToTop();
      }
    });
  }

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
        const executedDate = result.executedAt ? new Date(result.executedAt).toLocaleString('fr-FR') : 'maintenant';
        this.successMessage = `Virement externe de ${this.formatCurrency(result.amount)} effectué avec succès le ${executedDate}!`;
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

  getAccountBalance(accountId: string): string {
    const account = this.accounts.find(acc => acc.id === Number(accountId));
    if (account) {
      return `Solde: ${account.balance} ${account.currency}`;
    }
    return '';
  }

  formatCurrency(amount: number, currency: string = 'MAD'): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}

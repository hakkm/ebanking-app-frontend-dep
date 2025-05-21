import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgIf, NgForOf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { AccountService } from '../../auth/services/account.service';
import { Account } from '../../auth/models/account.model';
import { User } from '../../auth/models/user.model';

@Component({
  selector: 'app-recharge',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule, RouterLink, NgClass],
  templateUrl: './rechargetel.component.html',
  styleUrls: ['./rechargetel.component.css'],
})
export class RechargeComponent implements OnInit {
  @Input() accounts: Account[] = [];
  @Input() providers: any[] = [];
  @Output() rechargeSubmitted = new EventEmitter<void>();

  currentUser: User | null = null;
  isLoading = true;
  error: string | null = null;
  message: string | null = null;

  selectedAccountId: string = '';
  selectedProvider: string = '';
  phoneNumber: string = '';
  amount: number | null = null;

  isSubmitting = false;
  confirmingRecharge = false;

  // Quick recharge amounts
  quickAmounts = [10, 20, 50, 100];

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loadUserData();

    // Only load accounts and providers if they weren't provided as inputs
    if (this.accounts.length === 0) {
      this.loadAccounts();
    } else {
      this.isLoading = false;
    }

    if (this.providers.length === 0) {
      this.loadProviders();
    }
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (!user) {
          this.authService.getCurrentUser().subscribe();
        }
      },
      error: (err) => {
        console.error(
          'Erreur lors du chargement des données utilisateur :',
          err
        );
        this.error = 'Impossible de charger les informations utilisateur.';
      },
    });
  }

  private loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des comptes :', err);
        this.error = 'Échec du chargement des comptes.';
        this.isLoading = false;
      },
    });
  }

  private loadProviders(): void {
    this.accountService.getProviders().subscribe({
      next: (data) => {
        this.providers = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des fournisseurs :', err);
      },
    });
  }

  submitRecharge(): void {
    if (
      !this.selectedAccountId ||
      !this.selectedProvider ||
      !this.amount ||
      !this.phoneNumber
    ) {
      this.error = 'Tous les champs sont requis.';
      this.message = null;
      return;
    }

    // Custom phone number validation
    if (!this.validatePhoneNumber(this.phoneNumber)) {
      this.error =
        'Numéro de téléphone invalide. Format attendu: 06XXXXXXXX ou 07XXXXXXXX';
      this.message = null;
      return;
    }

    // Clear any previous messages
    this.error = null;
    this.message = null;

    // Get selected account details for confirmation message
    const selectedAccount = this.accounts.find(
      (acc) => acc.id === Number(this.selectedAccountId)
    );
    const accountInfo = selectedAccount
      ? `${selectedAccount.maskedAccountNumber} (${selectedAccount.accountType})`
      : this.selectedAccountId;

    // Show confirmation dialog with detailed info
    const confirmation = window.confirm(
      `Confirmation de Recharge\n\n` +
        `Fournisseur: ${this.selectedProvider}\n` +
        `Numéro: ${this.phoneNumber}\n` +
        `Montant: ${this.amount} MAD\n` +
        `Compte: ${accountInfo}\n\n` +
        `Voulez-vous confirmer cette opération?`
    );

    if (!confirmation) {
      return;
    }

    const payload = {
      accountId: this.selectedAccountId,
      provider: this.selectedProvider,
      amount: this.amount,
      phoneNumber: this.phoneNumber,
    };

    this.isSubmitting = true;
    this.isLoading = true;

    this.http.post(`${this.apiUrl}/recharge`, payload).subscribe({
      next: () => {
        this.message = 'Recharge effectuée avec succès ✅';
        this.rechargeSubmitted.emit();
        // Reset form
        this.resetForm();
        this.isSubmitting = false;
        this.isLoading = false;
      },
      error: (err) => {
        this.error =
          err.error?.message || 'Échec de la recharge. Veuillez réessayer ❌';
        this.isSubmitting = false;
        this.isLoading = false;
      },
    });
  }

  setQuickAmount(value: number): void {
    this.amount = value;
  }

  validatePhoneNumber(phone: string): boolean {
    // Basic Moroccan phone number validation
    const regex = /^(06|07)\d{8}$/;
    return regex.test(phone);
  }

  private resetForm(): void {
    this.selectedAccountId = '';
    this.selectedProvider = '';
    this.phoneNumber = '';
    this.amount = null;
  }

  formatCurrency(amount: string | number, currency: string): string {
    const numericAmount =
      typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) {
      return 'N/A';
    }

    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency || 'MAD',
      }).format(numericAmount);
    } catch (e) {
      return numericAmount.toFixed(2);
    }
  }
}

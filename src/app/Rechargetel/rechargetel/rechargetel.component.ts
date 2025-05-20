import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterOutlet } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { AccountService } from '../../auth/services/account.service';
import { Account } from '../../auth/models/account.model';
import { User } from '../../auth/models/user.model';

@Component({
  selector: 'app-recharge',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule, RouterOutlet, RouterLink],
  templateUrl: './rechargetel.component.html',
  styleUrls: ['./rechargetel.component.css']
})
export class RechargeComponent {
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

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadAccounts();
    this.loadProviders();
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
        console.error('Erreur lors du chargement des données utilisateur :', err);
        this.error = 'Impossible de charger les informations utilisateur.';
      }
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
      }
    });
  }

  private loadProviders(): void {
    this.accountService.getProviders().subscribe({
      next: (data) => {
        this.providers = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des fournisseurs :', err);
      }
    });
  }

  submitRecharge(): void {
    if (!this.selectedAccountId || !this.selectedProvider || !this.amount || !this.phoneNumber) {
      this.message = 'Tous les champs sont requis.';
      return;
    }

    const confirmation = window.confirm(
      `Êtes-vous sûr de vouloir recharger ${this.amount} MAD à ${this.phoneNumber} via ${this.selectedProvider} ?`
    );

    if (!confirmation) {
      return;
    }

    const payload = {
      accountId: this.selectedAccountId,
      provider: this.selectedProvider,
      amount: this.amount,
      phoneNumber: this.phoneNumber
    };

    this.isLoading = true;
    this.message = '';
    this.error = null;

    this.http.post(`${this.apiUrl}/recharge`, payload).subscribe({
      next: () => {
        this.message = 'Recharge effectuée avec succès ✅';
        this.rechargeSubmitted.emit();
        this.isLoading = false;
        // Reset form
        this.selectedAccountId = '';
        this.selectedProvider = '';
        this.amount = null;
        this.phoneNumber = '';
      },
      error: () => {
        this.message = 'Échec de la recharge. Veuillez réessayer ❌';
        this.isLoading = false;
      }
    });
  }

  private resetForm(): void {
    this.selectedAccountId = '';
    this.selectedProvider = '';
    this.phoneNumber = '';
    this.amount = null;
  }

  formatCurrency(amount: string | number, currency: string): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) {
      return 'N/A';
    }

    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency || 'MAD'
      }).format(numericAmount);
    } catch (e) {
      return numericAmount.toFixed(2);
    }
  }
}

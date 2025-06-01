import { Component, OnInit } from '@angular/core';
import { NgIf, NgForOf,NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {AccountService} from '../../core/services/account.service';
import {AuthService} from '../../core/services/auth.service';
import  {Account} from '../../core/models/account.model';
import {User} from '../../core/models/user.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-budget-alert',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgClass,
    FormsModule,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './gestionbudget.component.html',
  styleUrls: ['./gestionbudget.component.css']
})
export class BudgetAlertComponent implements OnInit {
  accounts: Account[] = [];
  currentUser: User | null = null;

  form = {
    accountId: null,
    type: 'AMOUNT',
    threshold: null,
    message: '',
    enabled: true,
    expiresAt: ''
  };

  successMessage = '';
  errorMessage = '';
  loading = false;
  isLoading = true;
  error: string | null = null;

  private apiUrl = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadAccounts();
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
        console.error('Erreur lors du chargement utilisateur :', err);
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

  submitAlert(): void {
    console.log('Budget alert payload:', this.form);

    this.successMessage = '';
    this.errorMessage = '';

    if (!this.form.accountId || !this.form.threshold || !this.form.message) {
      this.errorMessage = "Tous les champs obligatoires doivent être remplis.";
      return;
    }

    const parsedThreshold = Number(this.form.threshold);
    const parsedAccountId = Number(this.form.accountId);

    if (isNaN(parsedThreshold)) {
      this.errorMessage = "Le seuil doit être un nombre valide.";
      return;
    }

    if (isNaN(parsedAccountId)) {
      this.errorMessage = "Le compte sélectionné est invalide.";
      return;
    }

    let formattedExpiresAt = this.form.expiresAt;
    if (formattedExpiresAt) {
      const date = new Date(formattedExpiresAt);
      formattedExpiresAt = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    this.loading = true;

    const payload = {
      ...this.form,
      accountId: parsedAccountId,

      threshold: parsedThreshold,
      expiresAt: formattedExpiresAt
    };

    this.http.post(`${this.apiUrl}/alerts`, payload).subscribe({
      next: () => {
        this.successMessage = "Alerte enregistrée avec succès ✅";
        this.resetForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de l’enregistrement', error);
        this.errorMessage = error.error?.message || "Erreur lors de la soumission.";
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.form = {
      accountId: null,
      type: 'AMOUNT',
      threshold: null,
      message: '',
      enabled: true,
      expiresAt: ''
    };
  }
}

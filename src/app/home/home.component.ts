import { Component, OnInit } from '@angular/core';
import { User } from '../auth/models/user.model';
import { Account } from '../auth/models/account.model';
import { AuthService } from '../auth/services/auth.service';
import { AccountService } from '../auth/services/account.service';
import {RouterLink} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [
    RouterLink,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  accounts: Account[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    protected authService: AuthService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadAccounts();
  }

  loadUserData(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (!user) {
          this.authService.getCurrentUser().subscribe();
        }
      },
      error: (err) => {
        this.error = 'Failed to load user information. Please try again later.';
        console.error('Error loading user data:', err);
      }
    });
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load account information. Please try again later.';
        console.error('Error loading accounts:', err);
        this.isLoading = false;
      }
    });
  }

  formatCurrency(amount: string | number, currency: string): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) {
      console.warn(`Invalid amount: ${amount}`);
      return 'N/A';
    }
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD' // Fallback to USD
      }).format(numericAmount);
    } catch (e) {
      console.warn(`Invalid currency: ${currency}`);
      return numericAmount.toFixed(2); // Fallback to plain number
    }
  }
}

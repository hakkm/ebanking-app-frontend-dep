import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../../../core/models/client.model';
import { Account } from '../../../core/models/account.model';
import { AccountExport } from '../../../core/models/account.export.model';
import { AccountModalComponent } from "../account-modal/account-modal.component";

@Component({
  selector: 'app-agent-user-profile',
  imports: [FormsModule, CommonModule, AccountModalComponent],
  templateUrl: './agent-user-profile.component.html',
  standalone: true
})
export class AgentUserProfileComponent implements OnInit {

  user!: Client;
  user_id!: number;
  accounts: Account[] = [];
  newAccount: AccountExport = {} as AccountExport;
  updatedAccount: AccountExport = {} as AccountExport;

  // Loading and error states
  isLoading: boolean = false;
  isLoadingAccounts: boolean = false;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.user_id = this.route.snapshot.params['id'];
    this.newAccount.user_id = this.user_id;

    if (!this.user_id) {
      this.showError('User ID is required!');
      return;
    }

    this.loadUserData();
    this.loadUserAccounts();
  }

  private loadUserData(): void {
    this.isLoading = true;
    this.error = null;

    this.userService.getUser(this.user_id).subscribe({
      next: (response: any) => {
        console.log('User data loaded:', response);
        this.user = response;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching user:', error);
        this.showError('Failed to load user information');
        this.isLoading = false;
      }
    });
  }

  private loadUserAccounts(): void {
    this.isLoadingAccounts = true;

    this.userService.getAccounts(this.user_id).subscribe({
      next: (response: any) => {
        console.log('Accounts loaded:', response);
        this.accounts = response || [];
        this.isLoadingAccounts = false;
      },
      error: (error: any) => {
        console.error('Error fetching accounts:', error);
        this.showError('Failed to load user accounts');
        this.isLoadingAccounts = false;
      }
    });
  }

  updateUser() {
    if (!this.user) {
      this.showError('No user data to update');
      return;
    }

    this.isLoading = true;

    this.userService.updateUser(this.user).subscribe({
      next: (response: any) => {
        console.log('User updated:', response);
        this.showSuccess('User information updated successfully!');
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error updating user:', error);
        this.showError('Failed to update user information');
        this.isLoading = false;
      }
    });
  }

  deleteUser() {
    if (!this.user) {
      this.showError('No user data to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${this.user.username}"? This action cannot be undone.`)) {
      return;
    }

    this.userService.deleteUser(this.user).subscribe({
      next: () => {
        console.log('User deleted:', this.user);
        this.showSuccess('User deleted successfully!');
        // Navigate back to users list
        setTimeout(() => {
          this.router.navigate(['/agent/manage-users']);
        }, 1500);
      },
      error: (error: any) => {
        console.error('Error deleting user:', error);
        this.showError('Failed to delete user');
      }
    });
  }

  createAccount() {
    if (!this.newAccount.alias || !this.newAccount.accountNumber) {
      this.showError('Please fill in all required fields');
      return;
    }

    this.userService.createAccount(this.newAccount).subscribe({
      next: (response: any) => {
        console.log('Account created:', response);
        this.accounts.push(response);
        this.newAccount = { user_id: this.user_id } as AccountExport;
        this.closeModal("createAccountModal");
        this.showSuccess('Account created successfully!');
      },
      error: (error: any) => {
        console.error('Error creating account:', error);
        this.showError('Failed to create account');
      }
    });
  }

  updateAccount() {
    if (!this.updatedAccount.id) {
      this.showError('No account selected for update');
      return;
    }

    this.userService.updateAccount(this.updatedAccount).subscribe({
      next: (response: any) => {
        console.log('Account updated:', response);
        const index = this.accounts.findIndex(account => account.id === this.updatedAccount.id);
        if (index !== -1) {
          this.accounts[index] = response;
        }
        this.closeModal("updateAccountModal");
        this.showSuccess('Account updated successfully!');
      },
      error: (error: any) => {
        console.error('Error updating account:', error);
        this.showError('Failed to update account');
      }
    });
  }

  deleteAccount(accountId: number) {
    const account = this.accounts.find(acc => acc.id === accountId);
    const accountName = account?.alias || `Account #${accountId}`;

    if (!confirm(`Are you sure you want to delete "${accountName}"? This action cannot be undone.`)) {
      return;
    }

    this.userService.deleteAccount(accountId).subscribe({
      next: () => {
        this.accounts = this.accounts.filter(account => account.id !== accountId);
        this.showSuccess('Account deleted successfully!');
      },
      error: (error: any) => {
        console.error('Error deleting account:', error);
        this.showError('Failed to delete account');
      }
    });
  }

  openModal(id: string, account?: Account) {
    const modal = document.getElementById(id);
    if (!modal) return;

    if (id === 'updateAccountModal' && account) {
      this.updatedAccount = {
        id: account.id,
        user_id: this.user_id,
        accountNumber: account.maskedAccountNumber,
        balance: account.balance,
        currency: account.currency,
        accountType: account.accountType,
        status: account.status,
        alias: account.alias,
        createdAt: account.createdAt || new Date().toISOString()
      };
    }

    modal.style.display = 'block';
    console.log('Modal opened:', id);
  }

  closeModal(id: string, event?: Event) {
    const modal = document.getElementById(id);
    if (modal && (!event || event.target === modal)) {
      modal.style.display = 'none';

      // Reset form data when closing
      if (id === 'createAccountModal') {
        this.newAccount = { user_id: this.user_id } as AccountExport;
      } else if (id === 'updateAccountModal') {
        this.updatedAccount = {} as AccountExport;
      }
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  // Utility Methods
  getTotalBalance(): string {
    const total = this.accounts.reduce((sum, account) => {
      const balance = typeof account.balance === 'string' ?
        parseFloat(account.balance) : account.balance;
      return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    // Use the currency from the first account, or default to MAD
    const currency = this.accounts.length > 0 ? this.accounts[0].currency : 'MAD';
    return this.formatCurrency(total, currency);
  }

  getActiveAccountsCount(): number {
    return this.accounts.filter(account => account.status === 'ACTIVE').length;
  }

  formatCurrency(amount: number | string, currency: string = 'MAD'): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) {
      console.warn(`Invalid amount: ${amount}`);
      return 'N/A';
    }

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'MAD'
      }).format(numericAmount);
    } catch (e) {
      console.warn(`Invalid currency: ${currency}`);
      return `${numericAmount.toFixed(2)} ${currency || 'MAD'}`;
    }
  }

  copyAccountNumber(accountNumber: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber).then(() => {
        this.showSuccess('Account number copied to clipboard!');
      }).catch(() => {
        this.showError('Failed to copy account number');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = accountNumber;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        this.showSuccess('Account number copied to clipboard!');
      } catch (err) {
        this.showError('Failed to copy account number');
      }
      document.body.removeChild(textArea);
    }
  }

  trackByAccount(index: number, account: Account): any {
    return account.id || index;
  }

  // Notification Methods
  private showSuccess(message: string): void {
    // You can integrate with a toast notification service here
    // For now, using simple alert
    console.log('Success:', message);
    alert(message);
  }

  private showError(message: string): void {
    // You can integrate with a toast notification service here
    // For now, using simple alert
    console.error('Error:', message);
    this.error = message;
    alert(message);
  }

  // Navigation Methods
  goToTransactions(): void {
    this.router.navigate(['/agent/transactions'], {
      queryParams: { userId: this.user_id }
    });
  }

  goToUsersList(): void {
    this.router.navigate(['/agent/manage-users']);
  }

  // Account Type Utilities
  getAccountTypeIcon(accountType: string): string {
    switch (accountType?.toLowerCase()) {
      case 'savings':
        return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
      case 'checking':
        return 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';
      case 'crypto':
        return 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
      default:
        return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
    }
  }

  getAccountTypeColor(accountType: string): string {
    switch (accountType?.toLowerCase()) {
      case 'savings':
        return 'green';
      case 'checking':
        return 'blue';
      case 'crypto':
        return 'purple';
      default:
        return 'gray';
    }
  }

  // Form Validation
  isFormValid(): boolean {
    return !!(this.user?.username && this.user?.email && this.user?.phone);
  }

  isCreateAccountFormValid(): boolean {
    return !!(this.newAccount?.alias &&
      this.newAccount?.accountNumber &&
      this.newAccount?.balance !== undefined &&
      this.newAccount?.currency &&
      this.newAccount?.accountType &&
      this.newAccount?.status);
  }

  isUpdateAccountFormValid(): boolean {
    return !!(this.updatedAccount?.alias &&
      this.updatedAccount?.balance !== undefined &&
      this.updatedAccount?.currency &&
      this.updatedAccount?.accountType &&
      this.updatedAccount?.status);
  }

  // Data Refresh
  refreshData(): void {
    this.loadUserData();
    this.loadUserAccounts();
  }

  // Export functionality
  exportUserData(): void {
    const userData = {
      user: this.user,
      accounts: this.accounts,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `user-${this.user?.username || this.user_id}-data.json`;
    link.click();

    window.URL.revokeObjectURL(url);
    this.showSuccess('User data exported successfully!');
  }

  // Account Statistics
  getAccountsByType(): { [key: string]: number } {
    const types: { [key: string]: number } = {};
    this.accounts.forEach(account => {
      const type = account.accountType || 'Unknown';
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }

  getAccountsByStatus(): { [key: string]: number } {
    const statuses: { [key: string]: number } = {};
    this.accounts.forEach(account => {
      const status = account.status || 'Unknown';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    return statuses;
  }

  // Validation helpers
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Form helpers
  onEmailChange(): void {
    if (this.user?.email && !this.isValidEmail(this.user.email)) {
      console.warn('Invalid email format');
    }
  }

  onPhoneChange(): void {
    if (this.user?.phone && !this.isValidPhone(this.user.phone)) {
      console.warn('Invalid phone format');
    }
  }

  // Modal management helpers
  isModalOpen(modalId: string): boolean {
    const modal = document.getElementById(modalId);
    return modal ? modal.style.display === 'block' : false;
  }

  closeAllModals(): void {
    this.closeModal('createAccountModal');
    this.closeModal('updateAccountModal');
  }
}

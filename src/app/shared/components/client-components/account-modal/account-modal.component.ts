import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccountExport } from '../../../../core/models/account.export.model';
import { FormsModule } from '@angular/forms';
import { Account } from '../../../../core/models/account.model';

interface AccountType {
  value: string;
  label: string;
  description: string;
  icon: string;
  bgClass: string;
  iconClass: string;
}

@Component({
  selector: 'app-account-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-modal.component.html',
  standalone: true,
  styleUrl: './account-modal.component.css'
})
export class AccountModalComponent implements OnInit {

  @Input() title: string = "Create Account";
  @Input() submitButtonText: string = "Create";
  @Input() newAccount: AccountExport = {} as AccountExport;
  @Input() updatedAccount: Account = {} as Account;

  @Output() actionAccountEvent: EventEmitter<AccountExport> = new EventEmitter<AccountExport>();
  @Output() closeModalEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() stopPropagationEvent: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  // Account type configurations
  accountTypes: AccountType[] = [
    {
      value: 'Savings',
      label: 'Savings Account',
      description: 'Earn interest on your deposits',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
      bgClass: 'bg-green-600/20',
      iconClass: 'text-green-400'
    },
    {
      value: 'Checking',
      label: 'Checking Account',
      description: 'For everyday transactions and payments',
      icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
      bgClass: 'bg-blue-600/20',
      iconClass: 'text-blue-400'
    },
    {
      value: 'Crypto',
      label: 'Crypto Wallet',
      description: 'Store and manage cryptocurrencies',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      bgClass: 'bg-purple-600/20',
      iconClass: 'text-purple-400'
    }
  ];

  ngOnInit(): void {
    // Set default values if creating new account
    if (this.submitButtonText === 'Create' && !this.newAccount.currency) {
      this.newAccount.currency = 'MAD';
      this.newAccount.status = 'ACTIVE';
    }
  }

  actionAccount(): void {
    if (this.isFormValid()) {
      this.actionAccountEvent.emit(this.newAccount);
    } else {
      this.showValidationErrors();
    }
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
    this.stopPropagationEvent.emit(event);
  }

  closeModal(event?: MouseEvent): void {
    this.closeModalEvent.emit();
  }

  // Form validation
  isFormValid(): boolean {
    return !!(
      this.newAccount.alias?.trim() &&
      this.newAccount.accountNumber?.trim() &&
      this.newAccount.balance !== undefined &&
      this.newAccount.balance !== null &&
      this.newAccount.currency &&
      this.newAccount.accountType &&
      this.newAccount.status
    );
  }

  private showValidationErrors(): void {
    let errors: string[] = [];

    if (!this.newAccount.alias?.trim()) {
      errors.push('Account name is required');
    }

    if (!this.newAccount.accountNumber?.trim()) {
      errors.push('Account number is required');
    }

    if (this.newAccount.balance === undefined || this.newAccount.balance === null) {
      errors.push('Balance is required');
    }

    if (!this.newAccount.currency) {
      errors.push('Currency is required');
    }

    if (!this.newAccount.accountType) {
      errors.push('Account type is required');
    }

    if (!this.newAccount.status) {
      errors.push('Account status is required');
    }

    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
    }
  }

  // Utility methods
  formatBalance(balance: number | string): string {
    const numericBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (isNaN(numericBalance)) return '0.00';
    return numericBalance.toFixed(2);
  }

  onBalanceChange(): void {
    // Ensure balance is not negative
    if (this.newAccount.balance && this.newAccount.balance < 0) {
      this.newAccount.balance = 0;
    }
  }

  onAccountNumberChange(): void {
    // Remove any non-alphanumeric characters for account number
    if (this.newAccount.accountNumber) {
      this.newAccount.accountNumber = this.newAccount.accountNumber.replace(/[^a-zA-Z0-9]/g, '');
    }
  }

  onAliasChange(): void {
    // Trim whitespace and limit length
    if (this.newAccount.alias) {
      this.newAccount.alias = this.newAccount.alias.trim();
      if (this.newAccount.alias.length > 50) {
        this.newAccount.alias = this.newAccount.alias.substring(0, 50);
      }
    }
  }

  // Currency formatting helper
  getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      'MAD': 'DH',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'JPY': '¥'
    };
    return symbols[currency] || currency;
  }

  // Account type helper
  getSelectedAccountType(): AccountType | undefined {
    return this.accountTypes.find(type => type.value === this.newAccount.accountType);
  }

  // Keyboard event handlers
  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.actionAccount();
    }
  }

  onEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeModal();
    }
  }

  // Focus management
  focusFirstInput(): void {
    setTimeout(() => {
      const firstInput = document.querySelector('input[name="alias"]') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }

  // Form reset
  resetForm(): void {
    if (this.submitButtonText === 'Create') {
      this.newAccount = {
        user_id: this.newAccount.user_id,
        currency: 'MAD',
        status: 'ACTIVE'
      } as AccountExport;
    }
  }
}

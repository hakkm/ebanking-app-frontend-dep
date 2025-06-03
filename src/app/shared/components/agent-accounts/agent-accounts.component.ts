import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { debounceTime, Subject } from 'rxjs';
import { AccountService } from '../../../core/services/account.service';
import { Account } from '../../../core/models/account.model';
import { AgentService } from '../../../core/services/agent.service';


@Component({
  selector: 'app-agency-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-accounts.component.html',
  
})
export class AgentAccountsComponent implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  paginatedAccounts: Account[] = [];
  selectedAccount: Account | null = null;
  newAccount: Partial<Account> = { balance: 0, currency: 'MAD', accountType: 'Savings' };
  showModal = false;
  showCreateModal = false;
  isLoading = false;
  error: string | null = null;
  searchTerm = '';
  statusFilter = '';
  typeFilter = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  sortKey!: keyof Account  ; // Default to first key
  sortDirection: 'asc' | 'desc' = 'asc';
  Math = Math
  private searchSubject = new Subject<string>();

  constructor(private agentService: AgentService) {}

  ngOnInit() {
    this.fetchAccounts();
    // Debounce search input to avoid excessive filtering
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => this.applyFilters());
  }

  fetchAccounts() {
    this.isLoading = true;
    this.error = null;
    this.agentService.getAccounts().subscribe({
      next: (accounts:Account[]) => {
        this.accounts = accounts;
        console.log('Fetched accounts:', this.accounts);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load accounts. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.accounts];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(account =>
        account.id.toString().includes(term) ||
        account.alias.toLowerCase().includes(term) ||
        account.accountType.toLowerCase().includes(term) ||
        account.maskedAccountNumber.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(account => account.status === this.statusFilter);
    }

    if (this.typeFilter) {
      filtered = filtered.filter(account => account.accountType === this.typeFilter);
    }

    this.filteredAccounts = filtered;
    this.sortAccounts();
    this.updatePagination();
  }

  sortBy(key: keyof Account) {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.sortAccounts();
  }

  sortAccounts() {
    if (this.sortKey) {
      this.filteredAccounts.sort((a, b) => {
        const aValue = a[this.sortKey];
        const bValue = b[this.sortKey];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return this.sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if(aValue === null || aValue === undefined) return 1; // Treat null/undefined as greater
        if(bValue === null || bValue === undefined) return -1; // Treat null/undefined as lesser
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredAccounts.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedAccounts = this.filteredAccounts.slice(start, start + this.pageSize);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }

  viewAccount(account: Account) {
    this.selectedAccount = account;
    this.showModal = true;
  }

  toggleAccountStatus(account: Account) {
    // const newStatus = account.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    // this.accountService.updateAccountStatus(account.id, newStatus).subscribe({
    //   next: () => {
    //     account.status = newStatus;
    //     this.applyFilters();
    //     this.closeModal();
    //   },
    //   error: () => {
    //     this.error = 'Failed to update account status.';
    //   }
    // });
  }

  openCreateAccountModal() {
    this.newAccount = { balance: 0, currency: 'MAD', accountType: 'Savings' };
    this.showCreateModal = true;
  }

  createAccount() {
    if (!this.newAccount.alias || !this.newAccount.accountType || !this.newAccount.currency) {
      this.error = 'Please fill in all required fields.';
      return;
    }

    // this.accountService.createAccount(this.newAccount as Account).subscribe({
    //   next: (newAccount) => {
    //     this.accounts.push(newAccount);
    //     this.applyFilters();
    //     this.closeCreateModal();
    //   },
    //   error: () => {
    //     this.error = 'Failed to create account.';
    //   }
    // });
  }

  closeModal() {
    this.showModal = false;
    this.selectedAccount = null;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newAccount = { balance: 0, currency: 'MAD', accountType: 'Savings' };
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    // this.sortKey = '';
    this.sortDirection = 'asc';
    this.currentPage = 1;
    this.applyFilters();
  }

  refreshAccounts() {
    this.fetchAccounts();
  }

  trackByAccount(index: number, account: Account): number {
    return account.id;
  }

  get activeAccountsCount(): number {
    return this.accounts.filter(account => account.status === 'ACTIVE').length;
  }

  get pendingAccountsCount(): number {
    return this.accounts.filter(account => account.status === 'PENDING').length;
  }

  get suspendedAccountsCount(): number {
    return this.accounts.filter(account => account.status === 'SUSPENDED').length;
  }

  get totalBalance(): number {
    return this.accounts.reduce((sum, account) => sum + account.balance, 0);
  }

  // Handle search input changes
  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TransactionService } from '../../../../core/services/transaction.service';
import { AgentService } from '../../../../core/services/agent.service';
import { AccountService } from '../../../../core/services/account.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Import your actual models
import { Transaction } from '../../../../core/models/transaction.model';
import { Account } from '../../../../core/models/account.model';

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

@Component({
  selector: 'app-agent-transaction',
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-transaction.component.html',
  standalone: true,
  styleUrl: './agent-transaction.component.css'
})
export class AgentTransactionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];
  selectedTransaction: Transaction | null = null;
  accounts: Account[] = [];

  // UI State
  isLoading: boolean = false;
  showModal: boolean = false;
  error: string | null = null;

  // Filter properties
  searchTerm: string = '';
  statusFilter: string = '';
  typeFilter: string = '';
  startDate: string = '';
  endDate: string = '';

  // Sorting
  sortField: string = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  // Statistics
  todayCount: number = 0;
  completedCount: number = 0;
  pendingCount: number = 0;
  totalVolume: number = 0;

  // Math reference for template
  Math = Math;

  constructor(
    private transactionService: TransactionService,
    private agentService: AgentService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load accounts for mapping account IDs to names
  loadAccounts(): void {
    this.accountService.getAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accounts: Account[]) => {
          this.accounts = accounts;
          console.log('Accounts loaded:', accounts);
        },
        error: (error) => {
          console.error('Error loading accounts:', error);
        }
      });
  }

  // Data Loading - Updated based on your home component pattern
  loadTransactions(): void {
    this.isLoading = true;
    this.error = null;

    // Use agentService.getTransactions() like in your setup
    this.agentService.getTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('Raw API response:', data);

          // Direct assignment since data should already be Transaction[]
          this.transactions = data || [];
          console.log('Processed transactions:', this.transactions);

          this.applyFilters();
          this.calculateStatistics();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching transactions:', error);
          this.error = 'Failed to load transactions. Please try again.';
          this.isLoading = false;

          // Use test data for development
          this.loadTestData();
        }
      });
  }

  // Test data for development
  private loadTestData(): void {
    this.transactions = [
      {
        id: 1,
        fromAccountId: 1001,
        toAccountId: 1002,
        amount: 150.00,
        description: 'Monthly rent payment',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        fromAccountId: 1003,
        toAccountId: 1001,
        amount: 75.50,
        description: 'Grocery shopping',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        fromAccountId: 1001,
        toAccountId: 1004,
        amount: 500.00,
        description: 'Investment transfer',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 4,
        fromAccountId: 1005,
        toAccountId: 1001,
        amount: 25.00,
        description: 'Coffee shop payment',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 5,
        fromAccountId: 1001,
        toAccountId: 1006,
        amount: 200.00,
        description: 'Utility bill payment',
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    this.applyFilters();
    this.calculateStatistics();
    console.log('Using test data:', this.transactions);
  }

  refreshTransactions(): void {
    this.loadTransactions();
  }

  // Filtering and Search
  applyFilters(): void {
    let filtered = [...this.transactions];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        (t.fromAccountId?.toString().includes(term)) ||
        (t.toAccountId?.toString().includes(term)) ||
        (t.description?.toLowerCase().includes(term)) ||
        (t.amount.toString().includes(term))
      );
    }

    // Status filter (based on transaction properties)
    if (this.statusFilter) {
      filtered = filtered.filter(t => this.getTransactionStatus(t) === this.statusFilter);
    }

    // Type filter (based on transaction direction)
    if (this.typeFilter) {
      filtered = filtered.filter(t => this.getTransactionType(t) === this.typeFilter);
    }

    // Date range filter
    if (this.startDate) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.createdAt || '');
        return transactionDate >= new Date(this.startDate);
      });
    }
    if (this.endDate) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.createdAt || '');
        return transactionDate <= new Date(this.endDate);
      });
    }

    this.filteredTransactions = filtered;
    this.applySorting();
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  // Sorting
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
    this.updatePagination();
  }

  private applySorting(): void {
    this.filteredTransactions.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortField) {
        case 'createdAt':
          aValue = new Date(a.createdAt || '').getTime();
          bValue = new Date(b.createdAt || '').getTime();
          break;
        case 'amount':
          aValue = Number(a.amount) || 0;
          bValue = Number(b.amount) || 0;
          break;
        case 'fromAccountId':
          aValue = a.fromAccountId || 0;
          bValue = b.fromAccountId || 0;
          break;
        case 'toAccountId':
          aValue = a.toAccountId || 0;
          bValue = b.toAccountId || 0;
          break;
        default:
          aValue = a[this.sortField as keyof Transaction];
          bValue = b[this.sortField as keyof Transaction];
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTransactions = this.filteredTransactions.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Statistics
  calculateStatistics(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.todayCount = this.transactions.filter(t => {
      const transactionDate = new Date(t.createdAt || '');
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() === today.getTime();
    }).length;

    // For completed/pending, we'll consider all transactions as completed since
    // the model doesn't have a status field
    this.completedCount = this.transactions.length;
    this.pendingCount = 0;

    this.totalVolume = this.transactions
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  // Helper Methods for Template
  getTransactionStatus(transaction: Transaction): string {
    // Since the model doesn't have status, assume all are completed
    // You can enhance this based on your business logic
    return 'completed';
  }

  getTransactionType(transaction: Transaction): string {
    // Determine type based on the transaction direction
    if (transaction.fromAccountId && transaction.toAccountId) {
      return 'transfer';
    }
    return 'payment';
  }

  getTransactionCurrency(transaction: Transaction): string {
    const account = this.accounts.find(
      acc => acc.id === transaction.fromAccountId || acc.id === transaction.toAccountId
    );
    return account ? account.currency : 'MAD';
  }

  getAccountName(accountId: number | undefined): string {
    if (!accountId) return 'Unknown Account';

    const account = this.accounts.find(acc => acc.id === accountId);
    if (account) {
      return account.alias || account.accountType || `Account ${account.maskedAccountNumber}`;
    }

    return `Account ${accountId}`;
  }

  // Format currency based on your home component pattern
  formatCurrency(amount: number, currency?: string): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'MAD'
      }).format(amount);
    } catch (e) {
      return `${amount.toFixed(2)} ${currency || 'MAD'}`;
    }
  }

  isPositiveTransaction(transaction: Transaction): boolean {
    return transaction.amount > 0;
  }

  isNeutralTransaction(transaction: Transaction): boolean {
    return transaction.amount === 0;
  }

  trackByTransaction(index: number, transaction: Transaction): any {
    return `${transaction.fromAccountId}-${transaction.toAccountId}-${transaction.createdAt}` || index;
  }

  // Generate a unique ID for display purposes
  getTransactionId(transaction: Transaction): string {
    const timestamp = new Date(transaction.createdAt || '').getTime();
    return `TXN${transaction.fromAccountId}${transaction.toAccountId}${timestamp}`.slice(0, 15);
  }

  // Modal Management
  viewTransaction(transaction: Transaction): void {
    this.selectedTransaction = { ...transaction };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTransaction = null;
  }

  // Actions
  downloadReceipt(transaction: Transaction): void {
    const transactionId = this.getTransactionId(transaction);
    console.log('Downloading receipt for transaction:', transactionId);

    const receiptData = this.generateReceiptData(transaction);
    this.downloadFile(receiptData, `receipt-${transactionId}.txt`, 'text/plain');
  }

  private generateReceiptData(transaction: Transaction): string {
    const transactionId = this.getTransactionId(transaction);
    return `
TRANSACTION RECEIPT
==================
Transaction ID: ${transactionId}
Date: ${new Date(transaction.createdAt || '').toLocaleString()}
From: ${this.getAccountName(transaction.fromAccountId)}
To: ${this.getAccountName(transaction.toAccountId)}
Amount: ${this.formatCurrency(transaction.amount)}
Description: ${transaction.description || 'N/A'}
==================
    `.trim();
  }

  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  flagTransaction(transaction: Transaction): void {
    const transactionId = this.getTransactionId(transaction);
    console.log('Flagging transaction:', transactionId);

    if (confirm(`Are you sure you want to flag transaction ${transactionId}?`)) {
      console.log('Transaction flagged successfully');
      // TODO: Implement actual flagging logic
    }
  }

  exportTransactions(): void {
    console.log('Exporting transactions...');

    const csvData = this.generateCSV(this.filteredTransactions);
    this.downloadFile(csvData, `transactions-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }

  private generateCSV(transactions: Transaction[]): string {
    const headers = ['ID', 'Date', 'From Account', 'To Account', 'Amount', 'Description'];
    const rows = transactions.map(t => [
      this.getTransactionId(t),
      new Date(t.createdAt || '').toISOString(),
      this.getAccountName(t.fromAccountId),
      this.getAccountName(t.toAccountId),
      t.amount.toString(),
      t.description || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Additional Transaction Actions
  approveTransaction(transaction: Transaction): void {
    const transactionId = this.getTransactionId(transaction);
    console.log('Approving transaction:', transactionId);
    // TODO: Implement approval logic
  }

  rejectTransaction(transaction: Transaction): void {
    const transactionId = this.getTransactionId(transaction);
    console.log('Rejecting transaction:', transactionId);
    // TODO: Implement rejection logic
  }

  reverseTransaction(transaction: Transaction): void {
    const transactionId = this.getTransactionId(transaction);
    console.log('Reversing transaction:', transactionId);
    // TODO: Implement reversal logic
  }
}

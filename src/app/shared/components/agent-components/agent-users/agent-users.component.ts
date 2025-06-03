import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { Client } from '../../../../core/models/client.model';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

interface NewUser {
  username: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-agent-users',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './agent-users.component.html',
  standalone: true
})
export class AgentUsersComponent implements OnInit {

  // Data properties
  users: Client[] = [];
  filteredUsers: Client[] = [];
  renderedUsers: Client[] = [];

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  startIndex: number = 0;
  endIndex: number = 10;
  totalPages: number = 1;

  // Search and filter properties
  searchQuery: string = '';
  currentFilter: string = 'all';
  sortField: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  // UI state properties
  showFilterDropdown: boolean = false;
  showTransactionModal: boolean = false;
  showAddUserModal: boolean = false;
  activeUserActions: null | number = null;

  // Stats properties
  totalUsers: number = 0;
  activeUsers: number = 0;
  newUsersThisMonth: number = 0;
  pendingUsers: number = 0;

  // Modal data
  selectedUser: Client | null = null;
  userTransactions: Transaction[] = [];
  newUser: NewUser = {
    username: '',
    email: '',
    phone: ''
  };

  // Make Math available in template
  Math = Math;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.filter-dropdown')) {
      this.showFilterDropdown = false;
    }

    if (!target.closest('.user-actions-dropdown')) {
      this.activeUserActions = null;
    }
  }

  // Data loading and management
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response: Client[]) => {
        console.log('Users loaded:', response);
        this.users = response;
        this.calculateStats();
        this.applyFiltersAndSearch();
      },
      error: (error: any) => {
        console.error('Error fetching users:', error);
        // TODO: Show error toast/notification
      }
    });
  }

  calculateStats(): void {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(user => this.getUserStatus(user) === 'active').length;
    this.pendingUsers = this.users.filter(user => this.getUserStatus(user) === 'pending').length;

    // Calculate new users this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    this.newUsersThisMonth = this.users.filter(user =>
      new Date(user.createTime) >= thisMonth
    ).length;
  }

  // Search and filtering
  onSearch(): void {
    this.currentPage = 1;
    this.applyFiltersAndSearch();
  }

  toggleFilterDropdown(): void {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  applyFilter(filter: string): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.showFilterDropdown = false;
    this.applyFiltersAndSearch();
  }

  private applyFiltersAndSearch(): void {
    let filtered = [...this.users];

    // Apply search
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toString().includes(query) ||
        (user.phone && user.phone.includes(query))
      );
    }

    // Apply filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(user => {
        const status = this.getUserStatus(user);
        switch (this.currentFilter) {
          case 'active':
            return status === 'active';
          case 'inactive':
            return status === 'inactive';
          case 'recent':
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return new Date(user.createTime) >= oneWeekAgo;
          default:
            return true;
        }
      });
    }

    this.filteredUsers = filtered;
    this.calculatePagination();
    this.updateRenderedUsers();
  }

  // Sorting
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredUsers.sort((a, b) => {
      let aValue = a[field as keyof Client];
      let bValue = b[field as keyof Client];

      if (field === 'createTime') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updateRenderedUsers();
  }

  // Pagination
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredUsers.length);
  }

  updateRenderedUsers(): void {
    this.calculatePagination();
    this.renderedUsers = this.filteredUsers.slice(this.startIndex, this.endIndex);
  }

  onNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateRenderedUsers();
    }
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateRenderedUsers();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateRenderedUsers();
    }
  }

  goToFirstPage(): void {
    this.currentPage = 1;
    this.updateRenderedUsers();
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
    this.updateRenderedUsers();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updateRenderedUsers();
  }

  getVisiblePages(): number[] {
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

  // User actions and modals
  toggleUserActions(userId: number): void {
    this.activeUserActions = this.activeUserActions === userId ? null : userId;
  }

  viewTransactions(user: Client): void {
    this.selectedUser = user;
    this.loadUserTransactions(user.id);
    this.showTransactionModal = true;
  }

  private loadUserTransactions(userId: number): void {
    // Simulate loading transactions - replace with actual service call
    this.userTransactions = [
      {
        id: '1',
        type: 'deposit',
        amount: 1500.00,
        description: 'Salary Deposit',
        date: new Date('2025-05-20'),
        status: 'completed',
        reference: 'TXN001'
      },
      {
        id: '2',
        type: 'withdrawal',
        amount: 250.00,
        description: 'ATM Withdrawal',
        date: new Date('2025-05-18'),
        status: 'completed',
        reference: 'TXN002'
      },
      {
        id: '3',
        type: 'transfer',
        amount: 500.00,
        description: 'Transfer to Savings',
        date: new Date('2025-05-15'),
        status: 'pending',
        reference: 'TXN003'
      }
    ];
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.selectedUser = null;
    this.userTransactions = [];
  }

  openAddUserModal(): void {
    this.showAddUserModal = true;
    this.resetNewUserForm();
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
    this.resetNewUserForm();
  }

  addNewUser(): void {
    if (this.newUser.username && this.newUser.email) {
      // TODO: Implement actual user creation via service
      console.log('Creating new user:', this.newUser);

      // Simulate success
      this.closeAddUserModal();
      // TODO: Show success notification
      // TODO: Reload users list
    }
  }

  private resetNewUserForm(): void {
    this.newUser = {
      username: '',
      email: '',
      phone: ''
    };
  }

  // Utility methods
  getUserStatus(user: Client): 'active' | 'inactive' | 'pending' {
    // Simulate user status logic - replace with actual logic
    const random = Math.random();
    if (random > 0.8) return 'pending';
    if (random > 0.1) return 'active';
    return 'inactive';
  }

  getUserInitials(user: Client): string {
    return user.username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getUserJoinDate(createTime: string): string {
    const joinDate = new Date(createTime);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    if (daysDiff < 7) return `${daysDiff} days ago`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
    return joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  trackByUserId(index: number, user: Client): string {
    return user.id.toString();
  }

  // Export functionality
  exportToCSV(): void {
    const headers = ['ID', 'Username', 'Email', 'Phone', 'Created Date', 'Status'];
    const csvData = this.filteredUsers.map(user => [
      user.id,
      user.username,
      user.email,
      user.phone || '',
      new Date(user.createTime).toLocaleDateString(),
      this.getUserStatus(user)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Legacy modal methods (for compatibility)
  openModal(email: string): void {
    const user = this.users.find(u => u.email === email);
    if (user) {
      this.viewTransactions(user);
    }
  }

  closeModal(event?: Event): void {
    this.closeTransactionModal();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AgentSidebarComponent } from "../../components/agent-components/agent-sidebar/agent-sidebar.component";
import { AgentHeaderComponent } from "../../components/agent-components/agent-header/agent-header.component";
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  isLeaving?: boolean;
}

@Component({
  selector: 'app-agent-layout',
  imports: [AgentSidebarComponent, AgentHeaderComponent, RouterOutlet, CommonModule],
  templateUrl: './agent-layout.component.html',
  standalone: true
})
export class AgentLayoutComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Loading state
  isLoading: boolean = false;
  loadingMessage: string = '';

  // Page state
  currentPageTitle: string = '';
  showBreadcrumb: boolean = true;

  // Toast notifications
  activeToasts: Toast[] = [];
  private toastCounter: number = 0;

  // Page titles mapping
  private pageTitles: { [key: string]: string } = {
    '/agent/dashboard': 'Dashboard',
    '/agent/notifications': 'Notifications',
    '/agent/manage-users': 'Manage Users',
    '/agent/transactions': 'Transactions',
    '/agent/accounts': 'Accounts',
    '/agent/reports': 'Reports',
    '/agent/settings': 'Settings',
    '/agent/profile': 'Profile'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeRouteTracking();
    this.setCurrentPageTitle();

    // Example: Show welcome toast
    setTimeout(() => {
      this.showToast('success', 'Welcome Back!', 'Agent panel loaded successfully');
    }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeRouteTracking(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentPageTitle = this.pageTitles[event.url] || 'Dashboard';
        this.updateBreadcrumbVisibility(event.url);
      });
  }

  private setCurrentPageTitle(): void {
    const currentUrl = this.router.url;
    this.currentPageTitle = this.pageTitles[currentUrl] || 'Dashboard';
  }

  private updateBreadcrumbVisibility(url: string): void {
    // Hide breadcrumb on certain pages if needed
    const hideBreadcrumbPages = ['/agent/login', '/agent/register'];
    this.showBreadcrumb = !hideBreadcrumbPages.includes(url);
  }

  getCurrentPageTitle(): string {
    return this.currentPageTitle;
  }

  // Loading management
  showLoading(message: string = 'Loading...'): void {
    this.isLoading = true;
    this.loadingMessage = message;
  }

  hideLoading(): void {
    this.isLoading = false;
    this.loadingMessage = '';
  }

  // Toast notification system
  showToast(type: Toast['type'], title: string, message: string, duration: number = 5000): void {
    const toast: Toast = {
      id: `toast-${++this.toastCounter}`,
      type,
      title,
      message,
      duration,
      isLeaving: false
    };

    this.activeToasts.push(toast);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismissToast(toast.id);
      }, duration);
    }
  }

  dismissToast(toastId: string): void {
    const toast = this.activeToasts.find(t => t.id === toastId);
    if (toast) {
      toast.isLeaving = true;

      // Remove from array after animation
      setTimeout(() => {
        this.activeToasts = this.activeToasts.filter(t => t.id !== toastId);
      }, 300);
    }
  }

  // Utility methods for components to use
  showSuccessToast(title: string, message: string): void {
    this.showToast('success', title, message);
  }

  showErrorToast(title: string, message: string): void {
    this.showToast('error', title, message);
  }

  showWarningToast(title: string, message: string): void {
    this.showToast('warning', title, message);
  }

  showInfoToast(title: string, message: string): void {
    this.showToast('info', title, message);
  }

  // Page transition effects
  onRouteChange(): void {
    // Add any page transition logic here
    this.showLoading('Loading page...');

    // Simulate loading time
    setTimeout(() => {
      this.hideLoading();
    }, 500);
  }

  // Global error handling
  handleGlobalError(error: any): void {
    console.error('Global error:', error);
    this.showErrorToast(
      'System Error',
      'An unexpected error occurred. Please try again or contact support.'
    );
    this.hideLoading();
  }

  // Global success handling
  handleGlobalSuccess(message: string): void {
    this.showSuccessToast('Success', message);
  }

  // Help system
  openHelp(): void {
    console.log('Opening help for:', this.currentPageTitle);
    // TODO: Implement context-sensitive help
    // This could open a modal, sidebar, or navigate to help page
  }

  // Keyboard shortcuts (optional)
  onKeyboardShortcut(event: KeyboardEvent): void {
    // Ctrl/Cmd + K for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.focusSearch();
    }

    // Ctrl/Cmd + / for help
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault();
      this.openHelp();
    }
  }

  private focusSearch(): void {
    // Focus the search input in header
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  // Theme management (if needed)
  toggleTheme(): void {
    // TODO: Implement theme switching if multiple themes are supported
    console.log('Theme toggle requested');
  }

  // Session management
  checkSession(): void {
    // TODO: Implement session validation
    // Check if user session is still valid
    // Redirect to login if expired
  }

  // Network status
  onNetworkStatusChange(isOnline: boolean): void {
    if (isOnline) {
      this.showSuccessToast('Connection Restored', 'You are back online');
    } else {
      this.showWarningToast('Connection Lost', 'Check your internet connection');
    }
  }
}

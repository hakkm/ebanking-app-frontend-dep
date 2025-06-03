import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
}

@Component({
  selector: 'app-agent-header',
  imports: [CommonModule],
  templateUrl: './agent-header.component.html',
  standalone: true,
  styleUrl: './agent-header.component.css'
})
export class AgentHeaderComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Mobile detection
  isMobile: boolean = false;

  // Dropdown states
  showNotifications: boolean = false;
  showProfileDropdown: boolean = false;
  showMobileMenu: boolean = false;

  // Notification data
  unreadNotificationCount: number = 0;
  recentNotifications: Notification[] = [
    {
      id: '1',
      title: 'New User Registration',
      message: 'John Doe has registered for a new account and requires verification.',
      time: '2 minutes ago',
      type: 'info',
      read: false
    },
    {
      id: '2',
      title: 'Suspicious Transaction Alert',
      message: 'Large withdrawal detected - Account #1234567890 - Amount: $15,000',
      time: '15 minutes ago',
      type: 'warning',
      read: false
    },
    {
      id: '3',
      title: 'System Maintenance',
      message: 'Banking system will undergo scheduled maintenance tonight at 11 PM EST.',
      time: '1 hour ago',
      type: 'info',
      read: false
    },
    {
      id: '4',
      title: 'Account Verification Complete',
      message: 'Account verification for Jane Smith has been completed successfully.',
      time: '2 hours ago',
      type: 'success',
      read: true
    },
    {
      id: '5',
      title: 'Failed Login Attempt',
      message: 'Multiple failed login attempts detected for user account ID: U789456.',
      time: '3 hours ago',
      type: 'error',
      read: true
    }
  ];

  // Current user info
  currentUser = {
    name: 'Agent Smith',
    email: 'administrator@bank.com',
    role: 'Senior Banking Agent',
    id: 'A001'
  };

  constructor(private router: Router) {
    this.checkMobileView();
  }

  ngOnInit(): void {
    this.updateNotificationCount();
    this.checkMobileView();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Mobile detection and responsive handling
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkMobileView();
  }

  private checkMobileView(): void {
    this.isMobile = window.innerWidth < 768; // md breakpoint
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Close notifications dropdown if clicking outside
    if (!target.closest('.notifications-container') && this.showNotifications) {
      this.showNotifications = false;
    }

    // Close profile dropdown if clicking outside
    if (!target.closest('.profile-container') && this.showProfileDropdown) {
      this.showProfileDropdown = false;
    }

    // Close mobile menu if clicking outside
    if (!target.closest('.mobile-menu-container') && this.showMobileMenu) {
      this.showMobileMenu = false;
    }
  }

  // Date and time formatting
  getCurrentDateTime(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    return now.toLocaleDateString('en-US', options);
  }

  // Notification management
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showProfileDropdown = false;
    this.showMobileMenu = false;
  }

  markAsRead(notificationId: string): void {
    const notification = this.recentNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.updateNotificationCount();
      console.log(`Marked notification ${notificationId} as read`);
    }
  }

  markAllAsRead(): void {
    this.recentNotifications.forEach(notification => {
      notification.read = true;
    });
    this.updateNotificationCount();
    console.log('All notifications marked as read');
  }

  private updateNotificationCount(): void {
    this.unreadNotificationCount = this.recentNotifications.filter(n => !n.read).length;
  }

  viewAllNotifications(): void {
    console.log('Navigating to all notifications...');
    this.showNotifications = false;
    // TODO: Navigate to notifications page
    // this.router.navigate(['/agent/notifications']);
  }

  // Profile dropdown management
  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
    this.showNotifications = false;
    this.showMobileMenu = false;
  }

  navigateToProfile(): void {
    console.log('Navigating to profile...');
    this.showProfileDropdown = false;
    this.router.navigate(['/agent/profile']);
  }

  navigateToSettings(): void {
    console.log('Navigating to settings...');
    this.showProfileDropdown = false;
    this.router.navigate(['/agent/settings']);
  }

  navigateToSecurity(): void {
    console.log('Navigating to security settings...');
    this.showProfileDropdown = false;
    this.router.navigate(['/agent/security']);
  }

  openHelp(): void {
    console.log('Opening help & support...');
    this.showProfileDropdown = false;
    // TODO: Open help modal or navigate to help page
    // this.router.navigate(['/agent/help']);
  }

  logout(): void {
    console.log('Logging out...');
    this.showProfileDropdown = false;

    // Clear authentication data
    this.clearAuthData();

    // Navigate to login
    this.router.navigate(['/agent/login']);
  }

  private clearAuthData(): void {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');

    // Clear sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userSession');

    console.log('Authentication data cleared');
  }

  // Mobile menu management
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    this.showNotifications = false;
    this.showProfileDropdown = false;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  // Actions
  createNewAction(): void {
    console.log('Creating new action...');
    // TODO: Open modal or navigate to action creation page
    // this.router.navigate(['/agent/new-action']);
  }

  // Utility methods
  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'check_circle';
      default:
        return 'info';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-blue-400';
    }
  }

  // Keyboard shortcuts
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Escape key closes all dropdowns
    if (event.key === 'Escape') {
      this.showNotifications = false;
      this.showProfileDropdown = false;
      this.showMobileMenu = false;
    }

    // Ctrl/Cmd + Shift + N for notifications
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'N') {
      event.preventDefault();
      this.toggleNotifications();
    }

    // Ctrl/Cmd + Shift + P for profile
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
      event.preventDefault();
      this.toggleProfileDropdown();
    }
  }

  // Animation and transition helpers
  onDropdownEnter(): void {
    // Add entrance animation logic if needed
  }

  onDropdownLeave(): void {
    // Add exit animation logic if needed
  }

  // Real-time updates (simulate with interval for demo)
  simulateRealTimeUpdates(): void {
    // This would typically be replaced with WebSocket or SSE connections
    setInterval(() => {
      if (Math.random() > 0.95) { // 5% chance every interval
        this.addNewNotification();
      }
    }, 30000); // Check every 30 seconds
  }

  private addNewNotification(): void {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: 'New Alert',
      message: 'A new system alert has been generated.',
      time: 'Just now',
      type: 'info',
      read: false
    };

    this.recentNotifications.unshift(newNotification);
    this.updateNotificationCount();

    // Limit to last 10 notifications
    if (this.recentNotifications.length > 10) {
      this.recentNotifications = this.recentNotifications.slice(0, 10);
    }
  }
}

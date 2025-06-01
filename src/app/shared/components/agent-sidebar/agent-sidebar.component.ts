import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

interface MenuItem {
  path: string;
  label: string;
  description: string;
  icon: string;
  badge?: {
    text: string;
    color: string;
  };
}

@Component({
  selector: 'app-agent-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './agent-sidebar.component.html',
  standalone: true,
  styleUrl: './agent-sidebar.component.css'
})
export class AgentSidebarComponent implements OnInit {

  currentRoute: string = '';

  // Menu items configuration
  menuItems: MenuItem[] = [
    {
      path: '/agent/dashboard',
      label: 'Dashboard',
      description: 'Overview & Analytics',
      icon: 'dashboard'
    },
    {
      path: '/agent/notifications',
      label: 'Notifications',
      description: 'Alerts & Updates',
      icon: 'notifications',
      badge: {
        text: '3',
        color: 'bg-red-600'
      }
    },
    {
      path: '/agent/manage-users',
      label: 'Manage Users',
      description: 'User Administration',
      icon: 'group'
    },
    {
      path: '/agent/transactions',
      label: 'Transactions',
      description: 'Payment History',
      icon: 'receipt'
    },
    {
      path: '/agent/accounts',
      label: 'Accounts',
      description: 'Account Management',
      icon: 'account_balance'
    },
    {
      path: '/agent/reports',
      label: 'Reports',
      description: 'Analytics & Insights',
      icon: 'assessment'
    }
  ];

  // User information
  currentUser = {
    name: 'Agent Smith',
    email: 'administrator@bank.com',
    id: 'A001',
    status: 'online'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Track current route for active state management
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });

    // Set initial route
    this.currentRoute = this.router.url;
  }

  logout(): void {
    console.log('Logging out...');

    // Clear any stored authentication data
    this.clearAuthData();

    // Navigate to login page
    this.router.navigate(['/agent/login']);

    // TODO: Implement proper logout logic
    // - Clear JWT tokens
    // - Clear session storage
    // - Call logout API endpoint
    // - Clear user state management
  }

  private clearAuthData(): void {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');

    // Clear sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userSession');

    // TODO: Clear any other stored data
    console.log('Authentication data cleared');
  }

  // Method to check if current route is active
  isRouteActive(path: string): boolean {
    return this.currentRoute === path || this.currentRoute.startsWith(path + '/');
  }

  // Method to get notification count (this would typically come from a service)
  getNotificationCount(): number {
    // TODO: Replace with actual service call
    return 3;
  }

  // Method to handle profile click
  onProfileClick(): void {
    console.log('Profile clicked');
    // TODO: Implement profile management
    // this.router.navigate(['/agent/profile']);
  }

  // Method to handle settings (if needed)
  openSettings(): void {
    console.log('Settings clicked');
    // TODO: Implement settings page
    // this.router.navigate(['/agent/settings']);
  }

  // Method to get user initials for avatar fallback
  getUserInitials(): string {
    return this.currentUser.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase();
  }
}

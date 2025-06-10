import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agent-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './agent-sidebar.component.html',
  standalone: true,
  styles: [`
    /* Optional: Add any component-specific styles here */
    :host {
      display: block;
      height: 100%;
    }

    /* Active link highlight animation */
    a.border-l-2 {
      position: relative;
      overflow: hidden;
    }

    a.border-l-2::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 2px;
      height: 100%;
      background: linear-gradient(to bottom, #6366f1, #9333ea);
      box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
    }
  `]
})
export class AgentSidebarComponent implements OnInit {

  // Current user info
  currentUser = {
    name: 'Agent Smith',
    email: 'administrator@bank.com',
    role: 'Senior Banking Agent',
    id: 'A001'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Component initialization logic if needed
  }

  getUserInitials(): string {
    if (!this.currentUser.name) {
      return 'A';
    }

    // Get first letter of first and last name if possible
    const nameParts = this.currentUser.name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }

    // Otherwise just use the first letter
    return this.currentUser.name[0].toUpperCase();
  }

  logout(): void {
    console.log('Agent logging out...');

    // Clear authentication data
    this.clearAuthData();

    // Navigate to agent login
    this.router.navigate(['/agent/login']);
  }

  private clearAuthData(): void {
    // Clear localStorage
    localStorage.removeItem('agentAuthToken');
    localStorage.removeItem('agentRefreshToken');
    localStorage.removeItem('agentUserInfo');

    // Clear sessionStorage
    sessionStorage.removeItem('agentAuthToken');
    sessionStorage.removeItem('agentUserSession');

    console.log('Agent authentication data cleared');
  }
}

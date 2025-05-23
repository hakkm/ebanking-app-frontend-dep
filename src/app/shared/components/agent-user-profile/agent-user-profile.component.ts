import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-agent-user-profile',
  imports: [FormsModule, CommonModule],
  templateUrl: './agent-user-profile.component.html',
  styleUrl: './agent-user-profile.component.css'
})
export class AgentUserProfileComponent implements OnInit {



  user: any = {};
  accounts: any[] = [];
  newAccount: any = { type: 'Savings', balance: 0 };

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.user = this.userService.getUser();
    this.accounts = this.userService.getAccounts();
  }

  updateUser() {
    this.userService.updateUser(this.user);
    alert('User updated successfully! (Implementation pending)');
  }

  deleteUser() {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser();
      alert('User deleted! (Implementation pending)');
      // Redirect or update UI as needed
    }
  }

  createAccount() {
    this.userService.createAccount(this.newAccount);
    this.accounts = this.userService.getAccounts();
    this.closeModal();
    alert('Account created successfully! (Implementation pending)');
  }

  openCreateAccountModal() {
    this.newAccount = { type: 'Savings', balance: 0 };
    const modal = document.getElementById('createAccountModal');
    if (modal) modal.classList.remove('hidden');
  }

  closeModal(event?: Event) {
    const modal = document.getElementById('createAccountModal');
    if (modal && (!event || event.target === modal)) {
      modal.classList.add('hidden');
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}

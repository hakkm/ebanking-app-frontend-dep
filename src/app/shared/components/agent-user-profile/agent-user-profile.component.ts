import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../../../core/models/client.model';
import { Account } from '../../../core/models/account.model';
import { AccountExport } from '../../../core/models/account.export.model';


@Component({
  selector: 'app-agent-user-profile',
  imports: [FormsModule, CommonModule],
  templateUrl: './agent-user-profile.component.html',
  
})
export class AgentUserProfileComponent implements OnInit {



  user!: Client;
  user_id!: number;
  accounts: Account[] = [];
  newAccount: AccountExport = {
    id: 0,
    accountNumber: '',
    accountType: '',
    alias: '',
    balance: 0,
    createdAt: '',
    currency: '',
    status: '',
    user_id: 0,
  };
      
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.user_id = this.route.snapshot.params['id'];
    this.newAccount.user_id = this.user_id;
    if(!this.user_id){
      alert('User ID is required!');
      return;
    }
    this.userService.getUser(this.user_id).subscribe((response: any) => {

      console.log('Users:', response);
      this.user = response;
      
    },
      (error: any) => {
        console.error('Error fetching users:', error);
      }
    );
    this.userService.getAccounts(this.user_id).subscribe((response: any) => {
      console.log('Accounts:', response);
      this.accounts.push(response)
    },
      (error: any) => {
        console.error('Error fetching accounts:', error);
      }
    );
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
    // this.accounts = this.userService.getAccounts();
    this.userService.createAccount(this.newAccount).subscribe((response: any) => {
      console.log('Account created:', response);
      this.accounts.push(response);
    },
      (error: any) => {
        console.error('Error creating account:', error);
      alert('Error creating account! (Implementation pending)');
      }
    );
    this.closeModal();
    alert('Account created successfully! (Implementation pending)');
  }

  openCreateAccountModal() {
    
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

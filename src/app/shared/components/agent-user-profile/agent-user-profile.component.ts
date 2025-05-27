import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../../../core/models/client.model';
import { Account } from '../../../core/models/account.model';
import { AccountExport } from '../../../core/models/account.export.model';
import { AccountModalComponent } from "../account-modal/account-modal.component";


@Component({
  selector: 'app-agent-user-profile',
  imports: [FormsModule, CommonModule, AccountModalComponent],
  templateUrl: './agent-user-profile.component.html',
  
})
export class AgentUserProfileComponent implements OnInit {



  user!: Client;
  user_id!: number;
  accounts: Account[] = [];
  newAccount: AccountExport = {} as AccountExport;
  updatedAccount: AccountExport = {} as AccountExport;
      
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
      this.accounts = response;
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
      this.newAccount = {} as AccountExport; 
    },
      (error: any) => {
        console.error('Error creating account:', error);
      alert('Error creating account! (Implementation pending)');
      }
    );
    this.closeModal("createAccountModal");
    alert('Account created successfully! (Implementation pending)');
  }

  openModal(id: string, account?: Account) {
    
    const modal = document.getElementById(id);
    if(id === 'updateAccountModal' && account) {
      
      this.updatedAccount = { 
        id: account.id,
        user_id: this.user_id,
        accountNumber: account.maskedAccountNumber,
        balance: account.balance,
        currency: account.currency,
        accountType: account.accountType,
        status: account.status,
        alias: account.alias,
        createdAt: account.createdAt || new Date().toISOString() 
       }; 
      
    }
    if(!modal)return;
    modal.style.display = 'block';
    
    // if (modal) modal.classList.remove('hidden');
    console.log(modal)
  }

  closeModal(id:string, event?: Event) {
    const modal = document.getElementById(id);
    if (modal && (!event || event.target === modal)) {
      

      modal.style.display = 'none';
      // modal.classList.add('hidden');
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  deleteAccount(accountId: number) {
    if (confirm('Are you sure you want to delete this account?')) {
      this.userService.deleteAccount(accountId).subscribe(() => {
        this.accounts = this.accounts.filter(account => account.id !== accountId);
        alert('Account deleted successfully! (Implementation pending)');
      },
        (error: any) => {
          console.error('Error deleting account:', error);
          alert('Error deleting account! (Implementation pending)');
        }
      );
    }
  }
  updateAccount() {
    this.userService.updateAccount(this.updatedAccount).subscribe((response: any) => {
      console.log('Account updated:', response);
      const index = this.accounts.findIndex(account => account.id === this.updatedAccount.id);
      if (index !== -1) {
        this.accounts[index] = response; 
      }
      this.closeModal("updateAccountModal");
      alert('Account updated successfully! (Implementation pending)');
    },
      (error: any) => {
        console.error('Error updating account:', error);
        alert('Error updating account! (Implementation pending)');
      }
    );
  }
}

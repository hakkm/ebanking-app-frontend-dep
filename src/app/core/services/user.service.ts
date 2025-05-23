import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private user = {
    id: 31,
    email: 'dan30@example.com',
    username: 'dan30',
    createdAt: 'May 23, 2025',
    phone: '123-456-0030',
  };

  private accounts = [
    { type: 'Savings', number: '****-6789', balance: 1500.50, createdAt: 'May 20, 2025' },
    { type: 'Checking', number: '****-1234', balance: 800.25, createdAt: 'May 15, 2025' },
  ];

  constructor(
    private http: HttpClient,
  ) { }


  getUsers(){
    return this.http.get<Client[]>(environment.apiUrl + '/agent/users');
  }



  getUser() {
    return { ...this.user };
  }

  updateUser(user: any) {
    this.user = { ...user };
    // In a real app, make an API call to update the user
  }

  deleteUser() {
    // In a real app, make an API call to delete the user
//    this.user = null;
    this.accounts = [];
  }

  getAccounts() {
    return [...this.accounts];
  }

  createAccount(account: any) {
    const newAccount = {
      type: account.type,
      number: '****-' + Math.floor(1000 + Math.random() * 9000), // Mock account number
      balance: account.balance,
      createdAt: 'May 23, 2025',
    };
    this.accounts.push(newAccount);
    // In a real app, make an API call to create the account
  }
}

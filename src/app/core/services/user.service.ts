import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Client } from '../models/client.model';
import { AccountExport } from '../models/account.export.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {



  constructor(
    private http: HttpClient,
  ) { }


  getUsers(){
    return this.http.get<Client[]>(environment.apiUrl + '/agent/users');
  }



  getUser(id:number) {
    return this.http.get<Client>(environment.apiUrl + `/agent/users/${id}`);
  }

  updateUser(user: any) {
    // this.user = { ...user };
    // In a real app, make an API call to update the user
  }

  deleteUser() {
    // In a real app, make an API call to delete the user
//    this.user = null;
    // this.accounts = [];
  }

  getAccounts(id: number) {
    return this.http.get(environment.apiUrl + `/client/accounts/${id}`)
  }

  createAccount(account: AccountExport) {
    
    account.createdAt = new Date().toISOString();
    
    return this.http.post(environment.apiUrl + '/agent/accounts', account)
    
  }
}

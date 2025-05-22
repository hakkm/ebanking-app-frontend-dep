import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';
import {Provider} from '../models/Provider.model';
import { Transaction } from '../models/transaction.model';
import { environment } from '../../../environments/environment';
import {ExternalTransaction} from '../models/ExternalTransaction.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/client/accounts`);
  }
  getProviders():Observable<Provider[]>{
    return this.http.get<Provider[]>(`${this.apiUrl}/providers/allproviders`)
  }
  getAccount(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/client/accounts/${id}`);
  }

  updateAccount(id: number, account: Account): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/client/accounts/${id}`, account);
  }


}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';

export interface DashboardStats {
  transactionsToday: number;
  subscribedUsers: number;
  internalTransactions: number;
  externalTransactions: number;
  targetProgress: number;
}

export interface TransactionData {
  date: string;
  internal: number;
  external: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  constructor(
    private http: HttpClient
  ) { }

  login({name, password}: {name: string, password: string}) {
    return this.http.post(environment.apiUrl + '/agent/public/login', {name, password});
  }

  getTransactions(){
    return this.http.get(environment.apiUrl + '/agent/transactions');
  }

  getTransaction(id: number) {
    return this.http.get(environment.apiUrl + `/agent/transactions/${id}`);
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(environment.apiUrl + '/agent/accounts');
  }

  // New dashboard methods
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(environment.apiUrl + '/agent/dashboard/stats');
  }

  getTransactionHistory(days: number = 7): Observable<TransactionData[]> {
    return this.http.get<TransactionData[]>(environment.apiUrl + `/agent/dashboard/transaction-history?days=${days}`);
  }

  getRecentUsers(limit: number = 4): Observable<any[]> {
    return this.http.get<any[]>(environment.apiUrl + `/agent/dashboard/recent-users?limit=${limit}`);
  }
}

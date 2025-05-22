import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { ExternalTransaction } from '../models/ExternalTransaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}
  



  getTransactions(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/client/transactions/${accountId}`);
  }

  getExternalTransactions(): Observable<ExternalTransaction[]> {
    return this.http.get<ExternalTransaction[]>(`${this.apiUrl}/external-transactions`);
  }

  createExternalTransfer(transaction: ExternalTransaction): Observable<ExternalTransaction> {
    return this.http.post<ExternalTransaction>(`${this.apiUrl}/external-transactions`, transaction);
  }

  createTransfer(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/client/transfer`, transaction);
  }
}

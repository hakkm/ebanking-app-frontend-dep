import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private banksUrl = '../banks.json'; // Adjust path as needed

  constructor(private http: HttpClient) {}

  getBankByCode(code: string): Observable<{ name: string; logo: string } | null> {
    return this.http.get<{ code: string; name: string; logo: string }[]>(this.banksUrl).pipe(
      map(banks => banks.find(bank => bank.code === code) || null),
      catchError(() => of(null))
    );
  }
}

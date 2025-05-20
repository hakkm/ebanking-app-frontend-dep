import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface MarketPrice {
  symbol: string;
  price: number;
}

export interface PortfolioItem {
  type: 'cash' | 'crypto';
  symbol: string;
  amount: number;
  value: number;
  tradingBalance?: number; // Optional field for cash items
}

export interface Transaction {
  type: string;
  amount: number;
  symbol: string;
  date: Date;
  price: number;
  total: number;
}

export interface TradeRequest {
  symbol: string;
  amount: number;
  action: 'buy' | 'sell';
}

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private apiUrl = environment.apiUrl;

  private defaultMarketPrices: MarketPrice[] = [
    { symbol: 'BTC/USD', price: -0.0 },
    { symbol: 'ETH/USD', price: -0.0 },
  ];

  private portfolio: PortfolioItem[] = [
    {
      type: 'cash',
      symbol: 'USD',
      amount: 5000.08,
      value: 5000.08,
      tradingBalance: 3000.0,
    },
    { type: 'crypto', symbol: 'BTC', amount: 0.23872, value: 16113.6 },
    { type: 'crypto', symbol: 'ETH', amount: 0.9715, value: 3448.83 },
  ];

  // Cache for performance optimization
  private cachedPortfolio: PortfolioItem[] | null = null;
  private cachedTransactions: Transaction[] | null = null;
  private cachedMarketPrices: MarketPrice[] | null = null;

  constructor(private http: HttpClient) {}

  getMarketPrices(): Observable<MarketPrice[]> {
    return this.http.get<MarketPrice[]>(`${this.apiUrl}/prices`).pipe(
      tap(prices => this.cachedMarketPrices = prices),
      catchError((error) => {
        console.error('Error fetching market prices:', error);
        if (this.cachedMarketPrices) {
          return of(this.cachedMarketPrices);
        }
        // Fallback to default data if no cache available
        return of(this.defaultMarketPrices);
      })
    );
  }

  getPortfolio(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.apiUrl}/portfolio`)
      .pipe(
        tap(portfolio => this.cachedPortfolio = portfolio),
        catchError(error => {
          console.error('Error fetching portfolio:', error);
          if (this.cachedPortfolio) {
            return of(this.cachedPortfolio);
          }
          // Fallback to empty portfolio if no cache available
          return of([]);
        })
      );
  }

  getTransactionHistory(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`).pipe(
      tap(transactions => this.cachedTransactions = transactions),
      catchError(error => {
        console.error('Error fetching transaction history:', error);
        if (this.cachedTransactions) {
          return of(this.cachedTransactions);
        }
        // Return empty array if no cache available
        return of([]);
      })
    );
  }

  executeTrade(tradeRequest: TradeRequest): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/trade`, tradeRequest).pipe(
      catchError(error => {
        console.error('Error executing trade:', error);
        return of(false);
      })
    );
  }
}

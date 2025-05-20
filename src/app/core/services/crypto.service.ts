import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface MarketPrice {
  symbol: string;
  price: number;
}

export interface PortfolioItem {
  type: 'cash' | 'crypto';
  symbol: string;
  amount: number;
  value: number;
  tradingBalance?: number;  // Optional field for cash items
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
  providedIn: 'root'
})
export class CryptoService {
  private marketPrices: MarketPrice[] = [
    { symbol: 'BTC/USD', price: 67500.00 },
    { symbol: 'ETH/USD', price: 3550.00 }
  ];

  private portfolio: PortfolioItem[] = [
    { type: 'cash', symbol: 'USD', amount: 5000.08, value: 5000.08, tradingBalance: 3000.00 },
    { type: 'crypto', symbol: 'BTC', amount: 0.23872, value: 16113.60 },
    { type: 'crypto', symbol: 'ETH', amount: 0.97150, value: 3448.83 }
  ];

  private transactionHistory: Transaction[] = [
    {
      type: 'Bought',
      amount: 0.034,
      symbol: 'ETH',
      date: new Date('2025-05-19T19:34:43'),
      price: 3550.00,
      total: 120.70
    },
    {
      type: 'Bought',
      amount: 0.00537,
      symbol: 'BTC',
      date: new Date('2025-05-19T19:36:37'),
      price: 67500.00,
      total: 362.47
    },
    {
      type: 'Bought',
      amount: 0.00239,
      symbol: 'BTC',
      date: new Date('2025-05-19T19:38:28'),
      price: 67500.00,
      total: 161.33
    },
    {
      type: 'Bought',
      amount: 0.00318,
      symbol: 'BTC',
      date: new Date('2025-05-19T19:34:23'),
      price: 67500.00,
      total: 214.65
    },
    {
      type: 'Bought',
      amount: 0.00424,
      symbol: 'BTC',
      date: new Date('2025-05-19T19:34:18'),
      price: 67500.00,
      total: 286.20
    }
  ];

  constructor() { }

  getMarketPrices(): Observable<MarketPrice[]> {
    // Simulate network delay
    return of(this.marketPrices).pipe(delay(500));
  }

  getPortfolio(): Observable<PortfolioItem[]> {
    return of(this.portfolio).pipe(delay(700));
  }

  getTransactionHistory(): Observable<Transaction[]> {
    return of(this.transactionHistory).pipe(delay(600));
  }

  executeTrade(tradeRequest: TradeRequest): Observable<boolean> {
    // Simulate successful trade
    console.log('Trade executed:', tradeRequest);

    // This would normally be sent to the backend
    // const endpoint = '/api/trade';
    // return this.http.post<boolean>(endpoint, tradeRequest);

    // For the mock implementation, we'll just return success after a delay
    return of(true).pipe(delay(1000));
  }

  updatePrices(): Observable<MarketPrice[]> {
    // Simulate small price fluctuations
    this.marketPrices.forEach(price => {
      const fluctuation = (Math.random() - 0.5) * 0.005; // ±0.25% change
      price.price = +(price.price * (1 + fluctuation)).toFixed(2);
    });

    // This would normally fetch from the backend
    // const endpoint = '/api/prices';
    // return this.http.get<MarketPrice[]>(endpoint);

    return of(this.marketPrices);
  }
}

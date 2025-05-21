import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, BehaviorSubject, interval, Subscription } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Represents the current market price for a cryptocurrency
 */
export interface MarketPrice {
  /** The cryptocurrency symbol (e.g., 'BTC', 'ETH') */
  symbol: string;
  /** The current price in USD */
  price: number;
}

/**
 * Represents an item in the user's portfolio
 */
export interface PortfolioItem {
  /** Type of the portfolio item - either cash or cryptocurrency */
  type: 'cash' | 'crypto';
  /** The cryptocurrency symbol or currency code */
  symbol: string;
  /** The amount of the asset held */
  amount: number;
  /** The current value in USD */
  value: number;
  /** Optional trading balance for the asset */
  tradingBalance?: number;
}

/**
 * Represents a cryptocurrency transaction
 */
export interface Transaction {
  /** Type of transaction (e.g., 'buy', 'sell') */
  type: string;
  /** Amount of cryptocurrency involved */
  amount: number;
  /** The cryptocurrency symbol */
  symbol: string;
  /** Date of the transaction */
  date: Date;
  /** Price per unit at time of transaction */
  price: number;
  /** Total value of the transaction */
  total: number;
}

/**
 * Represents a request to execute a trade
 */
export interface TradeRequest {
  /** The cryptocurrency symbol to trade */
  symbol: string;
  /** Amount to buy or sell */
  amount: number;
  /** The type of trade action */
  action: 'buy' | 'sell';
}

/**
 * Represents the response from a trade execution
 */
export interface TradeResponse {
  /** Whether the trade was successful */
  success: boolean;
  /** Response message or error description */
  message: string;
  /** Updated balance after trade (if successful) */
  newBalance?: number;
  /** Updated trading balance after trade (if successful) */
  newTradingBalance?: number;
}

/**
 * Service for handling cryptocurrency-related operations
 * Provides functionality for fetching market prices, managing portfolio,
 * executing trades, and retrieving transaction history
 */
@Injectable({
  providedIn: 'root',
})
export class CryptoService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/crypto`;
  private pricePollingSubscription: Subscription | null = null;
  private readonly POLLING_INTERVAL = 5000; // 5 seconds

  // BehaviorSubject for market prices
  private marketPricesSubject = new BehaviorSubject<MarketPrice[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  // Cache for performance optimization
  private cachedMarketPrices: MarketPrice[] | null = null;

  // Create BehaviorSubjects to hold the data
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private portfolioSubject = new BehaviorSubject<PortfolioItem[]>([]);

  constructor(private http: HttpClient) {
    // Initialize the data when the service is created
    this.loadInitialTransactions();
    this.loadInitialPortfolio();
    this.startPricePolling();
  }

  ngOnDestroy() {
    if (this.pricePollingSubscription) {
      this.pricePollingSubscription.unsubscribe();
    }
  }

  private startPricePolling() {
    // Initial load
    this.isLoadingSubject.next(true);
    this.fetchMarketPrices().subscribe();

    // Start polling
    this.pricePollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(switchMap(() => this.fetchMarketPrices()))
      .subscribe();
  }

  private fetchMarketPrices(): Observable<MarketPrice[]> {
    return this.http.get<MarketPrice[]>(`${this.apiUrl}/prices`).pipe(
      tap((prices) => {
        this.cachedMarketPrices = prices;
        this.marketPricesSubject.next(prices);
        this.isLoadingSubject.next(false);

        // Update portfolio values based on current prices
        const currentPortfolio = this.portfolioSubject.getValue();
        const updatedPortfolio = currentPortfolio.map((item) => {
          if (item.type === 'crypto') {
            const priceInfo = prices.find(
              (p) => p.symbol === `${item.symbol}/USD`
            );
            if (priceInfo) {
              return {
                ...item,
                value: item.amount * priceInfo.price,
              };
            }
          }
          return item;
        });
        this.portfolioSubject.next(updatedPortfolio);
      }),
      catchError((error) => {
        console.error('Error fetching market prices:', error);
        if (this.cachedMarketPrices) {
          this.marketPricesSubject.next(this.cachedMarketPrices);
        }
        this.isLoadingSubject.next(false);
        return of(this.cachedMarketPrices || []);
      })
    );
  }

  /**
   * Fetches current market prices for all supported cryptocurrencies
   * @returns Observable of array of market prices
   */
  getMarketPrices(): Observable<MarketPrice[]> {
    return this.marketPricesSubject.asObservable();
  }

  /**
   * Gets the loading state of market prices
   * @returns Observable of boolean indicating loading state
   */
  getMarketPricesLoadingState(): Observable<boolean> {
    return this.isLoadingSubject.asObservable();
  }

  // Private method to load initial portfolio
  private loadInitialPortfolio(): void {
    this.http
      .get<PortfolioItem[]>(`${this.apiUrl}/portfolio`)
      .subscribe((portfolio) => {
        console.log({portfolio});
        this.portfolioSubject.next(portfolio);
      });
  }

  // Private method to load initial transactions
  private loadInitialTransactions(): void {
    this.http
      .get<Transaction[]>(`${this.apiUrl}/transactions`)
      .subscribe((transactions) => this.transactionsSubject.next(transactions));
  }

  /**
   * Retrieves the user's current portfolio
   * @returns Observable of array of portfolio items
   */
  getPortfolio(): Observable<PortfolioItem[]> {
    return this.portfolioSubject.asObservable();
  }

  /**
   * Retrieves the user's transaction history
   * @returns Observable of array of transactions
   */
  getTransactionHistory(): Observable<Transaction[]> {
    return this.transactionsSubject.asObservable();
  }

  /**
   * Executes a cryptocurrency trade
   * @param tradeRequest The trade request containing symbol, amount, and action
   * @returns Observable of trade response
   */
  executeTrade(tradeRequest: TradeRequest): Observable<TradeResponse> {
    return this.http
      .post<TradeResponse>(`${this.apiUrl}/trade`, tradeRequest)
      .pipe(
        tap((response) => {
          if (response.success) {
            // After successful trade, fetch and update both transactions and portfolio
            this.http
              .get<Transaction[]>(`${this.apiUrl}/transactions`)
              .subscribe((transactions) =>
                this.transactionsSubject.next(transactions)
              );
            this.http
              .get<PortfolioItem[]>(`${this.apiUrl}/portfolio`)
              .subscribe((portfolio) => this.portfolioSubject.next(portfolio));
          }
        }),
        catchError((error) => {
          console.error('Error executing trade:', error);
          return of({
            success: false,
            message: 'Failed to execute trade. Please try again.',
          });
        })
      );
  }

  /**
   * Retrieves the available balance for a specific cryptocurrency
   * @param symbol The cryptocurrency symbol
   * @returns Observable of the available balance
   */
  getAvailableBalance(symbol: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/balance/${symbol}`).pipe(
      catchError((error) => {
        console.error(`Error fetching ${symbol} balance:`, error);
        return of(0);
      })
    );
  }
}

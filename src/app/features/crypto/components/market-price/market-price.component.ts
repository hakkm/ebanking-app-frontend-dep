import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CryptoService,
  MarketPrice,
} from '../../../../core/services/crypto.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-market-prices',
  templateUrl: './market-price.component.html',
  styleUrls: ['./market-price.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class MarketPricesComponent implements OnInit, OnDestroy {
  marketPrices: MarketPrice[] = [];
  isLoading = true;
  lastUpdateTime = new Date();
  private destroy$ = new Subject<void>();

  constructor(private cryptoService: CryptoService) {}

  ngOnInit(): void {
    // Subscribe to loading state
    this.cryptoService.getMarketPricesLoadingState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.isLoading = isLoading;
      });

    // Subscribe to market prices
    this.cryptoService.getMarketPrices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prices) => {
          this.marketPrices = prices;
          this.lastUpdateTime = new Date();
        },
        error: (err) => {
          console.error('Error loading market prices', err);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshPrices(): void {
    this.cryptoService.refreshMarketPrices();
  }
}

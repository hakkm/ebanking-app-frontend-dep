import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CryptoService,
  MarketPrice,
} from '../../../../core/services/crypto.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

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
  private subscription: Subscription | null = null;

  constructor(private cryptoService: CryptoService) {}

  ngOnInit(): void {
    this.subscription = this.cryptoService.getMarketPrices().subscribe({
      next: (prices) => {
        this.marketPrices = prices;
        this.lastUpdateTime = new Date();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading market prices', err);
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  refreshPrices(): void {
    this.isLoading = true;
    // The service will handle the refresh and emit new values
    this.cryptoService.getMarketPrices().subscribe();
  }
}

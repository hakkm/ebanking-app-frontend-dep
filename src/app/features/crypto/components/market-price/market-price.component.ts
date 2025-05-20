import { Component, OnInit } from '@angular/core';
import {
  CryptoService,
  MarketPrice,
} from '../../../../core/services/crypto.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-market-prices',
  templateUrl: './market-price.component.html',
  styleUrls: ['./market-price.component.css'],
  imports: [CommonModule],
})
export class MarketPricesComponent implements OnInit {
  marketPrices: MarketPrice[] = [];
  isLoading = true;
  lastUpdateTime = new Date();

  constructor(private cryptoService: CryptoService) {}

  ngOnInit(): void {
    this.loadMarketPrices();
  }

  loadMarketPrices(): void {
    this.isLoading = true;
    this.cryptoService.getMarketPrices().subscribe({
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

  refreshPrices(): void {
    this.loadMarketPrices();
  }
}

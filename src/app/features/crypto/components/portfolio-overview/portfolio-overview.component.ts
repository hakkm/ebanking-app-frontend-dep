import { Component, OnInit } from '@angular/core';
import {
  CryptoService,
  PortfolioItem,
} from '../../../../core/services/crypto.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portfolio-overview',
  templateUrl: './portfolio-overview.component.html',
  styleUrls: ['./portfolio-overview.component.css'],
  imports: [CommonModule],
})
export class PortfolioOverviewComponent implements OnInit {
  portfolioItems: PortfolioItem[] = [];
  isLoading = true;
  totalPortfolioValue = 0;
  tradingBalance = 0;

  constructor(private cryptoService: CryptoService) {}

  ngOnInit(): void {
    this.loadPortfolio();
  }

  loadPortfolio(): void {
    this.isLoading = true;
    this.cryptoService.getPortfolio().subscribe({
      next: (portfolio) => {
        this.portfolioItems = portfolio;
        this.calculateTotalValue();
        this.calculateTradingBalance();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading portfolio', err);
        this.isLoading = false;
      },
    });
  }

  private calculateTotalValue(): void {
    this.totalPortfolioValue = this.portfolioItems.reduce(
      (sum, item) => sum + item.value,
      0
    );
  }

  private calculateTradingBalance(): void {
    const cashItem = this.portfolioItems.find(item => item.type === 'cash');
    if (cashItem) {
      const cryptoValue = this.portfolioItems
        .filter(item => item.type === 'crypto')
        .reduce((sum, item) => sum + item.value, 0);
      this.tradingBalance = cashItem.amount - cryptoValue;
    }
  }

  getIcon(symbol: string): string {
    switch (symbol) {
      case 'USD':
        return '$';
      case 'BTC':
        return 'B';
      case 'ETH':
        return 'E';
      default:
        return symbol.charAt(0);
    }
  }

  getIconColor(symbol: string): string {
    switch (symbol) {
      case 'USD':
        return 'bg-green-500';
      case 'BTC':
        return 'bg-orange-500';
      case 'ETH':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  }
}

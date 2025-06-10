import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CryptoService,
  PortfolioItem,
} from '../../../../core/services/crypto.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-portfolio-overview',
  templateUrl: './portfolio-overview.component.html',
  styleUrls: ['./portfolio-overview.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class PortfolioOverviewComponent implements OnInit, OnDestroy {
  portfolioItems: PortfolioItem[] = [];
  isLoading = true;
  isFirstLoad = true;
  totalPortfolioValue = 0;
  tradingBalance = 0;
  private destroy$ = new Subject<void>();

  constructor(private cryptoService: CryptoService) {}

  ngOnInit(): void {
    // Subscribe to loading state
    this.cryptoService.getPortfolioLoadingState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.isLoading = isLoading;
      });

    // Subscribe to portfolio data
    this.cryptoService.getPortfolio()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (portfolio) => {
          this.portfolioItems = portfolio;
          this.calculateTotalValue();
          this.calculateTradingBalance();
          this.isFirstLoad = false;
        },
        error: (err) => {
          console.error('Error loading portfolio', err);
          this.isFirstLoad = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculateTotalValue(): void {
    this.totalPortfolioValue = this.portfolioItems.reduce(
      (sum, item) => sum + item.value,
      0
    );
  }

  private calculateTradingBalance(): void {
    const cashItem = this.portfolioItems.find((item) => item.type === 'cash');
    if (cashItem) {
      const cryptoValue = this.portfolioItems
        .filter((item) => item.type === 'crypto')
        .reduce((sum, item) => sum + item.value, 0);
      this.tradingBalance = cashItem.amount - cryptoValue;
    }
  }

  getIcon(symbol: string): string {
    return symbol === 'USD' ? '$' : symbol.charAt(0);
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

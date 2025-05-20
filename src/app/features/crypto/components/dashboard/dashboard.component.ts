import { Component, OnInit, OnDestroy } from '@angular/core';
import { CryptoService } from '../../../../core/services/crypto.service';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MarketPricesComponent } from '../market-price/market-price.component';
import { PortfolioOverviewComponent } from '../portfolio-overview/portfolio-overview.component';
import { TransactionHistoryComponent } from '../transaction-history/transaction-history.component';
import { TradeComponent } from '../trade/trade.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    CommonModule,
    MarketPricesComponent,
    PortfolioOverviewComponent,
    TransactionHistoryComponent,
    TradeComponent
  ]

})
export class DashboardComponent implements OnInit, OnDestroy {
  private priceUpdateSubscription?: Subscription;

  constructor(private cryptoService: CryptoService) { }

  ngOnInit(): void {
    // Update prices every 10 seconds
    this.priceUpdateSubscription = interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.cryptoService.updatePrices())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    if (this.priceUpdateSubscription) {
      this.priceUpdateSubscription.unsubscribe();
    }
  }
}

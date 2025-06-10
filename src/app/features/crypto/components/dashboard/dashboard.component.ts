import { Component, OnInit, OnDestroy } from '@angular/core';
import { CryptoService } from '../../../../core/services/crypto.service';
import { CommonModule } from '@angular/common';
import { MarketPricesComponent } from '../market-price/market-price.component';
import { PortfolioOverviewComponent } from '../portfolio-overview/portfolio-overview.component';
import { TransactionHistoryComponent } from '../transaction-history/transaction-history.component';
import { TradeComponent } from '../trade/trade.component';
import { AccountService } from '../../../../core/services/account.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MarketPricesComponent,
    PortfolioOverviewComponent,
    TransactionHistoryComponent,
    TradeComponent
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  isVerifying = true;
  hasAccess = false;
  private destroy$ = new Subject<void>();

  constructor(
    private cryptoService: CryptoService,
    private accountService: AccountService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.verifyAccountAccess();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cryptoService.stopPricePolling();
  }

  private verifyAccountAccess(): void {
    this.accountService.getAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accounts) => {
          if (accounts && accounts.length > 0) {
            this.hasAccess = true;
            this.cryptoService.startPricePolling();
          } else {
            this.toastr.error('You need to have an account to access this section', 'Access Denied', {
              positionClass: 'toast-bottom-right',
              progressBar: true,
              timeOut: 5000
            });
            this.router.navigate(['/home']);
          }
          this.isVerifying = false;
        },
        error: (error) => {
          console.error('Error verifying account access:', error);
          this.toastr.error('Error verifying account access', 'Error', {
            positionClass: 'toast-bottom-right',
            progressBar: true,
            timeOut: 5000
          });
          this.router.navigate(['/home']);
          this.isVerifying = false;
        }
      });
  }
}

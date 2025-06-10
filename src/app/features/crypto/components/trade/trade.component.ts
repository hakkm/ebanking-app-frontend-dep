import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CryptoService, MarketPrice, TradeRequest, TradeResponse } from '../../../../core/services/crypto.service';
import { Subject, takeUntil, timer } from 'rxjs';

/**
 * TradeComponent is responsible for handling cryptocurrency trading operations.
 * It provides functionality for buying and selling cryptocurrencies, displaying market prices,
 * and managing user's available balance.
 */
@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class TradeComponent implements OnInit, OnDestroy {
  /** Form group for managing trade input fields */
  tradeForm: FormGroup;

  /** Array of current market prices for different cryptocurrencies */
  marketPrices: MarketPrice[] = [];

  /** Currently selected cryptocurrency asset (default: 'BTC') */
  selectedAsset = 'BTC';

  /** Flag indicating if market prices are being loaded */
  isLoading = false;

  /** Flag indicating if a trade is being submitted */
  isSubmitting = false;

  /** Error message to display to the user */
  errorMessage = '';

  /** Success message to display to the user */
  successMessage = '';

  /** User's available balance for the selected asset */
  availableCryptoAmount = 0;

  /** Flag indicating if the component is in buy mode (true) or sell mode (false) */
  isBuyMode = true;

  /** User's available USD balance */
  availableUsdBalance = 0;

  /** Subject used for managing component lifecycle and unsubscribing from observables */
  private destroy$ = new Subject<void>();

  /** Timer subscription for auto-clearing messages */
  private messageTimer$ = new Subject<void>();

  /**
   * Creates an instance of TradeComponent.
   * @param fb - FormBuilder service for creating reactive forms
   * @param cryptoService - Service for handling cryptocurrency operations
   */
  constructor(
    private fb: FormBuilder,
    private cryptoService: CryptoService
  ) {
    this.tradeForm = this.fb.group({
      amount: ['', [
        Validators.required,
        Validators.min(0.00001),
        this.validateAmount.bind(this)
      ]],
      asset: ['BTC', Validators.required]
    });
  }

  /**
   * Lifecycle hook that is called after component initialization.
   * Loads market prices and available balance, and sets up asset selection subscription.
   */
  ngOnInit(): void {
    this.loadMarketPrices();
    this.loadAvailableBalance();
    this.loadUsdBalance();

    // React to asset selection changes
    this.tradeForm.get('asset')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.selectedAsset = value;
        this.loadAvailableBalance();
        this.tradeForm.get('amount')?.updateValueAndValidity();
      });

    this.tradeForm.get('amount')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Only update validation if the form is dirty or touched
        if (this.tradeForm.get('amount')?.dirty || this.tradeForm.get('amount')?.touched) {
          this.tradeForm.get('amount')?.updateValueAndValidity();
        }
      });
  }

  /**
   * Lifecycle hook that is called before component destruction.
   * Cleans up subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.messageTimer$.complete();
  }

  /**
   * Loads current market prices for cryptocurrencies.
   * Updates the marketPrices array and handles loading states.
   */
  loadMarketPrices(): void {
    this.isLoading = true;
    this.cryptoService.getMarketPrices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prices) => {
          this.marketPrices = prices;
          this.isLoading = false;
          this.tradeForm.get('amount')?.updateValueAndValidity();
        },
        error: (err) => {
          console.error('Error loading market prices', err);
          this.isLoading = false;
          this.setErrorMessage('Failed to load market prices. Please try again.');
        }
      });
  }

  /**
   * Loads the available balance for the selected cryptocurrency.
   * Updates the availableBalance property.
   */
  loadAvailableBalance(): void {
    this.cryptoService.getAvailableBalance(this.selectedAsset)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (balance) => {
          this.availableCryptoAmount = balance;
          this.tradeForm.get('amount')?.updateValueAndValidity();
        },
        error: (err) => {
          console.error('Error loading available balance', err);
          this.availableCryptoAmount = 0;
        }
      });
  }

  /**
   * Loads the user's available USD balance
   */
  loadUsdBalance(): void {
    this.cryptoService.getAvailableBalance('USDT')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (balance) => {
          this.availableUsdBalance = balance;
          this.tradeForm.get('amount')?.updateValueAndValidity();
        },
        error: (err) => {
          console.error('Error loading USD balance', err);
          this.availableUsdBalance = 0;
        }
      });
  }

  /**
   * Gets the current price for the selected cryptocurrency.
   * @returns The current price of the selected asset, or 0 if not found
   */
  getSelectedPrice(): number {
    const price = this.marketPrices.find(p =>
      p.symbol.startsWith(this.selectedAsset)
    );
    return price ? price.price : 0;
  }

  /**
   * Calculates the total value of the trade based on amount and current price.
   * @returns The total value of the trade
   */
  getTotal(): number {
    const amount = this.tradeForm.get('amount')?.value || 0;
    return amount * this.getSelectedPrice();
  }

  /**
   * Sets the trade amount to a percentage of the maximum available amount.
   * @param percentage - The percentage of the maximum amount to set (0-100)
   */
  setPercentage(percentage: number): void {
    let maxAmount: number;
    const price = this.getSelectedPrice();

    if (this.isBuyMode) {
      // In buy mode, calculate max amount based on USD balance
      // We need to calculate how much crypto we can buy with our USD
      maxAmount = this.availableUsdBalance / price;
    } else {
      // In sell mode, use available crypto amount directly
      maxAmount = this.availableCryptoAmount;
    }

    // Calculate the amount based on percentage
    const amount = maxAmount * (percentage / 100);

    // Round to 5 decimal places to avoid floating point issues
    const roundedAmount = Math.floor(amount * 100000) / 100000;

    // Ensure we don't set 0 if we have a balance
    if (roundedAmount === 0 && maxAmount > 0) {
      // If rounding resulted in 0 but we have a balance, use a small amount
      this.tradeForm.patchValue({ amount: 0.00001 });
    } else {
      this.tradeForm.patchValue({ amount: roundedAmount });
    }
  }

  /**
   * Toggles between buy and sell modes.
   * Updates the isBuyMode flag and reloads available balance.
   */
  toggleBuySell() {
    this.isBuyMode = !this.isBuyMode;
    this.tradeForm.patchValue({ amount: '' });
    this.loadAvailableBalance();
    this.loadUsdBalance();
  }

  /**
   * Sets an error message and automatically clears it after 5 seconds
   * @param message - The error message to display
   */
  private setErrorMessage(message: string): void {
    this.errorMessage = message;
    this.messageTimer$.next();
    timer(5000).pipe(takeUntil(this.messageTimer$)).subscribe(() => {
      this.errorMessage = '';
    });
  }

  /**
   * Sets a success message and automatically clears it after 5 seconds
   * @param message - The success message to display
   */
  private setSuccessMessage(message: string): void {
    this.successMessage = message;
    this.messageTimer$.next();
    timer(5000).pipe(takeUntil(this.messageTimer$)).subscribe(() => {
      this.successMessage = '';
    });
  }

  /**
   * Executes a trade operation (buy or sell) based on the form values.
   * Handles form validation, submission states, and success/error messages.
   */
  executeTrade(): void {
    if (this.tradeForm.invalid) {
      const amountControl = this.tradeForm.get('amount');
      if (amountControl?.errors?.['insufficientFunds']) {
        this.setErrorMessage(this.isBuyMode ?
          'Insufficient USD balance for this trade' :
          'Insufficient crypto balance for this trade');
      } else {
        this.setErrorMessage('Please enter a valid amount');
      }
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const tradeRequest: TradeRequest = {
      symbol: this.tradeForm.get('asset')?.value,
      amount: parseFloat(this.tradeForm.get('amount')?.value),
      action: this.isBuyMode ? 'buy' : 'sell'
    };

    this.cryptoService.executeTrade(tradeRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TradeResponse) => {
          this.isSubmitting = false;
          if (response.success) {
            this.setSuccessMessage(response.message || 'Trade executed successfully!');
            this.tradeForm.patchValue({ amount: '' });
            this.loadAvailableBalance();
            this.loadUsdBalance();
          } else {
            this.setErrorMessage(response.message || 'Trade failed. Please try again.');
          }
        },
        error: (err) => {
          console.error('Error executing trade', err);
          this.isSubmitting = false;
          this.setErrorMessage('Failed to execute trade. Please try again.');
        }
      });
  }

  private validateAmount(control: AbstractControl) {
    const amount = control.value;
    if (!amount) return null;

    const price = this.getSelectedPrice();
    const totalValue = amount * price;

    if (this.isBuyMode) {
      if (totalValue > this.availableUsdBalance) {
        return { insufficientFunds: true };
      }
    } else {
      if (amount > this.availableCryptoAmount) {
        return { insufficientFunds: true };
      }
    }

    return null;
  }
}

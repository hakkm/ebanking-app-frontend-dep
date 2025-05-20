import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CryptoService, MarketPrice } from '../../../../core/services/crypto.service';

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class TradeComponent implements OnInit {
  tradeForm: FormGroup;
  marketPrices: MarketPrice[] = [];
  selectedAsset = 'BTC';
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // For percentage buttons
  availableBtc = 0;

  constructor(
    private fb: FormBuilder,
    private cryptoService: CryptoService
  ) {
    this.tradeForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.00001)]],
      asset: ['BTC', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMarketPrices();
    this.availableBtc = 0; // This would be fetched from the backend

    // React to asset selection changes
    this.tradeForm.get('asset')?.valueChanges.subscribe(value => {
      this.selectedAsset = value;
    });
  }

  loadMarketPrices(): void {
    this.isLoading = true;
    this.cryptoService.getMarketPrices().subscribe({
      next: (prices) => {
        this.marketPrices = prices;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading market prices', err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load market prices. Please try again.';
      }
    });
  }

  getSelectedPrice(): number {
    const price = this.marketPrices.find(p =>
      p.symbol.startsWith(this.selectedAsset)
    );
    return price ? price.price : 0;
  }

  getTotal(): number {
    const amount = this.tradeForm.get('amount')?.value || 0;
    return amount * this.getSelectedPrice();
  }

  setPercentage(percentage: number): void {
    // In a real app, this would be calculated based on available balance
    // For demo purposes, we'll just set a fraction of max amount (1 BTC)
    const maxAmount = 1;
    const amount = (maxAmount * percentage / 100).toFixed(5);
    this.tradeForm.patchValue({ amount });
  }

  executeTrade(): void {
    if (this.tradeForm.invalid) {
      this.errorMessage = 'Please enter a valid amount';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const tradeRequest = {
      symbol: this.tradeForm.get('asset')?.value,
      amount: parseFloat(this.tradeForm.get('amount')?.value),
      action: 'buy'
    };

    // Comment out the actual API call in our mock implementation
    // this.cryptoService.executeTrade(tradeRequest).subscribe({
    //   next: (result) => {
    //     this.isSubmitting = false;
    //     if (result) {
    //       this.successMessage = 'Trade executed successfully!';
    //       this.tradeForm.patchValue({ amount: '' });
    //     } else {
    //       this.errorMessage = 'Trade failed. Please try again.';
    //     }
    //   },
    //   error: (err) => {
    //     console.error('Error executing trade', err);
    //     this.isSubmitting = false;
    //     this.errorMessage = 'Failed to execute trade. Please try again.';
    //   }
    // });

    // Mock implementation for demo
    setTimeout(() => {
      this.isSubmitting = false;
      this.successMessage = 'Trade executed successfully!';
      this.tradeForm.patchValue({ amount: '' });

      // Log the request that would be sent to the backend
      console.log('Trade request:', tradeRequest);
    }, 1000);
  }
}

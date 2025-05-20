import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {RouterOutlet} from '@angular/router';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-recharge',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule, RouterOutlet],
  templateUrl: './rechargetel.component.html',
  styleUrls: ['./rechargetel.component.css']
})
export class RechargeComponent {
  private apiUrl = environment.apiUrl;

  @Input() accounts: any[] = [];
  @Input() providers: any[] = [];
  @Output() rechargeSubmitted = new EventEmitter<void>();

  selectedAccountId: string = '';
  selectedProvider: string = '';
  amount: number | null = null;
  phoneNumber: string = '';
  loading = false;
  message: string | null = null;

  constructor(private http: HttpClient) {}

  submitRecharge(): void {
    if (!this.selectedAccountId || !this.selectedProvider || !this.amount || !this.phoneNumber) {
      this.message = 'All fields are required.';
      return;
    }
    console.log(this.selectedAccountId)

    console.log(this.selectedProvider)
    const payload = {
      accountId: this.selectedAccountId,
      provider: this.selectedProvider,
      amount: this.amount,
      phoneNumber: this.phoneNumber
    };

    this.loading = true;
    this.http.post(`${this.apiUrl}/recharge`, payload).subscribe({
      next: () => {
        console.log(payload)
        this.message = 'Recharge successful!';
        this.rechargeSubmitted.emit();
        this.loading = false;
      },
      error: () => {
        this.message = 'Recharge failed. Try again later.';
        this.loading = false;
      }
    });
  }
}

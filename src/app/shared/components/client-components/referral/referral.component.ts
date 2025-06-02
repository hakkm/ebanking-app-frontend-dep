import { Component, OnInit } from '@angular/core';
import { ReferralService } from '../../../../core/services/referral.service';
import { User } from '../../../../core/models/user.model';
import { CurrencyPipe, DatePipe, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.css'],
  standalone: true,
  imports: [
    DatePipe,
    NgIf,
    NgForOf,
    CurrencyPipe
  ]
})
export class ReferralComponent implements OnInit {
  user: User | null = null;
  referredUsers: User[] = [];
  error: string | null = null;

  constructor(private referralService: ReferralService) {}

  ngOnInit(): void {
    this.referralService.getReferralDetails().subscribe({
      next: (user) => this.user = user,
      error: (err) => this.error = 'Failed to load referral details'
    });

    this.referralService.getReferredUsers().subscribe({
      next: (users) => this.referredUsers = users,
      error: (err) => this.error = 'Failed to load referred users'
    });
  }

  copyReferralCode(): void {
    if (this.user?.referralCode) {
      navigator.clipboard.writeText(this.user.referralCode).then(() => {
        alert('Referral code copied to clipboard!');
      }).catch(() => {
        this.error = 'Failed to copy referral code';
      });
    }
  }

  protected readonly Math = Math;
}

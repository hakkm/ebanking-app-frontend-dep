import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class CryptoAccessService {
  private hasAccessSubject = new BehaviorSubject<boolean>(false);
  hasAccess$ = this.hasAccessSubject.asObservable();

  constructor(private accountService: AccountService) {
    this.checkAccess();
  }

  checkAccess(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.hasAccessSubject.next(accounts && accounts.length > 0);
      },
      error: () => {
        this.hasAccessSubject.next(false);
      }
    });
  }
}

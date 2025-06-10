import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountService } from '../services/account.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const accountGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const toastr = inject(ToastrService);

  return accountService.getAccounts().pipe(
    map(accounts => {
      if (accounts && accounts.length > 0) {
        return true;
      }
      toastr.error('You need to have an account to access this section', 'Access Denied', {
        positionClass: 'toast-bottom-right',
        progressBar: true,
        timeOut: 5000
      });
      return false;
    }),
    catchError(() => {
      toastr.error('You need to have an account to access this section', 'Access Denied', {
        positionClass: 'toast-bottom-right',
        progressBar: true,
        timeOut: 5000
      });
      return of(false);
    })
  );
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from './auth/services/auth.service';
import {TokenService} from './core/services/token.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.getToken();
  const user = authService.currentUserValue;

  if (token && user) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

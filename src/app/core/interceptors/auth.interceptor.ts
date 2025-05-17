import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const tokenService = inject(TokenService);
  const credentials = tokenService.getCredentials();
  if (credentials) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Basic ${credentials}`)
    });
    return next(cloned);
  }
  return next(req);
}

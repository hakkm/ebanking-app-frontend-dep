import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import {TokenService} from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Try to load current user from JWT on init
    const token = this.tokenService.getToken();
    if (token) {
      this.getCurrentUser().subscribe({
        error: () => {
          console.log('Failed to load user from token');
          this.logout(); // invalid token? force logout
        }
      });
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/public/login`, { email, password }).pipe(
      tap(response => {
        if (response.token) {
          this.tokenService.setToken(response.token);
        }
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/public/register`, user, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError)
    );
  }

  public getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/public/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        this.currentUserSubject.next(null);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/public/logout`, {}).pipe(
      tap(() => {
        this.tokenService.clearToken();
        this.currentUserSubject.next(null);
      }),
      catchError(this.handleError)
    );
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Request failed:', error);
    let errorMessage = 'An error occurred';
    if (error.status === 0) {
      errorMessage = 'Network error: Please check your connection or CORS configuration';
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials';
    }
    else if (error.status === 403) {
      errorMessage = 'Access denied: You do not have permission to access this resource';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found';
    } else if (error.status === 400) {
      errorMessage = 'Bad request: Please check your input';
    } else if (error.status === 409) {
      errorMessage = "Email or username already exists";
    } else if (error.status === 500) {
      errorMessage = 'Server error: Please try again later';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} - ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}

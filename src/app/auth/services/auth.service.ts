// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError, tap } from 'rxjs/operators';
// import { environment } from '../../../environments/environment';
// import { User } from '../models/user.model';
// import { TokenService } from '../../core/services/token.service';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private apiUrl = `${environment.apiUrl}/agent/users`;
//
//   constructor(private http: HttpClient, private tokenService: TokenService) {}
//
//   login(username: string, password: string): Observable<any> {
//     const headers = new HttpHeaders({
//       'Authorization': 'Basic ' + btoa(`${username}:${password}`)
//     });
//     return this.http.get(`${environment.apiUrl}/client/accounts`, { headers }).pipe(
//       tap(() => this.tokenService.setCredentials(username, password)),
//       catchError(error => {
//         console.error('Login failed:', error);
//         return throwError(() => new Error('Invalid credentials'));
//       })
//     );
//   }
//
//   register(user: User): Observable<User> {
//     return this.http.post<User>(this.apiUrl, user).pipe(
//       catchError(error => {
//         console.error('Registration failed:', error);
//         return throwError(() => new Error('Registration failed'));
//       })
//     );
//   }
// }



import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const credentials = btoa(`${username}:${password}`);
    return this.http.get(`${this.apiUrl}/client/accounts`, {
      headers: { Authorization: `Basic ${credentials}` }
    }).pipe(
      catchError(this.handleError)
    );
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/agent/users`, user, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Request failed:', error);
    let errorMessage = 'An error occurred';
    if (error.status === 0) {
      errorMessage = 'Network error: Please check your connection or CORS configuration';
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials';
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

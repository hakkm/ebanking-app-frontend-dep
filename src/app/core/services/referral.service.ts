import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getReferralDetails(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/client/referral`);
  }

  getReferredUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/client/referrals`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipient } from '../models/recipient.model';
import { recipientExternal } from '../models/recipientExternal.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecipientService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRecipients(): Observable<Recipient[]> {
    return this.http.get<Recipient[]>(`${this.apiUrl}/client/recipients`);
  }

  getRecipient(id: number): Observable<Recipient> {
    return this.http.get<Recipient>(`${this.apiUrl}/client/recipients/${id}`);
  }

  getExternalRecipients(): Observable<recipientExternal[]> {
    return this.http.get<recipientExternal[]>(`${this.apiUrl}/external-recipients`);
  }

  createRecipient(recipient: Recipient): Observable<Recipient> {
    return this.http.post<Recipient>(`${this.apiUrl}/client/recipients`, recipient);
  }

  createExternalRecipient(recipient: recipientExternal): Observable<recipientExternal> {
    return this.http.post<recipientExternal>(`${this.apiUrl}/external-recipients`, recipient);
  }

  updateRecipient(id: number, recipient: Recipient): Observable<Recipient> {
    return this.http.put<Recipient>(`${this.apiUrl}/client/recipients/${id}`, recipient);
  }

  deleteRecipient(id: number | undefined): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/client/recipients/${id}`);
  }

  deleteExternalRecipient(id: number | undefined): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/external-recipients/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';

export interface Notification {
  id: number;
  message: string;
  date?: string;
  isRead?: boolean;
  accountId: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupère les notifications pour un utilisateur donné.
   * @param username Le nom d'utilisateur pour lequel on veut les notifications.
   * @returns Observable d'une liste de notifications.
   */
  getNotifications(username: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications/${username}`);
  }
  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/notifications/delete/${id}`);
  }
}

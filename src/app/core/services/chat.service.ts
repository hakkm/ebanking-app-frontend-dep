import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import {environment} from '../../../environments/environment';

export interface ChatRequest {
  memoryId: string;
  message: string;
  language: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = environment.apiUrl;
  private sessionIdSubject = new BehaviorSubject<string | null>(null);
  public sessionId$ = this.sessionIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  startNewSession(): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/chat/new-session`);
  }

  sendMessage(request: ChatRequest): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/chat/message`, request, {
      responseType: 'text' as 'json'
    });
  }

  endSession(memoryId: string): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/chat/session/${memoryId}`, {
      responseType: 'text' as 'json'
    });
  }

  setSessionId(sessionId: string) {
    this.sessionIdSubject.next(sessionId);
  }

  getSessionId(): string | null {
    return this.sessionIdSubject.value;
  }
}

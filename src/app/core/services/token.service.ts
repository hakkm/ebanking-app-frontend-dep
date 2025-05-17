import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private credentialsKey = 'auth_credentials';

  setCredentials(username: string, password: string): void {
    const credentials = btoa(`${username}:${password}`);
    localStorage.setItem(this.credentialsKey, credentials);
  }

  getCredentials(): string | null {
    return localStorage.getItem(this.credentialsKey);
  }

  clearCredentials(): void {
    localStorage.removeItem(this.credentialsKey);
  }
}

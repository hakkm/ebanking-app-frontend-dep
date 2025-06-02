import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FaceRecognitionService {
  private apiUrl = environment.compreFaceApiUrl;
  private apiKey = environment.compreFaceApiKey;

  constructor(private http: HttpClient) {}

  enrollFace(email: string, image: string): Observable<any> {
    const formData = new FormData();
    const blob = this.dataURItoBlob(image);
    formData.append('file', blob, 'face.jpg');
    formData.append('subject', email);

    return this.http.post(`${this.apiUrl}/faces`, formData, {
      headers: { 'x-api-key': this.apiKey }
    }).pipe(
      catchError(this.handleError)
    );
  }

  verifyFace(email: string, image: string): Observable<any> {
    const formData = new FormData();
    const blob = this.dataURItoBlob(image);
    formData.append('file', blob, 'face.jpg');

    return this.http.post(`${this.apiUrl}/recognize`, formData, {
      headers: { 'x-api-key': this.apiKey }
    }).pipe(
      catchError(this.handleError)
    );
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.status === 0) {
      errorMessage = 'Network error: Please check your connection';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized: Invalid API key';
    } else if (error.status === 400) {
      errorMessage = 'Bad request: Invalid image data';
    }
    return throwError(() => new Error(errorMessage));
  }
}

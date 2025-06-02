import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../core/services/token.service';

declare var Webcam: any;

@Component({
  selector: 'app-face-verification',
  templateUrl: './face-verification.component.html',
  styleUrls: ['./face-verification.component.css']
})
export class FaceVerificationComponent implements AfterViewInit {
  email: string | null = null;
  tempToken: string | null = null;
  photo: string | null = null;
  error: string | null = null;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService,
    private toastr: ToastrService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.email = navigation.extras.state['email'];
      this.tempToken = navigation.extras.state['tempToken'];
    }
    if (!this.email || !this.tempToken) {
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit(): void {
    Webcam.set({
      width: 320,
      height: 240,
      image_format: 'jpeg',
      jpeg_quality: 90
    });
    Webcam.attach('#webcam');
  }

  capturePhoto(): void {
    Webcam.snap((data_uri: string) => {
      this.photo = data_uri;
      this.error = null;
    });
  }

  verifyFace(): void {
    if (!this.photo || !this.email || !this.tempToken) {
      this.error = 'Please capture a photo';
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    const blob = this.dataURItoBlob(this.photo);
    formData.append('file', blob, 'face.jpg');

    this.http.post(`${environment.apiUrl}/public/verify-face`, formData, {
      headers: { 'Authorization': `Bearer ${this.tempToken}` }
    }).subscribe({
      next: (response: any) => {
        this.tokenService.setToken(response.token);
        this.toastr.success('Face verification successful! Welcome back.', '', {
          positionClass: 'toast-bottom-right',
          progressBar: true,
          timeOut: 3000
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err : any) => {
        this.error = err.message || 'Face verification failed. Please try again.';
        this.toastr.error(this.error  || undefined, '', {
          positionClass: 'toast-bottom-right',
          progressBar: true,
          timeOut: 5000
        });
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/login']);
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
}

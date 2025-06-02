import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FaceRecognitionService } from '../../../core/services/face-recognition.service';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

declare var Webcam: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  user: User = { username: '', password: '', email: '', role: { name: 'CLIENT' }, phone: '' };
  error: string | null = null;
  photoError: string | null = null;
  isLoading: boolean = false;
  agreeToTerms: boolean = false;
  passwordStrength: number = 0;
  passwordFeedback: string = '';
  photos: string[] = [];
  hidePassword: boolean = true;

  constructor(
    private authService: AuthService,
    private faceRecognitionService: FaceRecognitionService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const referralCode = this.route.snapshot.queryParamMap.get('ref');
    if (referralCode) {
      console.log(referralCode);
      this.user.referredBy = referralCode;
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

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  checkPasswordStrength(password: string): void {
    this.passwordStrength = 0;

    if (!password) {
      this.passwordFeedback = '';
      return;
    }

    if (password.length >= 6) this.passwordStrength += 25;
    if (/[A-Z]/.test(password)) this.passwordStrength += 25;
    if (/[0-9]/.test(password)) this.passwordStrength += 25;
    if (/[^A-Za-z0-9]/.test(password)) this.passwordStrength += 25;

    if (this.passwordStrength <= 25) {
      this.passwordFeedback = 'Weak';
    } else if (this.passwordStrength <= 50) {
      this.passwordFeedback = 'Fair';
    } else if (this.passwordStrength <= 75) {
      this.passwordFeedback = 'Good';
    } else {
      this.passwordFeedback = 'Strong';
    }
  }

  onPasswordChange(): void {
    this.checkPasswordStrength(this.user.password);
  }

  capturePhoto(): void {
    if (this.photos.length >= 5) {
      this.photoError = 'Maximum 5 photos allowed';
      return;
    }

    Webcam.snap((data_uri: string) => {
      this.photos.push(data_uri);
      this.photoError = null;
    });
  }

  resetPhotos(): void {
    this.photos = [];
    this.photoError = null;
  }

  onSubmit(): void {
    this.error = null;
    this.photoError = null;
    this.isLoading = true;

    if (!this.agreeToTerms) {
      this.error = 'You must agree to the terms and conditions';
      this.isLoading = false;
      return;
    }

    if (this.photos.length < 5) {
      this.photoError = 'Please capture 5 face photos';
      this.isLoading = false;
      return;
    }

    // Register user
    this.authService.register(this.user).subscribe({
      next: () => {
        // Enroll face photos
        let enrollCount = 0;
        this.photos.forEach(photo => {
          this.faceRecognitionService.enrollFace(this.user.email, photo).subscribe({
            next: () => {
              enrollCount++;
              if (enrollCount === this.photos.length) {
                this.toastr.success('Registration and face enrollment successful! Please login.', '', {
                  positionClass: 'toast-bottom-right',
                  progressBar: true,
                  timeOut: 3000
                });
                this.router.navigate(['/login']);
                this.isLoading = false;
              }
            },
            error: (err : any) => {
              this.error = err.message || 'Face enrollment failed. Please try again.';
              this.toastr.error(this.error || undefined, '', {
                positionClass: 'toast-bottom-right',
                progressBar: true,
                timeOut: 5000
              });
              this.isLoading = false;
            }
          });
        });
      },
      error: (err : any) => {
        this.error = err.message || 'Registration failed. Please try again.';
        this.toastr.error(this.error || undefined, '', {
          positionClass: 'toast-bottom-right',
          progressBar: true,
          timeOut: 5000
        });
        this.isLoading = false;
      }
    });
  }
}

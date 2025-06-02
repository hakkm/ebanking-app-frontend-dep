import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string | null = null;
  isLoading: boolean = false;
  rememberMe: boolean = false;
  hidePassword: boolean = true;
  showFaceVerification: boolean = false;
  tempToken: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    this.error = null;
    this.isLoading = true;

    if (!this.validateEmail(this.email)) {
      this.error = 'Please enter a valid email address';
      this.isLoading = false;
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (response :any) => {
        this.tempToken = response.token;
        this.showFaceVerification = true;
        this.toastr.success('Password verified. Please proceed to face verification.', '', {
          positionClass: 'toast-bottom-right',
          progressBar: true,
          timeOut: 3000
        });
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = err.message || 'Authentication failed. Please try again.';
        this.toastr.error(this.error || undefined, '', {
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

  proceedToFaceVerification(): void {
    if (this.tempToken) {
      this.router.navigate(['/face-verification'], { state: { email: this.email, tempToken: this.tempToken } });
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}

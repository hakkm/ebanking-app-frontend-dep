import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user: User = { username: '', password: '', email: '', role: {name: 'CLIENT'}, phone: '' };
  error: string | null = null;
  isLoading: boolean = false;
  agreeToTerms: boolean = false;
  passwordStrength: number = 0;
  passwordFeedback: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

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

  onSubmit(): void {
    this.error = null;
    this.isLoading = true;

    if (!this.agreeToTerms) {
      this.error = 'You must agree to the terms and conditions';
      this.isLoading = false;
      return;
    }

    this.authService.register(this.user).subscribe({
      next: () => {
        this.toastr.success('Registration successful! Please login.', '', {
          positionClass: 'toast-bottom-right',
          progressBar: true,
          timeOut: 3000
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.message || 'Registration failed. Please try again.';
        // @ts-ignore
        this.toastr.error(this.error, '', {
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
}

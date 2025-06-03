import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import {CommonModule} from '@angular/common';
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

    // Optional: Add validation before submitting
    if (!this.validateEmail(this.email)) {
      this.error = 'Please enter a valid email address';
      this.isLoading = false;
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.toastr.success('Login successful!', '', {
          positionClass: 'toast-bottom-right',
          progressBar: true,
          timeOut: 3000
        });
        console.log("Login successful");
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.message || 'Authentication failed. Please try again.';
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

  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
